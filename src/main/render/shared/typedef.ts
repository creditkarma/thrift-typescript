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
    createConst,
} from './utils'

function mandledName(name: string): string {
    return name.split('.').join('$')
}

function createMappingForIdentifier(
    id: IResolvedIdentifier,
    node: TypedefDefinition,
): ts.Statement {
    switch (id.definition.type) {
        case SyntaxType.EnumDefinition:
            return ts.createVariableStatement(
                undefined,
                createConst(
                    mandledName(id.resolvedName),
                    undefined,
                    ts.createIdentifier(id.resolvedName),
                ),
            )

        default:
            return ts.createTypeAliasDeclaration(
                undefined,
                undefined,
                mandledName(id.resolvedName),
                undefined,
                ts.createTypeReferenceNode(
                    ts.createIdentifier(id.resolvedName),
                    undefined
                ),
            )
    }
}

function renderTypeDefForIdentifier(
    id: IResolvedIdentifier,
    node: TypedefDefinition,
    typeMapping: TypeMapping
): Array<ts.Statement> {
    switch (id.definition.type) {
        case SyntaxType.EnumDefinition:
            return [ ts.createImportEqualsDeclaration(
                undefined,
                [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
                ts.createIdentifier(node.name.value),
                ts.createIdentifier(id.resolvedName)
            ) ]

        case SyntaxType.StructDefinition:
        case SyntaxType.ExceptionDefinition:
        case SyntaxType.UnionDefinition:
            if (id.resolvedName !== id.name) {
                return [
                    createMappingForIdentifier(id, node),
                    ts.createExportDeclaration(
                        undefined,
                        undefined,
                        ts.createNamedExports([
                            ts.createExportSpecifier(
                                mandledName(id.resolvedName),
                                node.name.value,
                            )
                        ])
                    )
                ]

            } else {
                return [
                    ts.createExportDeclaration(
                        undefined,
                        undefined,
                        ts.createNamedExports([
                            ts.createExportSpecifier(
                                id.resolvedName,
                                node.name.value,
                            )
                        ])
                    )
                ]
            }

        default:
            return [ ts.createTypeAliasDeclaration(
                undefined,
                [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
                node.name.value,
                undefined,
                typeMapping(node.definitionType),
            ) ]
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
            return [ ts.createTypeAliasDeclaration(
                undefined,
                [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
                node.name.value,
                undefined,
                typeMapping(node.definitionType),
            ) ]
    }
}
