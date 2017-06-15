import {
  createTypeReferenceNode,
  TypeReferenceNode,
} from 'typescript'

export default class StructTypeNode {
  public name: string
  public valueType: string

  constructor(args) {
    this.name = args.name
    this.valueType = args.valueType
  }

  public toEnum(): string {
    return 'STRUCT'
  }

  public toAST(): TypeReferenceNode {
    return createTypeReferenceNode(this.valueType, undefined)
  }
}
