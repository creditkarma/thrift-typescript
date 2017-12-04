import * as ts from 'typescript'

import {
  FunctionType,
  SyntaxType,
  ContainerType,
  InterfaceWithFields,
  FieldDefinition,
} from '@creditkarma/thrift-parser'

import {
  IIdentifierMap,
  IResolvedIdentifier
} from '../../../types'

import {
  createNumberType,
  thriftTypeForFieldType,
  typeNodeForFieldType,
  createVoidType,
} from '../types'

import {
  createMethodCallStatement,
  createMethodCall,
  createFunctionParameter,
  propertyAccessForIdentifier,
  createAssignmentStatement,
  createConstStatement,
  createLet,
  createEquals
} from '../utils'

import {
  COMMON_IDENTIFIERS,
  THRIFT_TYPES,
} from '../identifiers'

import {
  READ_METHODS
} from './methods'

/**
 * public read(input: TProtocol): void {
 *     input.readStructBegin()
 *     while (true) {
 *         {{#has_fields}}
 *         const {fieldType, fieldId} = input.readFieldBegin()
 *         {{/has_fields}}
 *         {{^has_fields}}
 *         const {fieldType} = input.readFieldBegin()
 *         {{/has_fields}}
 *         if (fieldType === Thrift.Type.STOP) {
 *             break
 *         }
 *         {{#has_fields}}
 *         switch (fieldId) {
 *             {{#fields}}
 *             case {{id}}:
 *                 {{>readField}}
 *                 break
 *             {{/fields}}
 *             default:
 *                 input.skip(fieldType)
 *         }
 *         {{/has_fields}}
 *         {{^has_fields}}
 *         input.skip(fieldType)
 *         {{/has_fields}}
 *         input.readFieldEnd()
 *     }
 *     input.readStructEnd()
 *     return
 * }
 */
export function createReadMethod(struct: InterfaceWithFields, identifiers: IIdentifierMap): ts.MethodDeclaration {
  const inputParameter: ts.ParameterDeclaration = createInputParameter();

  /**
   * cosnt ret: { fieldName: string; fieldType: Thrift.Type; fieldId: number; } = input.readFieldBegin()
   * const fieldType: Thrift.Type = ret.fieldType
   * const fieldId: number = ret.fieldId
   */
  const ret: ts.VariableStatement = createConstStatement(
    'ret',
    ts.createTypeReferenceNode(
      COMMON_IDENTIFIERS.IThriftField,
      undefined
    ),
    readFieldBegin()
  )

  const fieldType: ts.VariableStatement = createConstStatement(
    'fieldType',
    ts.createTypeReferenceNode(COMMON_IDENTIFIERS.Thrift_Type, undefined),
    propertyAccessForIdentifier('ret', 'fieldType')
  )

  const fieldId: ts.VariableStatement = createConstStatement(
    'fieldId',
    createNumberType(),
    propertyAccessForIdentifier('ret', 'fieldId')
  )

  /**
   * if (fieldType === Thrift.Type.STOP) {
   *     break;
   * }
   */
  const checkStop: ts.IfStatement = ts.createIf(
    createEquals(COMMON_IDENTIFIERS.fieldType, THRIFT_TYPES.STOP),
    ts.createBlock([
      ts.createBreak()
    ], true)
  )

  const whileLoop: ts.WhileStatement = ts.createWhile(
    ts.createLiteral(true),
    ts.createBlock([
      ret,
      fieldType,
      fieldId,
      checkStop,
      ts.createSwitch(
        COMMON_IDENTIFIERS.fieldId, // what to switch on
        ts.createCaseBlock([
          ...struct.fields.map((next: FieldDefinition) => {
            return createCaseForField(next, identifiers)
          }),
          ts.createDefaultClause([
            createSkipBlock()
          ])
        ])
      ),
      ts.createStatement(readFieldEnd())
    ], true)
  )

  return ts.createMethod(
    undefined,
    [
      ts.createToken(ts.SyntaxKind.PublicKeyword),
    ],
    undefined,
    ts.createIdentifier('read'),
    undefined,
    undefined,
    [ inputParameter ],
    createVoidType(), // return type
    ts.createBlock([
      readStructBegin(),
      whileLoop,
      readStructEnd(),
      ts.createReturn(),
    ], true),
  )
}

export function createInputParameter(): ts.ParameterDeclaration {
  return createFunctionParameter(
    'input', // param name
    ts.createTypeReferenceNode(COMMON_IDENTIFIERS.TProtocol, undefined) // param type
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
export function createCaseForField(field: FieldDefinition, identifiers: IIdentifierMap): ts.CaseClause {
  const fieldAlias: ts.Identifier = ts.createUniqueName('value')
  const checkType: ts.IfStatement = ts.createIf(
    createEquals(
      COMMON_IDENTIFIERS.fieldType,
      thriftTypeForFieldType(field.fieldType, identifiers)
    ),
    ts.createBlock([
      ...readValueForFieldType(
        field.fieldType,
        fieldAlias,
        identifiers
      ),
      ...endReadForField(fieldAlias, field)
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

export function endReadForField(fieldName: ts.Identifier, field: FieldDefinition): Array<ts.Statement> {
  switch (field.fieldType.type) {
    case SyntaxType.VoidKeyword:
      return []

    default:
      return [
        createAssignmentStatement(
          ts.createIdentifier(`this.${field.name.value}`),
          fieldName
        )
      ]
  }
}

export function metadataTypeForFieldType(fieldType: ContainerType): ts.TypeNode {
  switch (fieldType.type) {
    case SyntaxType.MapType:
      return ts.createTypeReferenceNode(
        COMMON_IDENTIFIERS.IThriftMap,
        undefined,
      )

    case SyntaxType.SetType:
      return ts.createTypeReferenceNode(
        COMMON_IDENTIFIERS.IThriftSet,
        undefined,
      )

    case SyntaxType.ListType:
      return ts.createTypeReferenceNode(
        COMMON_IDENTIFIERS.IThriftList,
        undefined,
      )

    default:
      const msg: never = fieldType
      throw new Error(`Non-exhaustive match for: ${msg}`)
  }
}

function readBeginForFieldType(fieldType: ContainerType): ts.CallExpression {
  switch (fieldType.type) {
    case SyntaxType.MapType:
      return readMapBegin()

    case SyntaxType.SetType:
      return readSetBegin()

    case SyntaxType.ListType:
      return readListBegin()

    default:
      const msg: never = fieldType
      throw new Error(`Non-exhaustive match for: ${msg}`)
  }
}

function readEndForFieldType(fieldType: ContainerType): ts.CallExpression {
  switch (fieldType.type) {
    case SyntaxType.MapType:
      return readMapEnd()

    case SyntaxType.SetType:
      return readSetEnd()

    case SyntaxType.ListType:
      return readListEnd()

    default:
      const msg: never = fieldType
      throw new Error(`Non-exhaustive match for: ${msg}`)
  }
}

function loopBody(fieldType: ContainerType, fieldName: ts.Identifier, identifiers: IIdentifierMap): Array<ts.Statement> {
  const value: ts.Identifier = ts.createUniqueName('value')

  switch (fieldType.type) {
    case SyntaxType.MapType:
      const key: ts.Identifier = ts.createUniqueName('key')
      return [
        ...readValueForFieldType(fieldType.keyType, key, identifiers),
        ...readValueForFieldType(fieldType.valueType, value, identifiers),
        createMethodCallStatement(fieldName, 'set', [ key, value ])
      ]

    case SyntaxType.ListType:
      return [
        ...readValueForFieldType(fieldType.valueType, value, identifiers),
        createMethodCallStatement(fieldName, 'push', [ value ])
      ]

    case SyntaxType.SetType:
      return [
        ...readValueForFieldType(fieldType.valueType, value, identifiers),
        createMethodCallStatement(fieldName, 'add', [ value ])
      ]
  }
}


/**
 * EXAMPLE OF MAP FIELD
 *
 * if (fieldType === Thrift.Type.MAP) {
 *   this.field1 = new Map<string, string>();
 *   const metadata_1: {
 *     ktype: Thrift.Type;
 *     vtype: Thrift.Type;
 *     size: number;
 *   } = input.readMapBegin();
 *   const size_1: number = metadata_1.size;
 *   for (let i_1: number = 0; i_1 < size_1; i_1++) {
 *     const key_2: string = input.readString();
 *     const value_2: string = input.readString();
 *     this.field1.set(key_2, value_2);
 *   }
 *   input.readMapEnd();
 * }
 */
function loopOverContainer(fieldType: ContainerType, fieldName: ts.Identifier, identifiers: IIdentifierMap): Array<ts.Statement> {
  const incrementer: ts.Identifier = ts.createUniqueName('i')
  const metadata: ts.Identifier = ts.createUniqueName('metadata')
  const size: ts.Identifier = ts.createUniqueName('size')

  return [
    // const metadata: { ktype: Thrift.Type; vtype: Thrift.Type; size: number; } = input.readMapBegin()
    createConstStatement(
      metadata,
      metadataTypeForFieldType(fieldType),
      readBeginForFieldType(fieldType)
    ),
    // cosnt size: number = metadata.size
    createConstStatement(
      size,
      createNumberType(),
      propertyAccessForIdentifier(metadata, 'size')
    ),
    // for (let i = 0, i < size; i++) { .. }
    ts.createFor(
      createLet(
        incrementer,
        createNumberType(),
        ts.createLiteral(0)
      ),
      ts.createLessThan(incrementer, size),
      ts.createPostfixIncrement(incrementer),
      ts.createBlock(
        loopBody(fieldType, fieldName, identifiers),
        true
      )
    ),
    ts.createStatement(readEndForFieldType(fieldType))
  ]
}

export function readValueForIdentifier(
  id: IResolvedIdentifier,
  fieldType: FunctionType,
  fieldName: ts.Identifier,
  identifiers: IIdentifierMap
): Array<ts.Statement> {
  switch (id.definition.type) {
    case SyntaxType.ConstDefinition:
      throw new TypeError(`Identifier ${id.definition.name.value} is a value being used as a type`)

    case SyntaxType.ServiceDefinition:
      throw new TypeError(`Service ${id.definition.name.value} is being used as a type`)

    case SyntaxType.StructDefinition:
    case SyntaxType.UnionDefinition:
    case SyntaxType.ExceptionDefinition:
      return [
        createConstStatement(
          fieldName,
          typeNodeForFieldType(fieldType),
          ts.createNew(
            ts.createIdentifier(id.resolvedName),
            undefined,
            []
          )
        ),
        ts.createStatement(ts.createCall(
          ts.createPropertyAccess(
            fieldName,
            ts.createIdentifier('read'),
          ),
          undefined,
          [
            COMMON_IDENTIFIERS.input
          ]
        )),
      ]

    case SyntaxType.EnumDefinition:
      return [
        createConstStatement(
          fieldName,
          typeNodeForFieldType(fieldType),
          createMethodCall('input', READ_METHODS[SyntaxType.I32Keyword])
        )
      ]

    case SyntaxType.TypedefDefinition:
      return readValueForFieldType(id.definition.definitionType, fieldName, identifiers)

    default:
      const msg: never = id.definition
      throw new Error(`Non-exhaustive match for: ${msg}`)
  }
}

export function readValueForFieldType(
  fieldType: FunctionType,
  fieldName: ts.Identifier,
  identifiers: IIdentifierMap
): Array<ts.Statement> {
  switch (fieldType.type) {
    case SyntaxType.Identifier:
      return readValueForIdentifier(
        identifiers[fieldType.value],
        fieldType,
        fieldName,
        identifiers
      )

    /**
     * Base types:
     *
     * SyntaxType.StringKeyword | SyntaxType.DoubleKeyword | SyntaxType.BoolKeyword |
     * SyntaxType.I8Keyword | SyntaxType.I16Keyword | SyntaxType.I32Keyword |
     * SyntaxType.I64Keyword | SyntaxType.BinaryKeyword | SyntaxType.ByteKeyword;
     */
    case SyntaxType.BoolKeyword:
    case SyntaxType.ByteKeyword:
    case SyntaxType.BinaryKeyword:
    case SyntaxType.StringKeyword:
    case SyntaxType.DoubleKeyword:
    case SyntaxType.I8Keyword:
    case SyntaxType.I16Keyword:
    case SyntaxType.I32Keyword:
    case SyntaxType.I64Keyword:
      // const <fieldName>: <fieldType> = input.<readMethod>();
      return [
        createConstStatement(
          fieldName,
          typeNodeForFieldType(fieldType),
          createMethodCall('input', READ_METHODS[fieldType.type])
        )
      ]

    /**
     * Container types:
     *
     * SetType | MapType | ListType
     */
    case SyntaxType.MapType:
      return [
        createConstStatement(
          fieldName,
          typeNodeForFieldType(fieldType),
          ts.createNew(
            COMMON_IDENTIFIERS.Map, // class name
            [ typeNodeForFieldType(fieldType.keyType), typeNodeForFieldType(fieldType.valueType) ],
            []
          )
        ),
        ...loopOverContainer(fieldType, fieldName, identifiers)
      ]

    case SyntaxType.ListType:
      return [
        createConstStatement(
          fieldName,
          typeNodeForFieldType(fieldType),
          ts.createNew(
            COMMON_IDENTIFIERS.Array, // class name
            [ typeNodeForFieldType(fieldType.valueType) ],
            []
          )
        ),
        ...loopOverContainer(fieldType, fieldName, identifiers)
      ]

    case SyntaxType.SetType:
      return [
        createConstStatement(
          fieldName,
          typeNodeForFieldType(fieldType),
          ts.createNew(
            COMMON_IDENTIFIERS.Set, // class name
            [ typeNodeForFieldType(fieldType.valueType) ],
            []
          )
        ),
        ...loopOverContainer(fieldType, fieldName, identifiers)
      ]

    case SyntaxType.VoidKeyword:
      return [
        createMethodCallStatement('input', 'skip', [
          COMMON_IDENTIFIERS.fieldType
        ])
      ]

    default:
      const msg: never = fieldType
      throw new Error(`Non-exhaustive match for: ${msg}`)
  }
}

// input.readStructBegin(<structName>)
export function readStructBegin(): ts.ExpressionStatement {
  return createMethodCallStatement('input', 'readStructBegin')
}

// input.readStructEnd()
export function readStructEnd(): ts.ExpressionStatement {
  return createMethodCallStatement('input', 'readStructEnd')
}

// input.readFieldBegin()
export function readFieldBegin(): ts.CallExpression {
  return createMethodCall('input', 'readFieldBegin')
}

// input.readFieldEnd()
export function readFieldEnd(): ts.CallExpression {
  return createMethodCall('input', 'readFieldEnd')
}

// input.readMapBegin()
export function readMapBegin(): ts.CallExpression {
  return createMethodCall('input', 'readMapBegin')
}

// input.readMapEnd()
export function readMapEnd(): ts.CallExpression {
  return createMethodCall('input', 'readMapEnd')
}

// input.readListBegin()
export function readListBegin(): ts.CallExpression {
  return createMethodCall('input', 'readListBegin')
}

// input.readListEnd()
export function readListEnd(): ts.CallExpression {
  return createMethodCall('input', 'readListEnd')
}

// input.readSetBegin()
export function readSetBegin(): ts.CallExpression {
  return createMethodCall('input', 'readSetBegin')
}

// input.readSetEnd()
export function readSetEnd(): ts.CallExpression {
  return createMethodCall('input', 'readSetEnd')
}

// input.skip(fieldType)
export function createSkipBlock(): ts.Block {
  return ts.createBlock([
    createSkipStatement()
  ], true)
}

function createSkipStatement(): ts.ExpressionStatement {
  return createMethodCallStatement('input', 'skip', [
    COMMON_IDENTIFIERS.fieldType
  ])
}
