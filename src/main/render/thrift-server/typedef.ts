import * as ts from 'typescript'

import {
    TypedefDefinition,
    SyntaxType,
} from '@creditkarma/thrift-parser'

import {
    TypeMapping,
} from './types'

import {
    IResolvedIdentifier,
    IIdentifierMap,
} from '../../types'

import {
    looseName,
    codecName,
    strictName,
} from './struct/utils';

function renderTypeDefForIdentifier(
    id: IResolvedIdentifier,
    node: TypedefDefinition,
    typeMapping: TypeMapping
): Array<ts.Statement> {
    switch (id.definition.type) {
        case SyntaxType.ExceptionDefinition:
            return [
                ts.createImportEqualsDeclaration(
                    undefined,
                    [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
                    ts.createIdentifier(strictName(node.name.value)),
                    ts.createIdentifier(strictName(id.resolvedName)),
                ),
                ts.createImportEqualsDeclaration(
                    undefined,
                    [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
                    ts.createIdentifier(codecName(node.name.value)),
                    ts.createIdentifier(codecName(id.resolvedName)),
                )
            ]

        case SyntaxType.StructDefinition:
        case SyntaxType.UnionDefinition:
            return [
                ts.createImportEqualsDeclaration(
                    undefined,
                    [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
                    ts.createIdentifier(strictName(node.name.value)),
                    ts.createIdentifier(strictName(id.resolvedName)),
                ),
                ts.createImportEqualsDeclaration(
                    undefined,
                    [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
                    ts.createIdentifier(looseName(node.name.value)),
                    ts.createIdentifier(looseName(id.resolvedName)),
                ),
                ts.createImportEqualsDeclaration(
                    undefined,
                    [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
                    ts.createIdentifier(codecName(node.name.value)),
                    ts.createIdentifier(codecName(id.resolvedName)),
                )
            ]

        default:
            return [
                ts.createImportEqualsDeclaration(
                    undefined,
                    [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
                    ts.createIdentifier(strictName(node.name.value)),
                    ts.createIdentifier(strictName(id.resolvedName)),
                )
            ]
    }
}

export function renderTypeDef(
    node: TypedefDefinition,
    typeMapping: TypeMapping,
    identifiers: IIdentifierMap,
): Array<ts.Statement> {
    switch (node.definitionType.type) {
        case SyntaxType.Identifier:
            return renderTypeDefForIdentifier(identifiers[node.definitionType.value], node, typeMapping)

        default:
            return [
                ts.createTypeAliasDeclaration(
                    undefined,
                    [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
                    node.name.value,
                    undefined,
                    typeMapping(node.definitionType),
                )
            ]
    }
}