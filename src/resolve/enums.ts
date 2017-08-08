import EnumNode from '../nodes/EnumNode'
import EnumPropertyNode from '../nodes/EnumPropertyNode'

import collect from '../collect'

export function resolveEnums(idl: JsonAST): EnumNode[] {
  const enums = collect(idl.enum)

  return enums.map(({ name, items }) => {
    // TODO: rename to fields?
    const fields = items.map((field) => {
      return new EnumPropertyNode({
        name: field.name,
        value: field.value,
      })
    })

    return new EnumNode({
      fields,
      name,
    })
  })
}
