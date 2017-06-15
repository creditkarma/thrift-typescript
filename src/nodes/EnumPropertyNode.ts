import {
  createEnumMember,
  createLiteral,
  EnumMember,
} from 'typescript'

export default class EnumPropertyNode {
  public name: string
  public value: number

  constructor(args) {
    this.name = args.name
    this.value = args.value
  }

  public toAST(): EnumMember {
    const value = this.value ? createLiteral(this.value) : undefined
    return createEnumMember(this.name, value)
  }
}
