import {
  BinaryExpression,
  Block,
  CaseClause,
  ClassDeclaration,
  ConstructorDeclaration,
  createBinary,
  createBlock,
  createBreak,
  createCaseBlock,
  createCaseClause,
  createClassDeclaration,
  createDefaultClause,
  createIdentifier,
  createIf,
  createLiteral,
  createPostfixIncrement,
  createStatement,
  createSwitch,
  createToken,
  createTypeReferenceNode,
  createWhile,
  ExpressionStatement,
  IfStatement,
  MethodDeclaration,
  ParameterDeclaration,
  PropertyDeclaration,
  SwitchStatement,
  SyntaxKind,
  ThrowStatement,
  VariableStatement,
  WhileStatement,
} from 'typescript'

import {
  FieldDefinition,
  UnionDefinition,
} from '@creditkarma/thrift-parser'

import {
  createClassConstructor,
  createConstStatement,
  createEquals,
  createFunctionParameter,
  createLetStatement,
  createNotNull,
  createProtocolException,
  createPublicMethod,
  propertyAccessForIdentifier,
} from './utils'

import {
  createNumberType,
  createStringType,
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

export function renderUnion(node: UnionDefinition): ClassDeclaration {
  const fields: Array<PropertyDeclaration> = createFieldsForStruct(node)

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
  const fieldAssignments: Array<IfStatement> = node.fields.map(createFieldAssignment)

  /**
   * Field assignments rely on there being an args argument passed in. We need to wrap
   * field assignments in a conditional to check for the existance of args
   *
   * if (args != null) {
   *   ...fieldAssignments
   * }
   */
  const isArgsNull: BinaryExpression = createNotNull('args')
  const argsCheckWithAssignments: IfStatement = createIf(
    isArgsNull, // condition
    createBlock([
      ...fieldAssignments,
      createFieldValidation(),
    ], true), // then
    undefined, // else
  )

  const argsParameter: ParameterDeclaration = createArgsParameterForStruct(node)

  // let fieldsSet: number = 0;
  const fieldsSet: VariableStatement = createFieldIncrementer()

  // Build the constructor body
  const ctor: ConstructorDeclaration = createClassConstructor(
    [ argsParameter ],
    [ fieldsSet, argsCheckWithAssignments ],
  )

  // Build the `read` method
  const readMethod: MethodDeclaration = createReadMethod(node)

  // Build the `write` method
  const writeMethod: MethodDeclaration = createWriteMethod(node)

  // export class <node.name> { ... }
  return createClassDeclaration(
    undefined, // decorators
    [ createToken(SyntaxKind.ExportKeyword) ], // modifiers
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
function createFieldAssignment(field: FieldDefinition): IfStatement {
  // Map is supposed to use Thrift.copyMap but that doesn't work if we use something better than an object
  // Set/List is supposed to use Thrift.copyList but the implementation is weird and might not work
  // when combined with the custom Map copying
  // TODO: should we perform a deep clone? Currently shallow but not sure if deep cloning is actually needed
  const comparison: BinaryExpression = createNotNull(`args.${field.name.value}`)
  const thenAssign: ExpressionStatement = assignmentForField(field)
  const incrementer: ExpressionStatement = incrementFieldsSet()
  const elseThrow: ThrowStatement = throwForField(field)

  return createIf(
    comparison,
    createBlock([ incrementer, thenAssign ], true),
    (elseThrow !== undefined) ? createBlock([ elseThrow ], true) : undefined,
  )
}

function createReadMethod(struct: UnionDefinition): MethodDeclaration {
  // const fieldWrites: Array<IfStatement> = struct.fields.map((field) => createWriteForField(struct, field))
  const inputParameter: ParameterDeclaration = createFunctionParameter(
    'input', // param name
    createTypeReferenceNode('TProtocol', undefined), // param type
  )

  // let fieldsSet: number = 0;
  const fieldsSet: VariableStatement = createFieldIncrementer()

  /**
   * cosnt ret: { fname: string; ftype: Thrift.Type; fid: number; } = input.readFieldBegin()
   * const fname: string = ret.fname
   * const ftype: Thrift.Type = ret.ftype
   * const fid: number = ret.fid
   */
  const ret: VariableStatement = createConstStatement('ret', fieldMetadataType(), readFieldBegin())
  const fname: VariableStatement = createConstStatement('fname', createStringType(), propertyAccessForIdentifier('ret', 'fname'))
  const ftype: VariableStatement = createConstStatement('ftype', createTypeReferenceNode('Thrift.Type', undefined), propertyAccessForIdentifier('ret', 'ftype'))
  const fid: VariableStatement = createConstStatement('fid', createNumberType(), propertyAccessForIdentifier('ret', 'fid'))

  /**
   * if (ftype === Thrift.Type.STOP) {
   *     break;
   * }
   */
  const checkStop: IfStatement = createIf(
    createEquals(COMMON_IDENTIFIERS.ftype, createIdentifier('Thrift.Type.STOP')),
    createBlock([
      createBreak(),
    ], true),
  )

  const caseStatements: Array<CaseClause> = struct.fields.map(createCaseForField)

  /**
   * switch (fid) {
   *   ...caseStatements
   * }
   */
  const switchStatement: SwitchStatement = createSwitch(
    COMMON_IDENTIFIERS.fid, // what to switch on
    createCaseBlock([
      ...caseStatements,
      createDefaultClause([
        createSkipBlock(),
      ]),
    ]),
  )

  const whileBlock: Block = createBlock([
    ret,
    fname,
    ftype,
    fid,
    checkStop,
    switchStatement,
    createStatement(readFieldEnd()),
  ], true)
  const whileLoop: WhileStatement = createWhile(createLiteral(true), whileBlock)

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
export function createCaseForField(field: FieldDefinition): CaseClause {
  const checkType: IfStatement = createIf(
    createEquals(COMMON_IDENTIFIERS.ftype, thriftPropertyAccessForFieldType(field.fieldType)),
    createBlock([
      incrementFieldsSet(),
      ...readValueForFieldType(field.fieldType, createIdentifier(`this.${field.name.value}`)),
    ], true),
    createSkipBlock(),
  )

  return createCaseClause(
    createLiteral(field.fieldID.value),
    [ checkType, createBreak() ],
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
export function createFieldValidation(): IfStatement {
  return createIf(
    createBinary(
      createIdentifier(INCREMENTER),
      SyntaxKind.GreaterThanToken,
      createLiteral(1),
    ),
    createBlock([
      createProtocolException(
        'TProtocolExceptionType.INVALID_DATA',
        'Cannot read a TUnion with more than one set value!',
      ),
    ], true),
    createIf(
      createBinary(
        createIdentifier(INCREMENTER),
        SyntaxKind.LessThanToken,
        createLiteral(1),
      ),
      createBlock([
        createProtocolException(
          'TProtocolExceptionType.INVALID_DATA',
          'Cannot read a TUnion with no set value!',
        ),
      ], true),
    ),
  )
}

// let fieldsSet: number = 0;
export function createFieldIncrementer(): VariableStatement {
  return createLetStatement(
    INCREMENTER,
    createNumberType(),
    createLiteral(0),
  )
}

// fieldsSet++;
export function incrementFieldsSet(): ExpressionStatement {
  return createStatement(createPostfixIncrement(createIdentifier(INCREMENTER)))
}
