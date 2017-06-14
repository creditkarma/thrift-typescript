import {
  createEnumDeclaration,
  createEnumMember,
  createLiteral,
  EnumDeclaration,
  EnumMember,
} from 'typescript'

import collect from '../collect'

import { tokens } from '../ast/tokens'

export class EnumPropertyNode {
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

// tslint:disable-next-line:max-classes-per-file
export class EnumNode {
  public name: string
  public fields: EnumPropertyNode[]

  constructor(args) {
    this.name = args.name
    this.fields = args.fields
  }

  public toAST(): EnumDeclaration {
    const members = this.fields.map((field) => field.toAST())
    const enumDeclaration = createEnumDeclaration(undefined, [tokens.export], this.name, members)

    return enumDeclaration
  }
}

export function resolveEnums(idl: JsonAST) {
  const enums = collect(idl.enum)

  return enums.map(({ name, items }) => {
    // TODO: rename to fields?
    const fields = items.map((field) => {
      return new EnumPropertyNode({
        name: field.name,
        value: field.value,
      })
    })

    return new EnumNode({
      fields,
      name,
    })
  })
}
