import {
  createLiteral,
  PrimaryExpression,
} from 'typescript'

export default class BaseValueNode {
  public value: string | number | boolean

  constructor(value) {
    this.value = value
  }

  public toAST(): PrimaryExpression {
    return createLiteral(this.value)
  }
}
