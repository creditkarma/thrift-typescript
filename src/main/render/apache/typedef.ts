import * as ts from 'typescript'

import { SyntaxType, TypedefDefinition } from '@creditkarma/thrift-parser'

import { TypeMapping } from './types'

import { resolveIdentifierName } from '../../resolver'
import { IRenderState, IResolvedIdentifier } from '../../types'

function renderTypeDefForIdentifier(
    id: IResolvedIdentifier,
    node: TypedefDefinition,
): Array<ts.Statement> {
    return [
        ts.createImportEqualsDeclaration(
            undefined,
            [ts.createToken(ts.SyntaxKind.ExportKeyword)],
            ts.createIdentifier(node.name.value),
            ts.createIdentifier(id.fullName),
        ),
    ]
}

export function renderTypeDef(
    node: TypedefDefinition,
    typeMapping: TypeMapping,
    state: IRenderState,
): Array<ts.Statement> {
    switch (node.definitionType.type) {
        case SyntaxType.Identifier:
            return renderTypeDefForIdentifier(
                resolveIdentifierName(node.definitionType.value, state),
                node,
            )

        default:
            return [
                ts.createTypeAliasDeclaration(
                    undefined,
                    [ts.createToken(ts.SyntaxKind.ExportKeyword)],
                    node.name.value,
                    undefined,
                    typeMapping(node.definitionType, state),
                ),
            ]
    }
}
