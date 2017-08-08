import NamespaceNode from '../nodes/NamespaceNode'

import { basename, extname } from 'path'

// TODO: IDL has filename attached
export function resolveNamespace(idl: JsonAST, filename: string): NamespaceNode {
  const scope = 'js.ts'

  if (idl.namespace && idl.namespace[scope]) {
    const namespace = idl.namespace[scope].serviceName
    return new NamespaceNode(namespace)
  } else {
    const namespace = basename(filename, extname(filename))
    return new NamespaceNode(namespace)
  }
}
