import UnionNode from '../nodes/UnionNode'
import UnionPropertyNode from '../nodes/UnionPropertyNode'

import { resolveTypes } from './types'

import collect from '../collect'

export function resolveUnions(idl: JsonAST): UnionNode[] {
  const unions = collect(idl.union)

  return unions.map((union) => {
    const { name } = union

    const fields = union.fields.map((field) => {
      return new UnionPropertyNode({
        defaultValue: field.defaultValue,
        id: field.id,
        name: field.name,
        option: field.option,
        type: resolveTypes(idl, field.type),
      })
    })

    return new UnionNode({
      fields,
      // TODO: this should be a lookup somehow
      implements: `I${name}`,
      name,
    })
  })
}
