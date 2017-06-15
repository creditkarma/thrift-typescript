import {
  createTypeReferenceNode,
  TypeReferenceNode,
} from 'typescript'

export default class EnumTypeNode {
  public name: string
  public valueType: string

  constructor(args) {
    this.name = args.name
    this.valueType = args.valueType
  }

  public toEnum(): string {
    // TODO: should this always be an i32?
    return 'I32'
  }

  public toAST(): TypeReferenceNode {
    return createTypeReferenceNode(this.valueType, undefined)
  }
}
