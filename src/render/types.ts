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
 * Container types:
 * SetType | MapType | ListType
 *
 * Keyword types:
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
      return createKeywordTypeNode(SyntaxKind.StringKeyword)

    case SyntaxType.BoolKeyword:
      return createKeywordTypeNode(SyntaxKind.BooleanKeyword)

    case SyntaxType.DoubleKeyword:
    case SyntaxType.I8Keyword:
    case SyntaxType.I16Keyword:
    case SyntaxType.I32Keyword:
    case SyntaxType.I64Keyword:
    case SyntaxType.BinaryKeyword:
    case SyntaxType.ByteKeyword:
      return createKeywordTypeNode(SyntaxKind.NumberKeyword)

    default:
      const msg: never = fieldType
      throw new Error(`Unexpected type found: ${msg}`)
  }
}

function thriftType(fieldType: FieldType): string {
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
      throw new Error(`Unexpected type found: ${msg}`)
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
  return createPropertyAccess(createIdentifier('Thrift'), thriftType(fieldType))
}
