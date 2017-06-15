import StructNode from '../nodes/StructNode'
import StructPropertyNode from '../nodes/StructPropertyNode'

import { resolveTypes } from './types'

import collect from '../collect'

export function resolveStructs(idl: JsonAST) {
  const structs = collect(idl.struct)

  return structs.map((struct) => {
    const { name } = struct

    const fields = struct.fields
      .map((field: { id?: number, name: string, type: string, option?: string, defaultValue?: any }) => {
        return new StructPropertyNode({
          defaultValue: field.defaultValue,
          id: field.id,
          name: field.name,
          option: field.option,
          type: resolveTypes(idl, field.type),
        })
      })

    return new StructNode({
      fields,
      // TODO: this should be a lookup somehow
      implements: `${name}Interface`,
      name,
    })
  })
}
