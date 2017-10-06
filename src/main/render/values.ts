import * as ts from 'typescript'

import {
  ConstList,
  ConstMap,
  FunctionType,
  ConstValue,
  SyntaxType,
  ListType,
  SetType,
  MapType
} from '@creditkarma/thrift-parser'

import { COMMON_IDENTIFIERS } from './identifiers'

/**
 *
 * @param node
 */
export function renderValue(fieldType: FunctionType, node: ConstValue): ts.Expression {
  switch (node.type) {
    case SyntaxType.Identifier:
      return ts.createIdentifier(node.value)

    case SyntaxType.IntConstant:
      if (fieldType.type === SyntaxType.I64Keyword) {
        return ts.createNew(
          COMMON_IDENTIFIERS.Int64,
          undefined,
          [ ts.createLiteral(node.value) ]
        )
      } else {
        return ts.createLiteral(parseInt(node.value))
      }

    case SyntaxType.BooleanLiteral:
    case SyntaxType.StringLiteral:
    case SyntaxType.DoubleConstant:
      return ts.createLiteral(node.value)

    case SyntaxType.ConstList:
      if (fieldType.type === SyntaxType.ListType) {
        return renderList(fieldType, node)
      } else if (fieldType.type === SyntaxType.SetType) {
        return renderSet(fieldType, node)
      } else {
        throw new TypeError(`Type list | set expected`)
      }

    case SyntaxType.ConstMap:
      if (fieldType.type === SyntaxType.MapType) {
        return renderMap(fieldType, node)
      } else {
        throw new TypeError(`Type map expected`)
      }

    default:
      const msg: never = node
      throw new Error(`Non-exhaustive match for ${msg}`)
  }
}

function renderMap(fieldType: MapType, node: ConstMap): ts.NewExpression {
  const values = node.properties.map(({ name, initializer }) => {
    return ts.createArrayLiteral([
      renderValue(fieldType.keyType, name),
      renderValue(fieldType.valueType, initializer),
    ])
  })

  return ts.createNew(
    COMMON_IDENTIFIERS.Map,
    undefined,
    [ ts.createArrayLiteral(values) ],
  )
}

function renderSet(fieldType: SetType, node: ConstList): ts.NewExpression {
  const values: Array<ts.Expression> = node.elements.map((val: ConstValue) => {
    return renderValue(fieldType.valueType, val)
  })

  return ts.createNew(
    COMMON_IDENTIFIERS.Set,
    undefined,
    [ ts.createArrayLiteral(values) ]
  )
}

function renderList(fieldType: ListType, node: ConstList): ts.ArrayLiteralExpression {
  const values: Array<ts.Expression> = node.elements.map((val: ConstValue) => {
    return renderValue(fieldType.valueType, val)
  })

  return ts.createArrayLiteral(values)
}
