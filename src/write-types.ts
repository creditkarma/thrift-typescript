import {
  createArrowFunction,
  createBlock,
  createCall,
  createParameter,
  createPropertyAccess,
  createStatement,
  createUniqueName,
  Expression,
  ExpressionStatement,
  PropertyAccessExpression,
} from 'typescript'

import { write } from './ast/enum-mapped'
import { identifiers } from './ast/identifiers'
import { methods } from './ast/methods'
import { types } from './ast/thrift-types'

import ListTypeNode from './nodes/ListTypeNode'
import MapTypeNode from './nodes/MapTypeNode'
import SetTypeNode from './nodes/SetTypeNode'
import TypeNode from './nodes/TypeNode'

// TODO: Should this be a subset of TypeNode since it doesn't get container types?
function createWriteBody(type: TypeNode, accessVar: Expression): ExpressionStatement {
  const enumType = type.toEnum()

  const writeTypeCall = createCall(write[enumType], undefined, [accessVar])

  return createStatement(writeTypeCall)
}

function writeContainerBegin(method: PropertyAccessExpression, args: Expression[]): ExpressionStatement {
  const writeContainerBeginCall = createCall(method, undefined, args)
  const writeContainerBeginStatement = createStatement(writeContainerBeginCall)

  return writeContainerBeginStatement
}

function writeContainerEnd(method: PropertyAccessExpression): ExpressionStatement {
  const writeContainerEndCall = createCall(method, undefined, undefined)
  const writeContainerEndStatement = createStatement(writeContainerEndCall)

  return writeContainerEndStatement
}

// TODO: How can I type this if only MapTypeNode has keyType?
function createLoopBody(type, accessVar: Expression): ExpressionStatement {
  // forEach to normalize data types
  const keyTemp = createUniqueName('key')
  const valueTemp = createUniqueName('value')

  // Yay, real recursion
  let writeKey = []
  if (type.keyType) {
    writeKey = writeKey.concat(getWriteBody(type.keyType, keyTemp))
  }
  let writeValue = []
  if (type.valueType) {
    writeValue = writeValue.concat(getWriteBody(type.valueType, valueTemp))
  }

  const keyParam = createParameter(undefined, undefined, undefined, keyTemp)
  const valueParam = createParameter(undefined, undefined, undefined, valueTemp)

  const loopBody = createBlock([
    ...writeKey,
    ...writeValue,
  ], true)

  const callback = createArrowFunction(undefined, undefined, [valueParam, keyParam], undefined, undefined, loopBody)

  const forEachAccess = createPropertyAccess(accessVar, 'forEach')
  const forEach = createCall(forEachAccess, undefined, [callback])

  return createStatement(forEach)
}

function createSetBody(type: SetTypeNode, accessVar: Expression): ExpressionStatement[] {
  const forEach = createLoopBody(type, accessVar)

  const enumType = type.valueType.toEnum()

  return [
    writeContainerBegin(methods.writeSetBegin, [
      types[enumType],
      createPropertyAccess(accessVar, 'size'),
    ]),
    forEach,
    writeContainerEnd(methods.writeSetEnd),
  ]
}

function createListBody(type: ListTypeNode, accessVar: Expression): ExpressionStatement[] {
  const forEach = createLoopBody(type, accessVar)

  const enumType = type.valueType.toEnum()

  return [
    writeContainerBegin(methods.writeListBegin, [
      types[enumType],
      createPropertyAccess(accessVar, 'length'),
    ]),
    forEach,
    writeContainerEnd(methods.writeListEnd),
  ]
}

function createMapBody(type: MapTypeNode, accessVar: Expression): ExpressionStatement[] {
  const forEach = createLoopBody(type, accessVar)

  const keyType = type.keyType.toEnum()
  const valueType = type.valueType.toEnum()

  return [
    writeContainerBegin(methods.writeMapBegin, [
      types[keyType],
      types[valueType],
      createPropertyAccess(accessVar, 'size'),
    ]),
    forEach,
    writeContainerEnd(methods.writeMapEnd),
  ]
}

function createStructBody(type: TypeNode, accessVar: Expression): ExpressionStatement {

  const writeStruct = createPropertyAccess(accessVar, 'write')
  const writeStructCall = createCall(writeStruct, undefined, [identifiers.output])

  return createStatement(writeStructCall)
}

export function getWriteBody(type: TypeNode, accessVar: Expression): ExpressionStatement[] {
  // TODO: Can compare instanceof or something here?
  switch (type.toEnum()) {
    // TODO:
    //  'writeValue'?
    case 'SET': {
      // TODO: I'd like to avoid this "as"
      return createSetBody(type as SetTypeNode, accessVar)
    }
    case 'LIST': {
      // TODO: I'd like to avoid this "as"
      return createListBody(type as ListTypeNode, accessVar)
    }
    case 'MAP': {
      // TODO: I'd like to avoid this "as"
      return createMapBody(type as MapTypeNode, accessVar)
    }
    case 'STRUCT': {
      return [createStructBody(type, accessVar)]
    }
    default: {
      return [createWriteBody(type, accessVar)]
    }
  }
}
