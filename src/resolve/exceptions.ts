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

import { StructNode, StructPropertyNode } from './structs'
import { resolveTypeNode } from './typedefs'

import { identifiers as _id } from '../ast/identifiers'
import { tokens } from '../ast/tokens'
import collect from '../collect'
import { createConstructor, createRead, createWrite } from '../create'

// TypeScript has this as an internal method so implement a custom version
import { createNodeArray, setTextRange, updateBlock } from 'typescript'
function insertLeadingStatements(dest, sources: any[]) {
  return updateBlock(dest, setTextRange(createNodeArray(sources.concat(dest.statements)), dest.statements))
}

export class ExceptionNode extends StructNode {
  // TODO: Maybe this should have "extends" property

  public toAST(): ExpressionStatement {
    // TODO: a bit hacky to use the same code as Structs
    const name = createLiteral(this.name)
    const nameField = createProperty(undefined, [tokens.public], 'name', undefined,
      createKeywordTypeNode(SyntaxKind.StringKeyword), name)
    const superCall = createCall(createSuper(), undefined, [name])

    const fields = this.fields.map((field) => field.toAST())

    const hasFields = (this.fields.filter((field) => field.id).length > 0)

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
      createExpressionWithTypeArguments(undefined, createPropertyAccess(_id.Thrift, 'TException')),
    ])
    heritage.push(extendsClause)
    // TODO: This is a pretty hacky solution
    if (hasFields) {
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
}

export function resolveExceptions(idl: JsonAST) {
  const exceptions = collect(idl.exception)

  return exceptions.map((exception) => {
    const { name } = exception

    const fields = exception.fields.map((field) => {
      return new StructPropertyNode({
        defaultValue: field.defaultValue,
        id: field.id,
        name: field.name,
        option: field.option,
        type: resolveTypeNode(idl, field.type),
      })
    })

    return new ExceptionNode({
      fields,
      // TODO: this should be a lookup somehow
      implements: `${name}Interface`,
      name,
    })
  })
}
