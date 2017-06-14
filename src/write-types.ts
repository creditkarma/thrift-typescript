import * as ts from 'typescript'

import { write as eWrite } from './ast/enum-mapped'
import { identifiers as _id } from './ast/identifiers'
import { methods as _methods } from './ast/methods'
import { types as _types } from './ast/thrift-types'

function createWriteBody(type, accessVar: ts.Expression) {
  const enumType = type.toEnum()

  // TODO: better name for eWrite
  const writeTypeCall = ts.createCall(eWrite[enumType], undefined, [accessVar])

  return ts.createStatement(writeTypeCall)
}

function writeContainerBegin(method: ts.PropertyAccessExpression, args: ts.Expression[]): ts.ExpressionStatement {
  const writeContainerBeginCall = ts.createCall(method, undefined, args)
  const writeContainerBeginStatement = ts.createStatement(writeContainerBeginCall)

  return writeContainerBeginStatement
}

function writeContainerEnd(method: ts.PropertyAccessExpression): ts.ExpressionStatement {
  const writeContainerEndCall = ts.createCall(method, undefined, undefined)
  const writeContainerEndStatement = ts.createStatement(writeContainerEndCall)

  return writeContainerEndStatement
}

function createLoopBody(type, accessVar) {
  // forEach to normalize data types
  const keyTemp = ts.createUniqueName('key')
  const valueTemp = ts.createUniqueName('value')

  // Yay, real recursion
  let writeKey = []
  if (type.keyType) {
    writeKey = writeKey.concat(getWriteBody(type.keyType, keyTemp))
  }
  let writeValue = []
  if (type.valueType) {
    writeValue = writeValue.concat(getWriteBody(type.valueType, valueTemp))
  }

  const keyParam = ts.createParameter(undefined, undefined, undefined, keyTemp)
  const valueParam = ts.createParameter(undefined, undefined, undefined, valueTemp)

  const loopBody = ts.createBlock([
    ...writeKey,
    ...writeValue,
  ], true)

  const callback = ts.createArrowFunction(undefined, undefined, [valueParam, keyParam], undefined, undefined, loopBody)

  const forEachAccess = ts.createPropertyAccess(accessVar, 'forEach')
  const forEach = ts.createCall(forEachAccess, undefined, [callback])

  return ts.createStatement(forEach)
}

function createSetBody(type, accessVar) {
  const forEach = createLoopBody(type, accessVar)

  const enumType = type.valueType.toEnum()

  return [
    writeContainerBegin(_methods.writeSetBegin, [
      _types[enumType],
      ts.createPropertyAccess(accessVar, 'size'),
    ]),
    forEach,
    writeContainerEnd(_methods.writeSetEnd),
  ]
}

function createListBody(type, accessVar) {
  const forEach = createLoopBody(type, accessVar)

  const enumType = type.valueType.toEnum()

  return [
    writeContainerBegin(_methods.writeListBegin, [
      _types[enumType],
      ts.createPropertyAccess(accessVar, 'length'),
    ]),
    forEach,
    writeContainerEnd(_methods.writeListEnd),
  ]
}

function createMapBody(type, accessVar) {
  const forEach = createLoopBody(type, accessVar)

  const keyType = type.keyType.toEnum()
  const valueType = type.valueType.toEnum()

  return [
    writeContainerBegin(_methods.writeMapBegin, [
      _types[keyType],
      _types[valueType],
      ts.createPropertyAccess(accessVar, 'size'),
    ]),
    forEach,
    writeContainerEnd(_methods.writeMapEnd),
  ]
}

function createStructBody(type, accessVar) {

  const writeStruct = ts.createPropertyAccess(accessVar, 'write')
  const writeStructCall = ts.createCall(writeStruct, undefined, [_id.output])

  return ts.createStatement(writeStructCall)
}

export function getWriteBody(type, accessVar) {
  switch (type.toEnum()) {
    // TODO:
    //  'writeValue'?
    case 'SET': {
      return createSetBody(type, accessVar)
    }
    case 'LIST': {
      return createListBody(type, accessVar)
    }
    case 'MAP': {
      return createMapBody(type, accessVar)
    }
    case 'STRUCT': {
      return createStructBody(type, accessVar)
    }
    default: {
      return createWriteBody(type, accessVar)
    }
  }
}
