import {
  createLiteral,
  createEnumMember,
  createEnumDeclaration,

  EnumMember,
  EnumDeclaration
} from 'typescript';

import collect from '../collect';

import { tokens } from '../ast/tokens';

export class EnumPropertyNode {
  public name: string;
  public value: number;

  constructor(args) {
    this.name = args.name;
    this.value = args.value;
  }

  public toAST(): EnumMember {
    const _value = this.value ? createLiteral(this.value) : undefined;
    return createEnumMember(this.name, _value);
  }
}

export class EnumNode {
  public name: string;
  public fields: EnumPropertyNode[];

  constructor(args) {
    this.name = args.name;
    this.fields = args.fields;
  }

  public toAST(): EnumDeclaration {
    const _members = this.fields.map((field) => field.toAST());
    const _enum = createEnumDeclaration(undefined, [tokens.export], this.name, _members);

    return _enum;
  }
}

export function resolveEnums(idl: JsonAST) {
  const enums = collect(idl.enum);

  return enums.map(({ name, items }) => {
    // TODO: rename to fields?
    const fields = items.map((field) => {
      return new EnumPropertyNode({
        name: field.name,
        value: field.value
      });
    });

    return new EnumNode({
      name: name,
      fields: fields
    });
  })
}