import * as ts from 'typescript'

import {
    FunctionType,
    SyntaxType,
} from '@creditkarma/thrift-parser'

import {
    SHARED_IDENTIFIERS,
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
export function typeNodeForFieldType(fieldType: FunctionType, loose: boolean = false): ts.TypeNode {
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
            if (loose === true) {
                return ts.createUnionTypeNode([
                    createNumberType(),
                    ts.createTypeReferenceNode(
                        SHARED_IDENTIFIERS.Int64,
                        undefined
                    )
                ])
            } else {
                return ts.createTypeReferenceNode(SHARED_IDENTIFIERS.Int64, undefined)
            }

        case SyntaxType.BinaryKeyword:
            return ts.createTypeReferenceNode('Buffer', undefined)

        case SyntaxType.DoubleKeyword:
        case SyntaxType.I8Keyword:
        case SyntaxType.I16Keyword:
        case SyntaxType.I32Keyword:
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
            return SHARED_IDENTIFIERS.Set

        case SyntaxType.MapType:
            return SHARED_IDENTIFIERS.Map

        case SyntaxType.ListType:
            return SHARED_IDENTIFIERS.Array

        case SyntaxType.StringKeyword:
            return SHARED_IDENTIFIERS.String

        case SyntaxType.BoolKeyword:
            return SHARED_IDENTIFIERS.Boolean

        case SyntaxType.I64Keyword:
            return SHARED_IDENTIFIERS.Int64

        case SyntaxType.BinaryKeyword:
            return SHARED_IDENTIFIERS.Buffer

        case SyntaxType.DoubleKeyword:
        case SyntaxType.I8Keyword:
        case SyntaxType.I16Keyword:
        case SyntaxType.I32Keyword:
        case SyntaxType.ByteKeyword:
            return SHARED_IDENTIFIERS.Number

        case SyntaxType.VoidKeyword:
            return SHARED_IDENTIFIERS.void

        default:
            const msg: never = fieldType
            throw new Error(`Non-exhaustive match for: ${msg}`)
    }
}
