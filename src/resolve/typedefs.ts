import TypedefNode from '../nodes/TypedefNode'

import { resolveTypes } from './types'

import collect from '../collect'

export function resolveTypedefs(idl: JsonAST) {
  const typedefs = collect(idl.typedef)

  return typedefs.map((typedef) => {
    const { name, type } = typedef

    const entry = new TypedefNode({
      name,
      type: resolveTypes(idl, type),
    })

    return entry
  })
}
