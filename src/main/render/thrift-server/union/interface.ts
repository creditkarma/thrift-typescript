import * as ts from 'typescript'

import {
    UnionDefinition,
    FieldDefinition,
} from '@creditkarma/thrift-parser'

import {
    typeNodeForFieldType,
} from '../../shared/types'

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
export function renderInterface(node: UnionDefinition): ts.TypeAliasDeclaration {
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
                            typeNodeForFieldType(field.fieldType, true) :
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
            ts.createIdentifier(node.name.value),
            undefined,
            unionOfTypes,
        )
    } else {
        return ts.createTypeAliasDeclaration(
            undefined,
            [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
            ts.createIdentifier(node.name.value),
            undefined,
            ts.createTypeLiteralNode([]),
        )
    }
}
