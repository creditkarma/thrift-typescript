import * as ts from 'typescript'

import { FieldDefinition, UnionDefinition } from '@creditkarma/thrift-parser'

import { IIdentifierMap, IRenderState } from '../../../types'

import { renderInterface } from '../struct/interface'
import { className, tokens } from '../struct/utils'

import { renderCodec } from './codec'

import { renderClass } from './class'

import { createVoidType } from '../../shared/types'
import { typeNodeForFieldType } from '../types'

export function renderUnion(
    node: UnionDefinition,
    state: IRenderState,
    isExported: boolean = true,
): Array<ts.Statement> {
    return [
        ...renderInterface(node, state, isExported),
        renderCodec(node, state, isExported),
        renderClass(node, state, isExported),
    ]
}

function capitalize(str: string): string {
    if (str.length > 0) {
        const head: string = str[0]
        const tail: string = str.substring(1)
        return `${head.toUpperCase()}${tail}`
    } else {
        return ''
    }
}

function renderUnions(
    node: UnionDefinition,
    identifiers: IIdentifierMap,
    isExported: boolean,
): Array<ts.Statement> {
    return [
        ts.createTypeAliasDeclaration(
            undefined,
            tokens(isExported),
            className(node.name.value),
            undefined,
            ts.createUnionTypeNode([
                ...node.fields.map((next: FieldDefinition) => {
                    return ts.createTypeReferenceNode(
                        `I${node.name.value}With${capitalize(next.name.value)}`,
                        undefined,
                    )
                }),
            ]),
        ),
        ...node.fields.map(
            (next: FieldDefinition): ts.InterfaceDeclaration => {
                const signatures = node.fields.map((field: FieldDefinition) => {
                    if (field.name.value === next.name.value) {
                        return ts.createPropertySignature(
                            undefined,
                            field.name.value,
                            undefined,
                            typeNodeForFieldType(field.fieldType, identifiers),
                            undefined,
                        )
                    } else {
                        return ts.createPropertySignature(
                            undefined,
                            field.name.value,
                            ts.createToken(ts.SyntaxKind.QuestionToken),
                            createVoidType(),
                            undefined,
                        )
                    }
                })

                return ts.createInterfaceDeclaration(
                    undefined,
                    tokens(isExported),
                    ts.createIdentifier(
                        `I${node.name.value}With${capitalize(next.name.value)}`,
                    ),
                    [],
                    [],
                    signatures,
                )
            },
        ),
    ]
}

export function renderStrictUnion(
    node: UnionDefinition,
    state: IRenderState,
    isExported: boolean = true,
): Array<ts.Statement> {
    return [
        ...renderUnions(node, state.identifiers, isExported),
        renderCodec(node, state, isExported),
    ]
}
