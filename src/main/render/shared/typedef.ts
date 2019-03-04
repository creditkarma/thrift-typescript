import * as ts from 'typescript'

import { SyntaxType, TypedefDefinition } from '@creditkarma/thrift-parser'

import { TypeMapping } from './types'

import { IIdentifierMap, IResolvedIdentifier } from '../../types'

function renderTypeDefForIdentifier(
    id: IResolvedIdentifier,
    node: TypedefDefinition,
): Array<ts.Statement> {
    return [
        ts.createImportEqualsDeclaration(
            undefined,
            [ts.createToken(ts.SyntaxKind.ExportKeyword)],
            ts.createIdentifier(node.name.value),
            ts.createIdentifier(id.resolvedName),
        ),
    ]
}

export function renderTypeDef(
    node: TypedefDefinition,
    typeMapping: TypeMapping,
    identifiers: IIdentifierMap,
): Array<ts.Statement> {
    switch (node.definitionType.type) {
        case SyntaxType.Identifier:
            return renderTypeDefForIdentifier(
                identifiers[node.definitionType.value],
                node,
            )

        default:
            return [
                ts.createTypeAliasDeclaration(
                    undefined,
                    [ts.createToken(ts.SyntaxKind.ExportKeyword)],
                    node.name.value,
                    undefined,
                    typeMapping(node.definitionType),
                ),
            ]
    }
}
