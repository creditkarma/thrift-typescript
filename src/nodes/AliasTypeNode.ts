import { TypeNode } from 'typescript'

import { ITypeNode } from './interfaces'

// Aliases are just proxies to the underlying type
export default class AliasTypeNode implements ITypeNode {
  public name: string
  public valueType: ITypeNode

  constructor(args) {
    this.name = args.name
    this.valueType = args.valueType
  }

  public toEnum(): string {
    return this.valueType.toEnum()
  }

  // Aliases can be whatever type
  public toAST(): TypeNode {
    return this.valueType.toAST()
  }
}
