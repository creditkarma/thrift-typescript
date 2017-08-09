import {
  createTypeReferenceNode,
  TypeReferenceNode,
} from 'typescript'

import { ITypeNode } from './interfaces'

import { identifiers } from '../ast/identifiers'

export default class SetTypeNode implements ITypeNode {
  public name: string
  public valueType: ITypeNode

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
