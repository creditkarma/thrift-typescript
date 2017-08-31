import {
  ArrayLiteralExpression,
  createArrayLiteral,
  createLiteral,
  createNew,
  Expression,
  NewExpression,
} from 'typescript'

import {
  ConstList,
  ConstMap,
  ConstValue,
  SyntaxType,
} from '@creditkarma/thrift-parser'

import { COMMON_IDENTIFIERS } from './identifiers'

export function renderMap(node: ConstMap): NewExpression {
  const values = node.properties.map(({ name, initializer }) => {
    return createArrayLiteral([
      renderValue(name),
      renderValue(initializer),
    ])
  })

  return createNew(
    COMMON_IDENTIFIERS.Map,
    undefined,
    [ createArrayLiteral(values) ],
  )
}

export function renderList(node: ConstList): ArrayLiteralExpression {
  const values = node.elements.map((val: ConstValue) => renderValue(node))
  return createArrayLiteral(values)
}

/**
 *
 * @param node
 */
export function renderValue(node: ConstValue): Expression {
  switch (node.type) {
    case SyntaxType.BooleanLiteral:
    case SyntaxType.StringLiteral:
    case SyntaxType.IntConstant:
    case SyntaxType.DoubleConstant:
      return createLiteral(node.value)

    case SyntaxType.ConstList:
      return renderList(node)

    case SyntaxType.ConstMap:
      return renderMap(node)

    default:
      return null
  }
}
