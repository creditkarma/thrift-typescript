import {
  createVariableDeclaration,
  createVariableDeclarationList,
  createVariableStatement,
  NodeFlags,
  VariableStatement,
} from 'typescript'

import ITypeNode from './ITypeNode'
import ValueNode from './ValueNode'

import { tokens } from '../ast/tokens'

export default class ConstNode {
  public name: string
  public type: ITypeNode
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
