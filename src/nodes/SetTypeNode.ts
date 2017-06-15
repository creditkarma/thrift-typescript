import {
  createTypeReferenceNode,
  TypeReferenceNode,
} from 'typescript'

import TypeNode from './TypeNode'

import { identifiers } from '../ast/identifiers'

export default class SetTypeNode {
  public name: string
  public valueType: TypeNode

  constructor(args) {
    this.name = args.name
    this.valueType = args.valueType
  }

  public toEnum(): string {
    return 'SET'
  }

  public toAST(): TypeReferenceNode {
    return createTypeReferenceNode(identifiers.Set, [this.valueType.toAST()])
  }
}
