import ConstNode from '../nodes/ConstNode'

import { resolveTypes } from './types'
import { resolveValues } from './values'

import collect from '../collect'

export function resolveConsts(idl: JsonAST) {
  const constants = collect(idl.const)

  return constants.map((constant) => {
    return new ConstNode({
      name: constant.name,
      type: resolveTypes(idl, constant.type),
      value: resolveValues(idl, constant.type, constant.value),
    })
  })
}
