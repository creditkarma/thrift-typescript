import {
  createPropertySignature,
  PropertySignature,
} from 'typescript'

import TypeNode from './TypeNode'

import { toOptional } from '../ast-helpers'

export default class InterfacePropertyNode {
  public name: string
  public type: TypeNode
  public option?: string

  constructor(args) {
    this.name = args.name
    this.type = args.type
    this.option = args.option
  }

  public toAST(): PropertySignature {
    const type = this.type.toAST()
    const optional = toOptional(this.option)

    return createPropertySignature(undefined, this.name, optional, type, undefined)
  }
}
