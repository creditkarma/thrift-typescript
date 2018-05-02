import * as ts from 'typescript'

import {
    InterfaceWithFields,
} from '@creditkarma/thrift-parser'

import {
    THRIFT_IDENTIFIERS, COMMON_IDENTIFIERS,
} from '../identifiers'

export function looseNameForStruct(node: InterfaceWithFields): string {
    return looseName(node.name.value)
}

export function classNameForStruct(node: InterfaceWithFields): string {
    return className(node.name.value)
}

export function strictNameForStruct(node: InterfaceWithFields): string {
    return strictName(node.name.value)
}

export function codecNameForStruct(node: InterfaceWithFields): string {
    return codecName(node.name.value)
}

export function className(name: string): string {
    return `${name}`
}

export function looseName(name: string): string {
    return `I${name}_Loose`
}

export function strictName(name: string): string {
    return `I${name}`
}

export function codecName(name: string): string {
    return `${name}Codec`
}

export function extendsAbstract(): ts.HeritageClause {
    return ts.createHeritageClause(
        ts.SyntaxKind.ExtendsKeyword,
        [
            ts.createExpressionWithTypeArguments(
                [],
                THRIFT_IDENTIFIERS.StructLike,
            ),
        ],
    )
}

export function implementsInterface(node: InterfaceWithFields): ts.HeritageClause {
    return ts.createHeritageClause(
        ts.SyntaxKind.ImplementsKeyword,
        [
            ts.createExpressionWithTypeArguments(
                [],
                ts.createIdentifier(`I${node.name.value}_Loose`),
            ),
        ],
    )
}

export function createSuperCall(): ts.Statement {
    return ts.createStatement(
        ts.createCall(
            COMMON_IDENTIFIERS.super,
            undefined,
            [],
        ),
    )
}
