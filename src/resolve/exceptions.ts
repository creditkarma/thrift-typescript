import ExceptionNode from '../nodes/ExceptionNode'
import StructPropertyNode from '../nodes/StructPropertyNode'

import { resolveTypes } from './types'

import collect from '../collect'

export function resolveExceptions(idl: JsonAST) {
  const exceptions = collect(idl.exception)

  return exceptions.map((exception) => {
    const { name } = exception

    const fields = exception.fields.map((field) => {
      return new StructPropertyNode({
        defaultValue: field.defaultValue,
        id: field.id,
        name: field.name,
        option: field.option,
        type: resolveTypes(idl, field.type),
      })
    })

    return new ExceptionNode({
      fields,
      // TODO: this should be a lookup somehow
      implements: `${name}Interface`,
      name,
    })
  })
}
