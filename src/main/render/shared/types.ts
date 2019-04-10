import * as ts from 'typescript'

import { FunctionType, SyntaxType } from '@creditkarma/thrift-parser'

import { IRenderState } from '../../types'
import { COMMON_IDENTIFIERS } from './identifiers'

export type TypeMapping = (
    fieldType: FunctionType,
    state: IRenderState,
    loose?: boolean,
) => ts.TypeNode

export function createUndefinedType(): ts.TypeNode {
    return ts.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
}

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

export function createTypeProperty(
    name: string,
    type: ts.TypeNode,
): ts.PropertySignature {
    return ts.createPropertySignature(
        undefined, // modifiers
        name, // name of property
        undefined, // question token if optional
        type, // type of property
        undefined, // initializer value
    )
}

export type ClassNameWithStateMapping = (
    name: string,
    state: IRenderState,
) => string
export type ClassNameWithoutStateMapping = (name: string) => string
export type ClassNameMapping =
    | ClassNameWithStateMapping
    | ClassNameWithoutStateMapping

export function constructorNameForFieldType(
    fieldType: FunctionType,
    className: ClassNameMapping,
    state: IRenderState,
): ts.Identifier {
    switch (fieldType.type) {
        case SyntaxType.Identifier:
            return ts.createIdentifier(className(fieldType.value, state))

        case SyntaxType.SetType:
            return COMMON_IDENTIFIERS.Set

        case SyntaxType.MapType:
            return COMMON_IDENTIFIERS.Map

        case SyntaxType.ListType:
            return COMMON_IDENTIFIERS.Array

        case SyntaxType.StringKeyword:
            return COMMON_IDENTIFIERS.String

        case SyntaxType.BoolKeyword:
            return COMMON_IDENTIFIERS.Boolean

        case SyntaxType.I64Keyword:
            return COMMON_IDENTIFIERS.Int64

        case SyntaxType.BinaryKeyword:
            return COMMON_IDENTIFIERS.Buffer

        case SyntaxType.DoubleKeyword:
        case SyntaxType.I8Keyword:
        case SyntaxType.I16Keyword:
        case SyntaxType.I32Keyword:
        case SyntaxType.ByteKeyword:
            return COMMON_IDENTIFIERS.Number

        case SyntaxType.VoidKeyword:
            return COMMON_IDENTIFIERS.void

        default:
            const msg: never = fieldType
            throw new Error(`Non-exhaustive match for: ${msg}`)
    }
}
