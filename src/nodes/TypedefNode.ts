import {
  createTypeAliasDeclaration,
  TypeAliasDeclaration,
} from 'typescript'

import { ITypeNode } from './interfaces'

import { tokens } from '../ast/tokens'

export default class TypedefNode {
  public name: string
  public type: ITypeNode

  constructor(args) {
    this.name = args.name
    this.type = args.type
  }

  public toAST(): TypeAliasDeclaration {
    return createTypeAliasDeclaration(undefined, [tokens.export], this.name, undefined, this.type.toAST())
  }
}
