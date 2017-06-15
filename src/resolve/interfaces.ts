import InterfaceNode from '../nodes/InterfaceNode'
import InterfacePropertyNode from '../nodes/InterfacePropertyNode'

import { resolveTypes } from './types'

import { getInterfaces } from '../get'

export function resolveInterfaces(idl: JsonAST) {
  const interfaces = getInterfaces(idl)

  // TODO: This is a pretty hacky solution
  return interfaces.filter((iface) => iface.fields.length).map((iface) => {
    const { name } = iface

    const fields = iface.fields.map((field: { name: string, type: string, option?: string}) => {
      return new InterfacePropertyNode({
        name: field.name,
        option: field.option,
        type: resolveTypes(idl, field.type),
      })
    })

    return new InterfaceNode({
      fields,
      name: `I${name}`,
    })
  })
}
