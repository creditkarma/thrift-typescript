import {
  createVariableDeclaration,
  createVariableDeclarationList,
  createVariableStatement,
  NodeFlags,
  VariableStatement,
} from 'typescript'

import { resolveTypeNode, TypeNode } from './typedefs'
import { resolveValueNode, ValueNode } from './values'

import { tokens } from '../ast/tokens'
import collect from '../collect'

export class ConstNode {
  public name: string
  public type: TypeNode
  public value: ValueNode

  constructor(args) {
    this.name = args.name
    this.type = args.type
    this.value = args.value
  }

  public toAST(): VariableStatement {
    const constDeclaration = createVariableDeclaration(this.name, this.type.toAST(), this.value.toAST())

    const constDeclarationList = createVariableDeclarationList([constDeclaration], NodeFlags.Const)

    return createVariableStatement([tokens.export], constDeclarationList)
  }
}

export function resolveConsts(idl: JsonAST) {
  const constants = collect(idl.const)

  return constants.map((constant) => {
    return new ConstNode({
      name: constant.name,
      type: resolveTypeNode(idl, constant.type),
      value: resolveValueNode(idl, constant.type, constant.value),
    })
  })
}
