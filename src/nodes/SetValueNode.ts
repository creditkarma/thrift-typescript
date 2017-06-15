import {
  createArrayLiteral,
  createNew,
  NewExpression,
} from 'typescript'

import ValueNode from './ValueNode'

import { identifiers } from '../ast/identifiers'

export default class SetValueNode {
  public values: ValueNode[]

  constructor(values) {
    this.values = values
  }

  public toAST(): NewExpression {
    const values = this.values.map((val) => val.toAST())
    return createNew(identifiers.Set, undefined, [createArrayLiteral(values)])
  }
}
