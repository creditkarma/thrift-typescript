import * as ts from 'typescript'

import {
    FieldDefinition,
    InterfaceWithFields,
    SyntaxType,
} from '@creditkarma/thrift-parser'

import { COMMON_IDENTIFIERS, THRIFT_IDENTIFIERS } from '../identifiers'

import { IRenderState } from '../../../types'
import { throwProtocolException } from '../utils'

type NameMapping = (name: string) => string

function splitPath(path: string): Array<string> {
    return path.split('.').filter(
        (next: string): boolean => {
            return next.trim() !== ''
        },
    )
}

function makeNameForNode(name: string, mapping: NameMapping): string {
    const parts: Array<string> = splitPath(name)
    if (parts.length > 1) {
        return `${parts[0]}.${mapping(parts[1])}`
    } else {
        return mapping(name)
    }
}

export function renderOptional(
    field: FieldDefinition,
    loose: boolean = false,
): ts.Token<ts.SyntaxKind.QuestionToken> | undefined {
    if (
        field.requiredness !== 'required' ||
        (loose && field.defaultValue !== null)
    ) {
        return ts.createToken(ts.SyntaxKind.QuestionToken)
    } else {
        return undefined
    }
}

export function tokens(
    isExported: boolean,
): Array<ts.Token<ts.SyntaxKind.ExportKeyword>> {
    if (isExported) {
        return [ts.createToken(ts.SyntaxKind.ExportKeyword)]
    } else {
        return []
    }
}

export function looseNameForStruct(
    node: InterfaceWithFields,
    state: IRenderState,
): string {
    return looseName(node.name.value, node.type, state)
}

export function classNameForStruct(node: InterfaceWithFields): string {
    return className(node.name.value)
}

export function strictNameForStruct(
    node: InterfaceWithFields,
    state: IRenderState,
): string {
    return strictName(node.name.value, node.type, state)
}

export function toolkitNameForStruct(node: InterfaceWithFields): string {
    return toolkitName(node.name.value)
}

export function className(name: string): string {
    return makeNameForNode(name, (part: string) => {
        return part
    })
}

export function looseName(
    name: string,
    type: SyntaxType,
    state: IRenderState,
): string {
    if (type === SyntaxType.UnionDefinition && state.options.strictUnions) {
        return `${className(name)}Args`
    } else {
        return makeNameForNode(name, (part: string) => {
            return `I${part}Args`
        })
    }
}

export function strictName(
    name: string,
    type: SyntaxType,
    state: IRenderState,
): string {
    if (type === SyntaxType.UnionDefinition && state.options.strictUnions) {
        return className(name)
    } else {
        return makeNameForNode(name, (part: string) => {
            return `I${part}`
        })
    }
}

// TODO: This will be renamed to Toolkit in a breaking release
export function toolkitName(name: string): string {
    return makeNameForNode(name, (part: string) => {
        return `${part}Codec`
    })
}

export function extendsAbstract(): ts.HeritageClause {
    return ts.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
        ts.createExpressionWithTypeArguments([], THRIFT_IDENTIFIERS.StructLike),
    ])
}

export function implementsInterface(
    node: InterfaceWithFields,
    state: IRenderState,
): ts.HeritageClause {
    return ts.createHeritageClause(ts.SyntaxKind.ImplementsKeyword, [
        ts.createExpressionWithTypeArguments(
            [],
            ts.createIdentifier(strictNameForStruct(node, state)),
        ),
    ])
}

export function createSuperCall(): ts.Statement {
    return ts.createStatement(
        ts.createCall(COMMON_IDENTIFIERS.super, undefined, []),
    )
}

/**
 * Create the Error for a missing required field
 *
 * EXAMPLE
 *
 * throw new thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, 'Required field {{fieldName}} is unset!')
 */
export function throwForField(
    field: FieldDefinition,
): ts.ThrowStatement | undefined {
    if (field.requiredness === 'required' && field.defaultValue === null) {
        return throwProtocolException(
            'UNKNOWN',
            `Required field[${field.name.value}] is unset!`,
        )
    } else {
        return undefined
    }
}
