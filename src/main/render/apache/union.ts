import * as ts from 'typescript'

import {
    FieldDefinition,
    UnionDefinition,
    SyntaxType,
} from '@creditkarma/thrift-parser'

import {
    IIdentifierMap
} from '../../types'

import {
    throwProtocolException,
} from './utils'

import {
    thriftTypeForFieldType,
} from './types'

import {
    createFunctionParameter,
    createClassConstructor,
    createConstStatement,
    createEquals,
    createLetStatement,
    createNotNullCheck,
    propertyAccessForIdentifier,
} from '../shared/utils'

import {
    createNumberType,
    typeNodeForFieldType,
} from '../shared/types'

import {
    createArgsParameterForStruct,
} from '../shared/struct'

import {
    assignmentForField,
    createInputParameter,
    createFieldsForStruct,
    createSkipBlock,
    createWriteMethod,
    readFieldBegin,
    readFieldEnd,
    readStructBegin,
    readStructEnd,
    readValueForFieldType,
    throwForField,
} from './struct'

import {
    COMMON_IDENTIFIERS,
    THRIFT_TYPES,
} from './identifiers'

const INCREMENTER: string = '_fieldsSet'
const RETURN_NAME: string = '_returnValue'

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
  const isArgsNull: ts.BinaryExpression = createNotNullCheck('args')
  const argsCheckWithAssignments: ts.IfStatement = ts.createIf(
    isArgsNull, // condition
    ts.createBlock([
      ...fieldAssignments,
      createFieldValidation(node),
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

  const factories: Array<ts.MethodDeclaration> = createUnionFactories(node, identifiers)

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
    [
      ...fields,
      ctor,
      ...factories,
      writeMethod,
      readMethod
    ], // body
  )
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function createFactoryNameForField(field: FieldDefinition): string {
  return `from${capitalize(field.name.value)}`
}

function createUnionFactories(node: UnionDefinition, identifiers: IIdentifierMap): Array<ts.MethodDeclaration> {
  return node.fields.map((next: FieldDefinition): ts.MethodDeclaration => {
    return ts.createMethod(
      undefined,
      [
        ts.createToken(ts.SyntaxKind.PublicKeyword),
        ts.createToken(ts.SyntaxKind.StaticKeyword)
      ],
      undefined,
      ts.createIdentifier(createFactoryNameForField(next)),
      undefined,
      undefined,
      [
        createFunctionParameter(
          ts.createIdentifier(next.name.value),
          typeNodeForFieldType(next.fieldType)
        )
      ],
      ts.createTypeReferenceNode(
        ts.createIdentifier(node.name.value),
        undefined
      ),
      ts.createBlock([
        ts.createReturn(
          ts.createNew(
            ts.createIdentifier(node.name.value),
            undefined,
            [
              ts.createObjectLiteral([
                ts.createShorthandPropertyAssignment(next.name.value)
              ])
            ]
          )
        )
      ], true),
    )
  })
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
    const comparison: ts.BinaryExpression = createNotNullCheck(`args.${field.name.value}`)
    const thenAssign: ts.Statement = assignmentForField(field)
    const incrementer: ts.ExpressionStatement = incrementFieldsSet()
    const elseThrow: ts.ThrowStatement | undefined = throwForField(field)

    return ts.createIf(
        comparison,
        ts.createBlock([ incrementer, thenAssign ], true),
        (elseThrow !== undefined) ? ts.createBlock([ elseThrow ], true) : undefined,
    )
}

function createReadMethod(node: UnionDefinition, identifiers: IIdentifierMap): ts.MethodDeclaration {
  const inputParameter: ts.ParameterDeclaration = createInputParameter()
  const returnVariable: ts.VariableStatement = createLetStatement(
    ts.createIdentifier(RETURN_NAME),
    ts.createUnionTypeNode([
      ts.createTypeReferenceNode(
        ts.createIdentifier(node.name.value),
        undefined,
      ),
      ts.createNull(),
    ]),
    ts.createNull()
  )

  // let fieldsSet: number = 0;
  const fieldsSet: ts.VariableStatement = createFieldIncrementer()

  // cosnt ret: { fieldName: string; fieldType: Thrift.Type; fieldId: number; } = input.readFieldBegin()
  const ret: ts.VariableStatement = createConstStatement(
    'ret',
    ts.createTypeReferenceNode(
      COMMON_IDENTIFIERS.TField,
      undefined,
    ),
    readFieldBegin()
  )

  // const fieldType: Thrift.Type = ret.fieldType
  const fieldType: ts.VariableStatement = createConstStatement(
    'fieldType',
    ts.createTypeReferenceNode(COMMON_IDENTIFIERS.Thrift_Type, undefined),
    propertyAccessForIdentifier('ret', 'ftype')
  )

  //const fieldId: number = ret.fieldId
  const fieldId: ts.VariableStatement = createConstStatement(
    'fieldId',
    createNumberType(),
    propertyAccessForIdentifier('ret', 'fid')
  )

  /**
   * if (fieldType === Thrift.Type.STOP) {
   *     break;
   * }
   */
  const checkStop: ts.IfStatement = ts.createIf(
    createEquals(COMMON_IDENTIFIERS.fieldType, THRIFT_TYPES.STOP),
    ts.createBlock([
      ts.createBreak(),
    ], true),
  )

  const caseStatements: Array<ts.CaseClause> = node.fields.map((field: FieldDefinition) => {
    return createCaseForField(node, field, identifiers)
  })

  /**
   * switch (fieldId) {
   *   ...caseStatements
   * }
   */
  const switchStatement: ts.SwitchStatement = ts.createSwitch(
    COMMON_IDENTIFIERS.fieldId, // what to switch on
    ts.createCaseBlock([
      ...caseStatements,
      ts.createDefaultClause([
        createSkipBlock(),
      ]),
    ]),
  )

  const whileBlock: ts.Block = ts.createBlock([
    ret,
    fieldType,
    fieldId,
    checkStop,
    switchStatement,
    readFieldEnd(),
  ], true)
  const whileLoop: ts.WhileStatement = ts.createWhile(ts.createLiteral(true), whileBlock)

  return ts.createMethod(
    undefined,
    [
      ts.createToken(ts.SyntaxKind.PublicKeyword),
      ts.createToken(ts.SyntaxKind.StaticKeyword),
    ],
    undefined,
    ts.createIdentifier('read'),
    undefined,
    undefined,
    [ inputParameter ],
    ts.createTypeReferenceNode(
      ts.createIdentifier(node.name.value),
      undefined,
    ), // return type
    ts.createBlock([
      fieldsSet,
      returnVariable,
      readStructBegin(),
      whileLoop,
      readStructEnd(),
      createFieldValidation(node, true),
      ts.createIf(
        ts.createBinary(
          ts.createIdentifier(RETURN_NAME),
          ts.SyntaxKind.ExclamationEqualsEqualsToken,
          ts.createNull()
        ),
        ts.createBlock([
          ts.createReturn(
            ts.createIdentifier(RETURN_NAME)
          ),
        ], true),
        ts.createBlock([
          throwProtocolException(
            'UNKNOWN',
            'Unable to read data for TUnion',
          ),
        ], true)
      )
    ], true),
  )
}

/**
 * EXAMPLE
 *
 * case 1: {
 *   if (fieldType === Thrift.Type.I32) {
 *     this.id = input.readI32();
 *   }
 *   else {
 *     input.skip(fieldType);
 *   }
 *   break;
 * }
 *
 * @param field
 */
export function createCaseForField(node: UnionDefinition, field: FieldDefinition, identifiers: IIdentifierMap): ts.CaseClause {
  const fieldAlias: ts.Identifier = ts.createUniqueName('value')
  const checkType: ts.IfStatement = ts.createIf(
    createEquals(
      COMMON_IDENTIFIERS.fieldType,
      thriftTypeForFieldType(field.fieldType, identifiers)
    ),
    ts.createBlock([
      incrementFieldsSet(),
      ...readValueForFieldType(
        field.fieldType,
        fieldAlias,
        identifiers
      ),
      ...endReadForField(node, fieldAlias, field)
    ], true),
    createSkipBlock()
  )

  if (field.fieldID !== null) {
    return ts.createCaseClause(
      ts.createLiteral(field.fieldID.value),
      [
        checkType,
        ts.createBreak()
      ]
    )
  } else {
    throw new Error(`FieldID on line ${field.loc.start.line} is null`)
  }
}

function endReadForField(node: UnionDefinition, fieldName: ts.Identifier, field: FieldDefinition): Array<ts.Statement> {
  switch (field.fieldType.type) {
    case SyntaxType.VoidKeyword:
      return []

    default:
      return [
        ts.createStatement(ts.createAssignment(
          ts.createIdentifier(RETURN_NAME),
          ts.createCall(
            ts.createPropertyAccess(
              ts.createIdentifier(node.name.value),
              createFactoryNameForField(field)
            ),
            undefined,
            [ fieldName ],
          )
        ))
      ]
  }
}

/**
 * if (fieldsSet > 1) {
 *   throw new Thrift.TProtocolException(TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with more than one set value!");
 * }
 * else if (fieldsSet < 1) {
 *   throw new Thrift.TProtocolException(TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with no set value!");
 * }
 */
export function createFieldValidation(node: UnionDefinition, withElse: boolean = false): ts.IfStatement {
  return ts.createIf(
    ts.createBinary(
      ts.createIdentifier(INCREMENTER),
      ts.SyntaxKind.GreaterThanToken,
      ts.createLiteral(1),
    ),
    ts.createBlock([
      throwProtocolException(
        'INVALID_DATA',
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
          'INVALID_DATA',
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
