import {
  createEnumDeclaration,
  EnumDeclaration,
} from 'typescript'

import EnumPropertyNode from './EnumPropertyNode'

import { tokens } from '../ast/tokens'

export default class EnumNode {
  public name: string
  public fields: EnumPropertyNode[]

  constructor(args) {
    this.name = args.name
    this.fields = args.fields
  }

  public toAST(): EnumDeclaration {
    const members = this.fields.map((field) => field.toAST())
    const enumDeclaration = createEnumDeclaration(undefined, [tokens.export], this.name, members)

    return enumDeclaration
  }
}
