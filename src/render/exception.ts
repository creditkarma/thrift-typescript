import {
  ClassDeclaration,
  createExpressionWithTypeArguments,
  createHeritageClause,
  createIdentifier,
  HeritageClause,
  SyntaxKind,
  updateClassDeclaration,
} from 'typescript'

import {
  ExceptionDefinition,
} from '@creditkarma/thrift-parser'

import {
  renderStruct,
} from './struct'

export function renderException(node: ExceptionDefinition): ClassDeclaration {
  const structClass: ClassDeclaration = renderStruct(node)
  const parent: HeritageClause = createHeritageClause(
    SyntaxKind.ExtendsKeyword,
    [ createExpressionWithTypeArguments(undefined, createIdentifier('Thrift.TException')) ],
  )

  return updateClassDeclaration(
    structClass,
    structClass.decorators,
    structClass.modifiers,
    structClass.name,
    structClass.typeParameters,
    [ parent ],
    structClass.members,
  )
}
