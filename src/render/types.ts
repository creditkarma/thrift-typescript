import {
  createIdentifier,
  createKeywordTypeNode,
  createPropertyAccess,
  createPropertySignature,
  createTypeReferenceNode,
  KeywordTypeNode,
  PropertyAccessExpression,
  PropertySignature,
  SyntaxKind,
  TypeNode,
} from 'typescript'

import {
  FieldType,
  SyntaxType,
} from '@creditkarma/thrift-parser'

export function createVoidType(): TypeNode {
  return createKeywordTypeNode(SyntaxKind.VoidKeyword)
}

export function createStringType(): KeywordTypeNode {
  return createKeywordTypeNode(SyntaxKind.StringKeyword)
}

export function createNumberType(): KeywordTypeNode {
  return createKeywordTypeNode(SyntaxKind.NumberKeyword)
}

export function createBooleanType(): KeywordTypeNode {
  return createKeywordTypeNode(SyntaxKind.BooleanKeyword)
}

export function createTypeProperty(name: string, type: TypeNode): PropertySignature {
  return createPropertySignature(
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
 * SetType | MapType | ListType
 *
 * Base types:
 * SyntaxType.StringKeyword | SyntaxType.DoubleKeyword | SyntaxType.BoolKeyword |
 * SyntaxType.I8Keyword | SyntaxType.I16Keyword | SyntaxType.I32Keyword |
 * SyntaxType.I64Keyword | SyntaxType.BinaryKeyword | SyntaxType.ByteKeyword;
 */
export function typeNodeForFieldType(fieldType: FieldType): TypeNode {
  switch (fieldType.type) {
    case SyntaxType.Identifier:
      return createTypeReferenceNode(fieldType.value, undefined)

    case SyntaxType.SetType:
      return createTypeReferenceNode(
        'Set',
        [ typeNodeForFieldType(fieldType.valueType) ],
      )

    case SyntaxType.MapType:
      return createTypeReferenceNode(
        'Map',
        [ typeNodeForFieldType(fieldType.keyType), typeNodeForFieldType(fieldType.valueType) ],
      )

    case SyntaxType.ListType:
      return createTypeReferenceNode(
        'Array',
        [ typeNodeForFieldType(fieldType.valueType) ],
      )

    case SyntaxType.StringKeyword:
      return createStringType()

    case SyntaxType.BoolKeyword:
      return createBooleanType()

    case SyntaxType.DoubleKeyword:
    case SyntaxType.I8Keyword:
    case SyntaxType.I16Keyword:
    case SyntaxType.I32Keyword:
    case SyntaxType.I64Keyword:
    case SyntaxType.BinaryKeyword:
    case SyntaxType.ByteKeyword:
      return createNumberType()

    default:
      const msg: never = fieldType
      throw new Error(`Non-exhaustive match for: ${msg}`)
  }
}

export type TProtocolException =
  'TProtocolExceptionType.UNKNOWN' | 'TProtocolExceptionType.INVALID_DATA' | 'TProtocolExceptionType.NEGATIVE_SIZE' |
  'TProtocolExceptionType.SIZE_LIMIT' | 'TProtocolExceptionType.BAD_VERSION' | 'TProtocolExceptionType.NOT_IMPLEMENTED' |
  'TProtocolExceptionType.DEPTH_LIMIT'

export type ThriftTypeAccess =
  'Type.STRUCT' | 'Type.SET' | 'Type.MAP' | 'Type.LIST' | 'Type.STRING' |
  'Type.BOOL' | 'Type.DOUBLE' | 'Type.BYTE' | 'Type.I16' | 'Type.I32' |
  'Type.I64'

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
function thriftAccessForFieldType(fieldType: FieldType): ThriftTypeAccess {
  switch (fieldType.type) {
    case SyntaxType.Identifier:
      return 'Type.STRUCT'

    case SyntaxType.SetType:
      return 'Type.SET'

    case SyntaxType.MapType:
      return 'Type.MAP'

    case SyntaxType.ListType:
      return 'Type.LIST'

    case SyntaxType.BinaryKeyword:
    case SyntaxType.StringKeyword:
      return 'Type.STRING'

    case SyntaxType.BoolKeyword:
      return 'Type.BOOL'

    case SyntaxType.DoubleKeyword:
      return 'Type.DOUBLE'

    case SyntaxType.I8Keyword:
    case SyntaxType.ByteKeyword:
      return 'Type.BYTE'

    case SyntaxType.I16Keyword:
      return 'Type.I16'

    case SyntaxType.I32Keyword:
      return 'Type.I32'

    case SyntaxType.I64Keyword:
      return 'Type.I64'

    default:
      const msg: never = fieldType
      throw new Error(`Non-exhaustive match for: ${msg}`)
  }
}

/**
 * For the given FieldType what is the corresponding enum defined in the Thrift library
 *
 * if (fieldType.type === SyntaxType.I16Keyword) {
 *   return 'Thrift.Type.I16'
 * }
 *
 * @param fieldType
 */
export function thriftPropertyAccessForFieldType(fieldType: FieldType): PropertyAccessExpression {
  return createPropertyAccess(
    createIdentifier('Thrift'),
    thriftAccessForFieldType(fieldType),
  )
}
