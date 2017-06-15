import {
  ArrayTypeNode,
  KeywordTypeNode,
  TypeReferenceNode,
} from 'typescript'

import TypeNode from './TypeNode'

// Aliases are just proxies to the underlying type
export default class AliasTypeNode {
  public name: string
  public valueType: TypeNode

  constructor(args) {
    this.name = args.name
    this.valueType = args.valueType
  }

  public toEnum(): string {
    return this.valueType.toEnum()
  }

  // Aliases can be whatever type
  public toAST(): TypeReferenceNode | ArrayTypeNode | KeywordTypeNode {
    return this.valueType.toAST()
  }
}
