import {
  createTypeReferenceNode,
  TypeReferenceNode,
} from 'typescript'

import ITypeNode from './ITypeNode'

import { identifiers } from '../ast/identifiers'

export default class MapTypeNode implements ITypeNode {
  public name: string
  public keyType: ITypeNode
  public valueType: ITypeNode

  constructor(args: { name: string, keyType: ITypeNode, valueType: ITypeNode }) {
    this.name = args.name
    this.keyType = args.keyType
    this.valueType = args.valueType
  }

  public toEnum(): string {
    return 'MAP'
  }

  public toAST(): TypeReferenceNode {
    return createTypeReferenceNode(identifiers.Map, [this.keyType.toAST(), this.valueType.toAST()])
  }
}
