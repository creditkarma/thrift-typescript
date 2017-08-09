import TypedefNode from '../nodes/TypedefNode'

import { resolveTypes } from './types'

import collect from '../collect'

export function resolveTypedefs(idl: JsonAST): TypedefNode[] {
  const typedefs = collect(idl.typedef)

  return typedefs.map((typedef) => {
    const { name, type } = typedef

    return new TypedefNode({
      name,
      type: resolveTypes(idl, type),
    })
  })
}
