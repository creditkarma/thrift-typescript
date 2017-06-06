import {
  createVariableStatement,
  createVariableDeclaration,
  createVariableDeclarationList,

  NodeFlags,

  VariableStatement
} from 'typescript';

import { TypeNode, resolveTypeNode } from './typedefs';
import { ValueNode, resolveValueNode } from './values';

import { tokens } from '../ast/tokens';
import collect from '../collect';

export class ConstNode {
  public name: string;
  public type: TypeNode;
  public value: ValueNode;

  constructor(args) {
    this.name = args.name;
    this.type = args.type;
    this.value = args.value;
  }

  public toAST(): VariableStatement {
    const _const = createVariableDeclaration(this.name, this.type.toAST(), this.value.toAST());

    const _constList = createVariableDeclarationList([_const], NodeFlags.Const);

    return createVariableStatement([tokens.export], _constList);
  }
}

export function resolveConsts(idl: JsonAST) {
  const constants = collect(idl.const);

  return constants.map((constant) => {
    return new ConstNode({
      name: constant.name,
      type: resolveTypeNode(idl, constant.type),
      value: resolveValueNode(idl, constant.type, constant.value)
    });
  });
}