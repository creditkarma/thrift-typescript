import {
  ArrayTypeNode,
  createArrayTypeNode,
} from 'typescript'

import TypeNode from './TypeNode'

export default class ListTypeNode {
  public name: string
  public valueType: TypeNode

  constructor(args) {
    this.name = args.name
    this.valueType = args.valueType
  }

  public toEnum(): string {
    return 'LIST'
  }

  public toAST(): ArrayTypeNode {
    return createArrayTypeNode(this.valueType.toAST())
  }
}
