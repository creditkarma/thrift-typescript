import {
  ArrayTypeNode,
  createArrayTypeNode,
} from 'typescript'

import ITypeNode from './ITypeNode'

export default class ListTypeNode implements ITypeNode {
  public name: string
  public valueType: ITypeNode

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
