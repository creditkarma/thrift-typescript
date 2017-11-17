import * as ts from 'typescript'

import {
  TypedefDefinition,
  SyntaxType,
} from '@creditkarma/thrift-parser'

import {
  typeNodeForFieldType,
} from './types'

import {
  IResolvedIdentifier,
  IIdentifierMap,
} from '../../types'

function renderTypeDefForIdentifier(id: IResolvedIdentifier, node: TypedefDefinition): Array<ts.Statement> {
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
        typeNodeForFieldType(node.definitionType),
      ) ]
  }
}

export function renderTypeDef(node: TypedefDefinition, identifiers: IIdentifierMap): Array<ts.Statement> {
  switch (node.definitionType.type) {
    case SyntaxType.Identifier:
      return renderTypeDefForIdentifier(identifiers[node.definitionType.value], node)

    default:
      return [ ts.createTypeAliasDeclaration(
        undefined,
        [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
        node.name.value,
        undefined,
        typeNodeForFieldType(node.definitionType),
      ) ]
  }
}
