import {
  createInterfaceDeclaration,
  InterfaceDeclaration,
} from 'typescript'

import InterfacePropertyNode from './InterfacePropertyNode'

import { tokens } from '../ast/tokens'

export default class InterfaceNode {
  public name: string
  public fields: InterfacePropertyNode[]

  constructor(args) {
    this.name = args.name
    this.fields = args.fields
  }

  public toAST(): InterfaceDeclaration {
    const signatures = this.fields.map((field) => field.toAST())

    return createInterfaceDeclaration(undefined, [tokens.export], this.name, [], [], signatures)
  }
}
