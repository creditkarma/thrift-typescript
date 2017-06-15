import {
  createTypeReferenceNode,
  TypeReferenceNode,
} from 'typescript'

import TypeNode from './TypeNode'

import { identifiers } from '../ast/identifiers'

export default class MapTypeNode {
  public name: string
  public keyType: TypeNode
  public valueType: TypeNode

  constructor(args) {
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
