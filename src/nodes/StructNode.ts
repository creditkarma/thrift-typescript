import {
  createClassExpression,
  createExpressionWithTypeArguments,
  createHeritageClause,
  createIdentifier,
  createStatement,
  ExpressionStatement,
  SyntaxKind,
} from 'typescript'

import StructPropertyNode from './StructPropertyNode'

import { tokens } from '../ast/tokens'

import { createConstructor, createRead, createWrite } from '../create'

export default class StructNode {
  public name: string
  public implements: string
  public fields: StructPropertyNode[]

  constructor(args) {
    this.name = args.name
    this.implements = args.implements
    this.fields = args.fields
  }

  get size(): number {
    return this.fields.length
  }

  public toAST(): ExpressionStatement {
    const fields = this.fields.map((field) => field.toAST())

    // Build the constructor body
    const ctor = createConstructor(this)

    // Build the `read` method
    const read = createRead(this)

    // Build the `write` method
    const write = createWrite(this)

    const heritage = []
    // TODO: This is a pretty hacky solution
    if (this.size) {
      const implementsClause = createHeritageClause(SyntaxKind.ImplementsKeyword, [
        createExpressionWithTypeArguments(undefined, createIdentifier(this.implements)),
      ])
      heritage.push(implementsClause)
    }

    const classExpression = createClassExpression([tokens.export], this.name, [], heritage, [
      ...fields,
      ctor,
      read,
      write,
    ])

    const classStatement = createStatement(classExpression)

    return classStatement
  }
}
