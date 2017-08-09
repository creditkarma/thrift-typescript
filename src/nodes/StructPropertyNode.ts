import {
  createLiteral,
  createNull,
  createProperty,
  PropertyDeclaration,
} from 'typescript'

import { ITypeNode } from './interfaces'

import { toOptional } from '../ast-helpers'
import { tokens } from '../ast/tokens'

export default class StructPropertyNode {
  public id?: number
  public name: string
  public type: ITypeNode
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
