import * as ts from 'typescript'

import { SyntaxType, TypedefDefinition } from '@creditkarma/thrift-parser'

import { TypeMapping } from './types'

import { IRenderState, IResolvedIdentifier } from '../../types'

import { className, codecName, looseName, strictName } from './struct/utils'

function renderTypeDefForIdentifier(
    id: IResolvedIdentifier,
    node: TypedefDefinition,
    typeMapping: TypeMapping,
    state: IRenderState,
): Array<ts.Statement> {
    switch (id.definition.type) {
        case SyntaxType.ExceptionDefinition:
        case SyntaxType.StructDefinition:
        case SyntaxType.UnionDefinition:
            return [
                ts.createImportEqualsDeclaration(
                    undefined,
                    [ts.createToken(ts.SyntaxKind.ExportKeyword)],
                    ts.createIdentifier(
                        strictName(node.name.value, id.definition.type, state),
                    ),
                    ts.createIdentifier(
                        `${id.pathName}.${strictName(
                            id.name,
                            id.definition.type,
                            state,
                        )}`,
                    ),
                ),
                ts.createImportEqualsDeclaration(
                    undefined,
                    [ts.createToken(ts.SyntaxKind.ExportKeyword)],
                    ts.createIdentifier(
                        looseName(node.name.value, id.definition.type, state),
                    ),
                    ts.createIdentifier(
                        `${id.pathName}.${looseName(
                            id.name,
                            id.definition.type,
                            state,
                        )}`,
                    ),
                ),
                ts.createImportEqualsDeclaration(
                    undefined,
                    [ts.createToken(ts.SyntaxKind.ExportKeyword)],
                    ts.createIdentifier(className(node.name.value)),
                    ts.createIdentifier(`${id.pathName}.${className(id.name)}`),
                ),
                ts.createImportEqualsDeclaration(
                    undefined,
                    [ts.createToken(ts.SyntaxKind.ExportKeyword)],
                    ts.createIdentifier(codecName(node.name.value)),
                    ts.createIdentifier(codecName(id.resolvedName)),
                ),
            ]

        default:
            return [
                ts.createImportEqualsDeclaration(
                    undefined,
                    [ts.createToken(ts.SyntaxKind.ExportKeyword)],
                    ts.createIdentifier(node.name.value),
                    ts.createIdentifier(id.resolvedName),
                ),
            ]
    }
}

export function renderTypeDef(
    node: TypedefDefinition,
    typeMapping: TypeMapping,
    state: IRenderState,
): Array<ts.Statement> {
    switch (node.definitionType.type) {
        case SyntaxType.Identifier:
            return renderTypeDefForIdentifier(
                state.identifiers[node.definitionType.value],
                node,
                typeMapping,
                state,
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
