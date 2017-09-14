import * as ts from 'typescript'

import {
  FieldDefinition,
  UnionDefinition,
} from '@creditkarma/thrift-parser'

import {
  IIdentifierMap
} from '../types'

import {
  createClassConstructor,
  createConstStatement,
  createEquals,
  createFunctionParameter,
  createLetStatement,
  createNotNull,
  createPublicMethod,
  propertyAccessForIdentifier,
  throwProtocolException,
} from './utils'

import {
  createNumberType,
  createVoidType,
  thriftPropertyAccessForFieldType,
} from './types'

import {
  assignmentForField,
  createArgsParameterForStruct,
  createFieldsForStruct,
  createSkipBlock,
  createWriteMethod,
  fieldMetadataType,
  readFieldBegin,
  readFieldEnd,
  readStructBegin,
  readStructEnd,
  readValueForFieldType,
  throwForField,
} from './struct'

import {
  COMMON_IDENTIFIERS,
} from './identifiers'

const INCREMENTER: string = 'fieldsSet'

/**
 * There is a lot of duplication here of code with renderStruct. Need to revisit and clean this up.
 * Probably revisit how functions are defined in the struct rendering code so that it is easier
 * to insert instrumentation for Unions.
 */
export function renderUnion(node: UnionDefinition, identifiers: IIdentifierMap): ts.ClassDeclaration {
  const fields: Array<ts.PropertyDeclaration> = createFieldsForStruct(node)

  /**
   * After creating the properties on our class for the struct fields we must create
   * a constructor that knows how to assign these values based on a passed args.
   *
   * The constructor will take one arguments 'args'. This argument will be an object
   * of an interface matching the struct definition. This interface is built by another
   * function in src/render/interface
   *
   * The interface follows the naming convention of 'I<struct name>'
   *
   * If a required argument is not on the passed 'args' argument we need to throw on error.
   * Optional fields we must allow to be null or undefined.
   */
  const fieldAssignments: Array<ts.IfStatement> = node.fields.map(createFieldAssignment)

  /**
   * Field assignments rely on there being an args argument passed in. We need to wrap
   * field assignments in a conditional to check for the existance of args
   *
   * if (args != null) {
   *   ...fieldAssignments
   * }
   */
  const isArgsNull: ts.BinaryExpression = createNotNull('args')
  const argsCheckWithAssignments: ts.IfStatement = ts.createIf(
    isArgsNull, // condition
    ts.createBlock([
      ...fieldAssignments,
      createFieldValidation(),
    ], true), // then
    undefined, // else
  )

  const argsParameter: ts.ParameterDeclaration = createArgsParameterForStruct(node)

  // let fieldsSet: number = 0;
  const fieldsSet: ts.VariableStatement = createFieldIncrementer()

  // Build the constructor body
  const ctor: ts.ConstructorDeclaration = createClassConstructor(
    [ argsParameter ],
    [ fieldsSet, argsCheckWithAssignments ],
  )

  // Build the `read` method
  const readMethod: ts.MethodDeclaration = createReadMethod(node, identifiers)

  // Build the `write` method
  const writeMethod: ts.MethodDeclaration = createWriteMethod(node, identifiers)

  // export class <node.name> { ... }
  return ts.createClassDeclaration(
    undefined, // decorators
    [ ts.createToken(ts.SyntaxKind.ExportKeyword) ], // modifiers
    node.name.value, // name
    [], // type parameters
    [], // heritage
    [ ...fields, ctor, writeMethod, readMethod ], // body
  )
}

/**
 * Assign field if contained in args:
 *
 * if (args && args.<field.name> != null) {
 *   this.<field.name> = args.<field.name>
 * }
 *
 * If field is required throw an error:
 *
 * else {
 *   throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, 'Required field {{fieldName}} is unset!')
 * }
 */
function createFieldAssignment(field: FieldDefinition): ts.IfStatement {
  const comparison: ts.BinaryExpression = createNotNull(`args.${field.name.value}`)
  const thenAssign: ts.ExpressionStatement = assignmentForField(field)
  const incrementer: ts.ExpressionStatement = incrementFieldsSet()
  const elseThrow: ts.ThrowStatement | undefined = throwForField(field)

  return ts.createIf(
    comparison,
    ts.createBlock([ incrementer, thenAssign ], true),
    (elseThrow !== undefined) ? ts.createBlock([ elseThrow ], true) : undefined,
  )
}

function createReadMethod(struct: UnionDefinition, identifiers: IIdentifierMap): ts.MethodDeclaration {
  // const fieldWrites: Array<ts.IfStatement> = struct.fields.map((field) => createWriteForField(struct, field))
  const inputParameter: ts.ParameterDeclaration = createFunctionParameter(
    'input', // param name
    ts.createTypeReferenceNode('TProtocol', undefined), // param type
  )

  // let fieldsSet: number = 0;
  const fieldsSet: ts.VariableStatement = createFieldIncrementer()

  /**
   * cosnt ret: { fname: string; ftype: Thrift.Type; fid: number; } = input.readFieldBegin()
   * const ftype: Thrift.Type = ret.ftype
   * const fid: number = ret.fid
   */
  const ret: ts.VariableStatement = createConstStatement('ret', fieldMetadataType(), readFieldBegin())
  const ftype: ts.VariableStatement = createConstStatement('ftype', ts.createTypeReferenceNode('Thrift.Type', undefined), propertyAccessForIdentifier('ret', 'ftype'))
  const fid: ts.VariableStatement = createConstStatement('fid', createNumberType(), propertyAccessForIdentifier('ret', 'fid'))

  /**
   * if (ftype === Thrift.Type.STOP) {
   *     break;
   * }
   */
  const checkStop: ts.IfStatement = ts.createIf(
    createEquals(COMMON_IDENTIFIERS.ftype, ts.createIdentifier('Thrift.Type.STOP')),
    ts.createBlock([
      ts.createBreak(),
    ], true),
  )

  const caseStatements: Array<ts.CaseClause> = struct.fields.map((field: FieldDefinition) => {
    return createCaseForField(field, identifiers)
  })

  /**
   * switch (fid) {
   *   ...caseStatements
   * }
   */
  const switchStatement: ts.SwitchStatement = ts.createSwitch(
    COMMON_IDENTIFIERS.fid, // what to switch on
    ts.createCaseBlock([
      ...caseStatements,
      ts.createDefaultClause([
        createSkipBlock(),
      ]),
    ]),
  )

  const whileBlock: ts.Block = ts.createBlock([
    ret,
    ftype,
    fid,
    checkStop,
    switchStatement,
    ts.createStatement(readFieldEnd()),
  ], true)
  const whileLoop: ts.WhileStatement = ts.createWhile(ts.createLiteral(true), whileBlock)

  return createPublicMethod(
    'read', // Method name
    [ inputParameter ], // Method parameters
    createVoidType(), // Method return type
    [
      fieldsSet,
      readStructBegin(),
      whileLoop,
      readStructEnd(),
      createFieldValidation(),
    ], // Method body statements
  )
}

/**
 * EXAMPLE
 *
 * case 1: {
 *   if (ftype === Thrift.Type.I32) {
 *     this.id = input.readI32();
 *   }
 *   else {
 *     input.skip(ftype);
 *   }
 *   break;
 * }
 *
 * @param field
 */
export function createCaseForField(field: FieldDefinition, identifiers: IIdentifierMap): ts.CaseClause {
  const checkType: ts.IfStatement = ts.createIf(
    createEquals(
      COMMON_IDENTIFIERS['ftype'],
      thriftPropertyAccessForFieldType(field.fieldType, identifiers)
    ),
    ts.createBlock([
      incrementFieldsSet(),
        ...readValueForFieldType(
          field.fieldType,
          ts.createIdentifier(`this.${field.name.value}`),
          identifiers
        ),
    ],true),
    createSkipBlock()
  )

  return ts.createCaseClause(
    ts.createLiteral(field.fieldID.value),
    [
      checkType,
      ts.createBreak()
    ]
  )
}

/**
 * if (fieldsSet > 1) {
 *   throw new Thrift.TProtocolException(TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with more than one set value!");
 * }
 * else if (fieldsSet < 1) {
 *   throw new Thrift.TProtocolException(TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with no set value!");
 * }
 */
export function createFieldValidation(): ts.IfStatement {
  return ts.createIf(
    ts.createBinary(
      ts.createIdentifier(INCREMENTER),
      ts.SyntaxKind.GreaterThanToken,
      ts.createLiteral(1),
    ),
    ts.createBlock([
      throwProtocolException(
        'TProtocolExceptionType.INVALID_DATA',
        'Cannot read a TUnion with more than one set value!',
      ),
    ], true),
    ts.createIf(
      ts.createBinary(
        ts.createIdentifier(INCREMENTER),
        ts.SyntaxKind.LessThanToken,
        ts.createLiteral(1),
      ),
      ts.createBlock([
        throwProtocolException(
          'TProtocolExceptionType.INVALID_DATA',
          'Cannot read a TUnion with no set value!',
        ),
      ], true),
    ),
  )
}

// let fieldsSet: number = 0;
export function createFieldIncrementer(): ts.VariableStatement {
  return createLetStatement(
    INCREMENTER,
    createNumberType(),
    ts.createLiteral(0),
  )
}

// fieldsSet++;
export function incrementFieldsSet(): ts.ExpressionStatement {
  return ts.createStatement(ts.createPostfixIncrement(ts.createIdentifier(INCREMENTER)))
}
