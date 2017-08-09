import {
  createCall,
  createClassExpression,
  createExpressionWithTypeArguments,
  createHeritageClause,
  createIdentifier,
  createKeywordTypeNode,
  createLiteral,
  createProperty,
  createPropertyAccess,
  createStatement,
  createSuper,
  ExpressionStatement,
  SyntaxKind,
} from 'typescript'

import StructNode from '../nodes/StructNode'

import { identifiers } from '../ast/identifiers'
import { tokens } from '../ast/tokens'

import { createConstructor, createRead, createWrite } from '../create'
import insertLeadingStatements from '../insert-leading-statements'

export default class ExceptionNode extends StructNode {
  // TODO: Maybe this should have "extends" property

  public toAST(): ExpressionStatement {
    // TODO: a bit hacky to use the same code as Structs
    const name = createLiteral(this.name)
    const nameField = createProperty(undefined, [tokens.public], 'name', undefined,
      createKeywordTypeNode(SyntaxKind.StringKeyword), name)
    const superCall = createCall(createSuper(), undefined, [name])

    const fields = this.fields.map((field) => field.toAST())

    // Build the constructor body
    const ctor = createConstructor(this)
    ctor.body = insertLeadingStatements(ctor.body, [superCall])

    // Build the `read` method
    const read = createRead(this)

    // Build the `write` method
    const write = createWrite(this)

    const heritage = []
    // Extends must precede implements
    const extendsClause = createHeritageClause(SyntaxKind.ExtendsKeyword, [
      createExpressionWithTypeArguments(undefined, createPropertyAccess(identifiers.Thrift, 'TException')),
    ])
    heritage.push(extendsClause)
    // TODO: This is a pretty hacky solution
    if (this.hasFields()) {
      const implementsClause = createHeritageClause(SyntaxKind.ImplementsKeyword, [
        createExpressionWithTypeArguments(undefined, createIdentifier(this.implements)),
      ])
      heritage.push(implementsClause)
    }

    const classExpression = createClassExpression([tokens.export], this.name, [], heritage, [
      nameField,
      ...fields,
      ctor,
      read,
      write,
    ])

    const classStatement = createStatement(classExpression)

    return classStatement
  }

  private hasFields(): boolean {
    return this.fields.length > 0
  }
}
