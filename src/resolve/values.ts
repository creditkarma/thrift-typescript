import BaseValueNode from '../nodes/BaseValueNode'
import InvalidValueNode from '../nodes/InvalidValueNode'
import ListValueNode from '../nodes/ListValueNode'
import MapValueNode from '../nodes/MapValueNode'
import SetValueNode from '../nodes/SetValueNode'
import StructValueNode from '../nodes/StructValueNode'

import {
  isBaseType,
  isListLikeType,
  isMapLikeType,
  isSetLikeType,
} from '../is'

export function resolveValues(idl: JsonAST, type, value) {
  if (isBaseType(type)) {
    return new BaseValueNode(value)
  }

  if (isMapLikeType(type)) {
    const values = value.map((tuple) => {
      return {
        key: resolveValues(idl, type.keyType, tuple.key),
        value: resolveValues(idl, type.valueType, tuple.value),
      }
    })
    return new MapValueNode(values)
  }

  if (isSetLikeType(type)) {
    const values = value.map((val) => resolveValues(idl, type.valueType, val))
    return new SetValueNode(values)
  }

  if (isListLikeType(type)) {
    const values = value.map((val) => resolveValues(idl, type.valueType, val))
    return new ListValueNode(values)
  }

  if (idl.typedef[type]) {
    // We don't need a custom ValueNode type here, instead we can just resolve it to what it's supposed to be
    return resolveValues(idl, idl.typedef[type].type, value)
  }

  if (idl.struct[type]) {
    const values = value.map((tuple, idx) => {
      // TODO: shouldn't be using idx and should lookup name, I think?
      const fieldType = idl.struct[type][idx].type
      return {
        key: tuple.key,
        value: resolveValues(idl, fieldType, tuple.value),
      }
    })
    return new StructValueNode({
      name: type,
      values,
    })
  }

  return new InvalidValueNode(value)
}
