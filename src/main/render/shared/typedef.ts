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

function renderTypeDefForIdentifier(
    id: IResolvedIdentifier,
    node: TypedefDefinition,
    typeMapping: TypeMapping
): Array<ts.Statement> {
    switch (id.definition.type) {
        case SyntaxType.EnumDefinition:
        case SyntaxType.StructDefinition:
        case SyntaxType.ExceptionDefinition:
        case SyntaxType.UnionDefinition:
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
    identifiers: IIdentifierMap
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
