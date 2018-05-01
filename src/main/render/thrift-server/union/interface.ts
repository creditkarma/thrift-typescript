import * as ts from 'typescript'

import {
    UnionDefinition,
    FieldDefinition,
} from '@creditkarma/thrift-parser'

import {
    typeNodeForFieldType,
} from '../types'

import {
    IIdentifierMap
} from '../../../types'
import { looseNameForStruct, strictNameForStruct } from '../struct/utils';

export function renderLooseInterface(node: UnionDefinition, identifiers: IIdentifierMap): ts.TypeAliasDeclaration {
    if (node.fields.length > 0) {
        const types: Array<ts.TypeLiteralNode> = node.fields.map((field: FieldDefinition): ts.TypeLiteralNode => {
            return ts.createTypeLiteralNode(
                node.fields.map((next: FieldDefinition): ts.PropertySignature => {
                    return ts.createPropertySignature(
                        undefined,
                        next.name.value,
                        (next.name.value === field.name.value) ?
                            undefined :
                            ts.createToken(ts.SyntaxKind.QuestionToken),
                        (next.name.value === field.name.value) ?
                            typeNodeForFieldType(field.fieldType, identifiers, true) :
                            ts.createTypeReferenceNode('undefined', undefined),
                        undefined,
                    )
                })
            )
        })

        const unionOfTypes: ts.UnionTypeNode = ts.createUnionTypeNode(types)

        return ts.createTypeAliasDeclaration(
            undefined,
            [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
            ts.createIdentifier(looseNameForStruct(node)),
            undefined,
            unionOfTypes,
        )

    } else {
        return ts.createTypeAliasDeclaration(
            undefined,
            [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
            ts.createIdentifier(looseNameForStruct(node)),
            undefined,
            ts.createTypeLiteralNode([]),
        )
    }
}

export function renderInterface(node: UnionDefinition, identifiers: IIdentifierMap): ts.TypeAliasDeclaration {
    if (node.fields.length > 0) {
        const types: Array<ts.TypeLiteralNode> = node.fields.map((field: FieldDefinition): ts.TypeLiteralNode => {
            return ts.createTypeLiteralNode(
                node.fields.map((next: FieldDefinition): ts.PropertySignature => {
                    return ts.createPropertySignature(
                        undefined,
                        next.name.value,
                        (next.name.value === field.name.value) ?
                            undefined :
                            ts.createToken(ts.SyntaxKind.QuestionToken),
                        (next.name.value === field.name.value) ?
                            typeNodeForFieldType(field.fieldType, identifiers) :
                            ts.createTypeReferenceNode('undefined', undefined),
                        undefined,
                    )
                })
            )
        })

        const unionOfTypes: ts.UnionTypeNode = ts.createUnionTypeNode(types)

        return ts.createTypeAliasDeclaration(
            undefined,
            [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
            ts.createIdentifier(strictNameForStruct(node)),
            undefined,
            unionOfTypes,
        )

    } else {
        return ts.createTypeAliasDeclaration(
            undefined,
            [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
            ts.createIdentifier(strictNameForStruct(node)),
            undefined,
            ts.createTypeLiteralNode([]),
        )
    }
}

/**
 * This generates an interface for the argument to the constructor of any struct-like object
 * These include struct, union and exception
 *
 * EXAMPLE:
 *
 * // thrift
 * union MyUnion {
 *   1: i32 id,
 *   2: bool field1,
 * }
 *
 * // typescript
 * export type MyUnion = { id: number } | { field1: boolean }
 */
export function renderStrictInterface(node: UnionDefinition, identifiers: IIdentifierMap): Array<ts.TypeAliasDeclaration> {
    return [
        renderInterface(node, identifiers),
        renderLooseInterface(node, identifiers),
    ]
}
