import IDLNode from '../nodes/IDLNode'

import { resolveConsts } from './consts'
import { resolveEnums } from './enums'
import { resolveExceptions } from './exceptions'
import { resolveInterfaces } from './interfaces'
import { resolveNamespace } from './namespace'
import { resolveStructs } from './structs'
import { resolveTypedefs } from './typedefs'
import { resolveUnions } from './unions'

// TODO: IDLFile[]
export function resolveIDLs(files: any[]) {
  return files.map((file) => new IDLNode({
    consts: resolveConsts(file.idl),
    enums: resolveEnums(file.idl),
    exceptions: resolveExceptions(file.idl),
    filename: file.filename,
    interfaces: resolveInterfaces(file.idl),
    namespace: resolveNamespace(file.idl, file.filename),
    structs: resolveStructs(file.idl),
    typedefs: resolveTypedefs(file.idl),
    unions: resolveUnions(file.idl),
  }))
}
