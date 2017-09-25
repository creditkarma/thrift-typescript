import * as ts from 'typescript'

import {
  FunctionType,
  SyntaxType,
} from '@creditkarma/thrift-parser'

import {
  IIdentifierMap,
  IResolvedIdentifier
} from '../types'

import {
  COMMON_IDENTIFIERS
} from './identifiers'

export function createVoidType(): ts.TypeNode {
  return ts.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
}

export function createAnyType(): ts.TypeNode {
  return ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
}

export function createStringType(): ts.KeywordTypeNode {
  return ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
}

export function createNumberType(): ts.KeywordTypeNode {
  return ts.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
}

export function createBooleanType(): ts.KeywordTypeNode {
  return ts.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword)
}

export function createTypeProperty(name: string, type: ts.TypeNode): ts.PropertySignature {
  return ts.createPropertySignature(
    undefined, // modifiers
    name, // name of property
    undefined, // question token if optional
    type, // type of property
    undefined, // initializer value
  )
}

/**
 * Creates type annotations for Thrift types
 *
 * EXAMPLE
 *
 * // thrift
 * const bool FALSE_CONST = false
 *
 * // typescript
 * const FALSE_CONST: boolean = false
 *
 * This function provides the ': boolean' bit.
 *
 * Container types:
 *
 * SetType | MapType | ListType
 *
 * Base types:
 *
 * SyntaxType.StringKeyword | SyntaxType.DoubleKeyword | SyntaxType.BoolKeyword |
 * SyntaxType.I8Keyword | SyntaxType.I16Keyword | SyntaxType.I32Keyword |
 * SyntaxType.I64Keyword | SyntaxType.BinaryKeyword | SyntaxType.ByteKeyword;
 *
 * Function types:
 *
 * SyntaxType.VoidKeyword
 */
export function typeNodeForFieldType(fieldType: FunctionType): ts.TypeNode {
  switch (fieldType.type) {
    case SyntaxType.Identifier:
      return ts.createTypeReferenceNode(fieldType.value, undefined)

    case SyntaxType.SetType:
      return ts.createTypeReferenceNode(
        'Set',
        [ typeNodeForFieldType(fieldType.valueType) ],
      )

    case SyntaxType.MapType:
      return ts.createTypeReferenceNode(
        'Map',
        [ typeNodeForFieldType(fieldType.keyType), typeNodeForFieldType(fieldType.valueType) ],
      )

    case SyntaxType.ListType:
      return ts.createTypeReferenceNode(
        'Array',
        [ typeNodeForFieldType(fieldType.valueType) ],
      )

    case SyntaxType.StringKeyword:
      return createStringType()

    case SyntaxType.BoolKeyword:
      return createBooleanType()

    case SyntaxType.I64Keyword:
      return ts.createTypeReferenceNode(COMMON_IDENTIFIERS['Int64'], undefined)

    case SyntaxType.DoubleKeyword:
    case SyntaxType.I8Keyword:
    case SyntaxType.I16Keyword:
    case SyntaxType.I32Keyword:
    case SyntaxType.BinaryKeyword:
    case SyntaxType.ByteKeyword:
      return createNumberType()

    case SyntaxType.VoidKeyword:
      return createVoidType()

    default:
      const msg: never = fieldType
      throw new Error(`Non-exhaustive match for: ${msg}`)
  }
}

export function constructorNameForFieldType(fieldType: FunctionType): ts.Identifier {
  switch (fieldType.type) {
    case SyntaxType.Identifier:
      return ts.createIdentifier(fieldType.value)

    case SyntaxType.SetType:
      return COMMON_IDENTIFIERS['Set']

    case SyntaxType.MapType:
      return COMMON_IDENTIFIERS['Map']

    case SyntaxType.ListType:
      return COMMON_IDENTIFIERS['Array']

    case SyntaxType.StringKeyword:
      return COMMON_IDENTIFIERS['String']

    case SyntaxType.BoolKeyword:
      return COMMON_IDENTIFIERS['Boolean']

    case SyntaxType.I64Keyword:
      return COMMON_IDENTIFIERS['Int64']

    case SyntaxType.DoubleKeyword:
    case SyntaxType.I8Keyword:
    case SyntaxType.I16Keyword:
    case SyntaxType.I32Keyword:
    case SyntaxType.BinaryKeyword:
    case SyntaxType.ByteKeyword:
      return COMMON_IDENTIFIERS['Number']

    case SyntaxType.VoidKeyword:
      return COMMON_IDENTIFIERS['void']

    default:
      const msg: never = fieldType
      throw new Error(`Non-exhaustive match for: ${msg}`)
  }
}

export type TProtocolException =
  'TProtocolExceptionType.UNKNOWN' | 'TProtocolExceptionType.INVALID_DATA' | 'TProtocolExceptionType.NEGATIVE_SIZE' |
  'TProtocolExceptionType.SIZE_LIMIT' | 'TProtocolExceptionType.BAD_VERSION' | 'TProtocolExceptionType.NOT_IMPLEMENTED' |
  'TProtocolExceptionType.DEPTH_LIMIT'

export type TApplicationException =
  'TApplicationExceptionType.UNKNOWN' | 'TApplicationExceptionType.UNKNOWN_METHOD' | 'TApplicationExceptionType.INVALID_MESSAGE_TYPE' |
  'TApplicationExceptionType.WRONG_METHOD_NAME' | 'TApplicationExceptionType.BAD_SEQUENCE_ID' | 'TApplicationExceptionType.MISSING_RESULT' |
  'TApplicationExceptionType.INTERNAL_ERROR' | 'TApplicationExceptionType.PROTOCOL_ERROR' | 'TApplicationExceptionType.INVALID_TRANSFORM' |
  'TApplicationExceptionType.INVALID_PROTOCOL' | 'TApplicationExceptionType.UNSUPPORTED_CLIENT_TYPE'

const THRIFT_TYPES = {
  'Thrift.Type.STRUCT': ts.createIdentifier('Thrift.Type.STRUCT'),
  'Thrift.Type.SET': ts.createIdentifier('Thrift.Type.SET'),
  'Thrift.Type.MAP': ts.createIdentifier('Thrift.Type.MAP'),
  'Thrift.Type.LIST': ts.createIdentifier('Thrift.Type.LIST'),
  'Thrift.Type.STRING': ts.createIdentifier('Thrift.Type.STRING'),
  'Thrift.Type.BOOL': ts.createIdentifier('Thrift.Type.BOOL'),
  'Thrift.Type.DOUBLE': ts.createIdentifier('Thrift.Type.DOUBLE'),
  'Thrift.Type.BYTE': ts.createIdentifier('Thrift.Type.BYTE'),
  'Thrift.Type.I16': ts.createIdentifier('Thrift.Type.I16'),
  'Thrift.Type.I32': ts.createIdentifier('Thrift.Type.I32'),
  'Thrift.Type.I64': ts.createIdentifier('Thrift.Type.I64'),
  'Thrift.Type.VOID': ts.createIdentifier('Thrift.Type.VOID'),
}

function thriftTypeForIdentifier(id: IResolvedIdentifier, identifiers: IIdentifierMap): ts.Identifier {
  switch (id.definition.type) {
    case SyntaxType.ConstDefinition:
      throw new TypeError(`Identifier ${id.definition.name.value} is a value being used as a type`)

    case SyntaxType.ServiceDefinition:
      throw new TypeError(`Service ${id.definition.name.value} is being used as a type`)

    case SyntaxType.StructDefinition:
    case SyntaxType.UnionDefinition:
    case SyntaxType.ExceptionDefinition:
      return THRIFT_TYPES['Thrift.Type.STRUCT']

    case SyntaxType.EnumDefinition:
      return THRIFT_TYPES['Thrift.Type.I32']

    case SyntaxType.TypedefDefinition:
      return thriftTypeForFieldType(
        id.definition.definitionType,
        identifiers
      )

    default:
      const msg: never = id.definition
      throw new Error(`Non-exhaustive match for: ${msg}`)
  }
}

/**
 * Gets the type access for the 'Thrift' object for a given FieldType.
 *
 * This could and should probably be a map of FieldType -> ThriftAccess.
 * However, using a switch statement gives us the safety of exhaustive matching
 * for FieldTypes.
 *
 * @todo Clean up so that we can use the strictNullChecks compiler flag which
 * would allow us to use a map and get the same safety as the switch.
 *
 * @param fieldType
 */
export function thriftTypeForFieldType(fieldType: FunctionType, identifiers: IIdentifierMap): ts.Identifier {
  switch (fieldType.type) {
    case SyntaxType.Identifier:
      return thriftTypeForIdentifier(
        identifiers[fieldType.value],
        identifiers
      )

    case SyntaxType.SetType:
      return THRIFT_TYPES['Thrift.Type.SET']

    case SyntaxType.MapType:
      return THRIFT_TYPES['Thrift.Type.MAP']

    case SyntaxType.ListType:
      return THRIFT_TYPES['Thrift.Type.LIST']

    case SyntaxType.BinaryKeyword:
    case SyntaxType.StringKeyword:
      return THRIFT_TYPES['Thrift.Type.STRING']

    case SyntaxType.BoolKeyword:
      return THRIFT_TYPES['Thrift.Type.BOOL']

    case SyntaxType.DoubleKeyword:
      return THRIFT_TYPES['Thrift.Type.DOUBLE']

    case SyntaxType.I8Keyword:
    case SyntaxType.ByteKeyword:
      return THRIFT_TYPES['Thrift.Type.BYTE']

    case SyntaxType.I16Keyword:
      return THRIFT_TYPES['Thrift.Type.I16']

    case SyntaxType.I32Keyword:
      return THRIFT_TYPES['Thrift.Type.I32']

    case SyntaxType.I64Keyword:
      return THRIFT_TYPES['Thrift.Type.I64']

    case SyntaxType.VoidKeyword:
      return THRIFT_TYPES['Thrift.Type.VOID']

    default:
      const msg: never = fieldType
      throw new Error(`Non-exhaustive match for: ${msg}`)
  }
}
