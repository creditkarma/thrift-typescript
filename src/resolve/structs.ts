import {
  createClassExpression,
  createExpressionWithTypeArguments,
  createHeritageClause,
  createIdentifier,
  createLiteral,
  createNull,
  createProperty,
  createStatement,
  ExpressionStatement,
  PropertyDeclaration,
  SyntaxKind,
} from 'typescript'

import { resolveTypeNode, TypeNode } from './typedefs'

import { toOptional } from '../ast-helpers'
import { tokens } from '../ast/tokens'
import collect from '../collect'

import { createConstructor, createRead, createWrite } from '../create'

export class StructPropertyNode {
  public id?: number
  public name: string
  public type: TypeNode
  public option?: string
  public defaultValue?: any // TODO: better type?

  constructor(args) {
    this.id = args.id
    this.name = args.name
    this.type = args.type
    this.option = args.option
    this.defaultValue = args.defaultValue
  }

  public toAST(): PropertyDeclaration {

    const optional = toOptional(this.option)

    let defaultValue
    if (this.defaultValue != null) {
      defaultValue = createLiteral(this.defaultValue)
    } else {
      defaultValue = createNull()
    }

    return createProperty(undefined, [tokens.public], this.name, optional, this.type.toAST(), defaultValue)
  }
}

// tslint:disable-next-line:max-classes-per-file
export class StructNode {
  public name: string
  public implements: string
  public fields: StructPropertyNode[]

  constructor(args) {
    this.name = args.name
    this.implements = args.implements
    this.fields = args.fields
  }

  public toAST(): ExpressionStatement {
    const fields = this.fields.map((field) => field.toAST())

    const hasFields = (this.fields.filter((field) => field.id).length > 0)

    // Build the constructor body
    const ctor = createConstructor(this)

    // Build the `read` method
    const read = createRead(this)

    // Build the `write` method
    const write = createWrite(this)

    const heritage = []
    // TODO: This is a pretty hacky solution
    if (hasFields) {
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

export function resolveStructs(idl: JsonAST) {
  const structs = collect(idl.struct)

  return structs.map((struct) => {
    const { name } = struct

    const fields = struct.fields
      .map((field: { id?: number, name: string, type: string, option?: string, defaultValue?: any }) => {
        return new StructPropertyNode({
          defaultValue: field.defaultValue,
          id: field.id,
          name: field.name,
          option: field.option,
          type: resolveTypeNode(idl, field.type),
        })
      })

    return new StructNode({
      fields,
      // TODO: this should be a lookup somehow
      implements: `${name}Interface`,
      name,
    })
  })
}
