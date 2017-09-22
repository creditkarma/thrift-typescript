import * as ts from 'typescript'

import {
  TypedefDefinition
} from '@creditkarma/thrift-parser'

import {
  typeNodeForFieldType
} from './types'

export function renderTypeDef(node: TypedefDefinition): ts.TypeAliasDeclaration {
  return ts.createTypeAliasDeclaration(
    undefined,
    [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
    node.name.value,
    undefined,
    typeNodeForFieldType(node.definitionType),
  )
}