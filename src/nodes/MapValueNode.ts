import {
  createArrayLiteral,
  createNew,
  NewExpression,
} from 'typescript'

import ValueNode from './ValueNode'

import { identifiers } from '../ast/identifiers'

export default class MapValueNode {
  public values: Array<{ key: ValueNode, value: ValueNode }>

  constructor(values) {
    this.values = values
  }

  public toAST(): NewExpression {
    const values = this.values.map((tuple) => {
      return createArrayLiteral([tuple.key.toAST(), tuple.value.toAST()])
    })
    return createNew(identifiers.Map, undefined, [createArrayLiteral(values)])
  }
}
