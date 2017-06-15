import {
  ArrayLiteralExpression,
  createArrayLiteral,
} from 'typescript'

import ValueNode from './ValueNode'

export default class ListValueNode {
  public values: ValueNode[]

  constructor(values) {
    this.values = values
  }

  public toAST(): ArrayLiteralExpression {
    const values = this.values.map((val) => val.toAST())
    return createArrayLiteral(values)
  }
}
