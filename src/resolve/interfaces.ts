import {
  createInterfaceDeclaration,
  createPropertySignature,

  InterfaceDeclaration,
  PropertySignature
} from 'typescript'

import { TypeNode, resolveTypeNode } from './typedefs'

import { getInterfaces } from '../get';
import { toOptional } from '../ast-helpers';
import { tokens } from '../ast/tokens';

export class InterfacePropertyNode {
  public name: string;
  public type: TypeNode;
  public option?: string;

  constructor(args) {
    this.name = args.name;
    this.type = args.type;
    this.option = args.option;
  }

  public toAST(): PropertySignature {
    let _type = this.type.toAST();
    let _optional = toOptional(this.option);

    return createPropertySignature(undefined, this.name, _optional, _type, undefined);
  }
}

export class InterfaceNode {
  public name: string;
  public fields: InterfacePropertyNode[];

  constructor(args) {
    this.name = args.name;
    this.fields = args.fields;
  }

  public toAST(): InterfaceDeclaration {
    const signatures = this.fields.map((field) => field.toAST());

    return createInterfaceDeclaration(undefined, [tokens.export], this.name, [], [], signatures);
  }
}

export function resolveInterfaces(idl: JsonAST) {
  const interfaces = getInterfaces(idl);

  // TODO: This is a pretty hacky solution
  return interfaces.filter((iface) => iface.fields.length).map((iface) => {
    const { name } = iface;

    const fields = iface.fields.map((field: { name: string, type: string, option?: string}) => {
      return new InterfacePropertyNode({
        name: field.name,
        option: field.option,
        type: resolveTypeNode(idl, field.type)
      });
    });

    return new InterfaceNode({
      name: `${name}Interface`,
      fields: fields
    });
  });
}