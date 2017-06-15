import AliasTypeNode from '../nodes/AliasTypeNode'
import BaseTypeNode from '../nodes/BaseTypeNode'
import EnumTypeNode from '../nodes/EnumTypeNode'
import InvalidTypeNode from '../nodes/InvalidTypeNode'
import ListTypeNode from '../nodes/ListTypeNode'
import MapTypeNode from '../nodes/MapTypeNode'
import SetTypeNode from '../nodes/SetTypeNode'
import StructTypeNode from '../nodes/StructTypeNode'

import {
  isBaseType,
  isEnum,
  isListLikeType,
  isMapLikeType,
  isSetLikeType,
  isStruct,
  isTypedef,
} from '../is'

export function resolveTypes(idl, type) {
  if (isBaseType(type)) {
    return new BaseTypeNode(type)
  }

  if (isMapLikeType(type)) {
    return new MapTypeNode({
      keyType: resolveTypes(idl, type.keyType),
      name: type.name,
      valueType: resolveTypes(idl, type.valueType),
    })
  }

  if (isSetLikeType(type)) {
    return new SetTypeNode({
      name: type.name,
      valueType: resolveTypes(idl, type.valueType),
    })
  }

  if (isListLikeType(type)) {
    return new ListTypeNode({
      name: type.name,
      valueType: resolveTypes(idl, type.valueType),
    })
  }

  if (isTypedef(idl, type)) {
    return new AliasTypeNode({
      name: type,
      valueType: resolveTypes(idl, idl.typedef[type].type),
    })
  }

  if (isStruct(idl, type)) {
    return new StructTypeNode({
      name: 'struct',
      valueType: type,
    })
  }

  if (isEnum(idl, type)) {
    return new EnumTypeNode({
      name: 'enum',
      valueType: type,
    })
  }

  // TODO: does validation belong in here?
  return new InvalidTypeNode(type)
}
