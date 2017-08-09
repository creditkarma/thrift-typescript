import * as ts from 'typescript'

import { read as eRead } from './ast/enum-mapped'
import { identifiers as _id } from './ast/identifiers'
import { methods as _methods } from './ast/methods'
import { ITypeNode } from './nodes/interfaces'

// Map/Set/List don't seem to use the etype,ktype,vtype property that's initialized

function createReadMap(type, storage) {
  /*
    let storage; // outside of recursion
    storage = new Map();
    var _rtmp34 = input.readMapBegin();
    var size0 = _rtmp34.size;
    for (var _i5 = 0; _i5 < size0; ++_i5) {
      let key6;
      key6 = // recursion
      let val7;
      val7 = // recursion
      storage.set(key6, val7);
    }
    input.readMapEnd();
  */
  const loopTmp = ts.createLoopVariable()
  const metadata = ts.createUniqueName('metadata')
  const size = ts.createUniqueName('size')
  const key = ts.createUniqueName('key')
  const value = ts.createUniqueName('value')

  const metadataVar = ts.createVariableDeclaration(metadata, undefined,
    ts.createCall(_methods.readMapBegin, undefined, undefined))
  const sizeVar = ts.createVariableDeclaration(size, undefined, ts.createPropertyAccess(metadata, 'size'))

  const varList = ts.createVariableDeclarationList([
    metadataVar,
    sizeVar,
  ], ts.NodeFlags.Const)

  const loopVar = ts.createVariableDeclaration(loopTmp, undefined, ts.createLiteral(0))
  const loopVarList = ts.createVariableDeclarationList([loopVar], ts.NodeFlags.Let)
  const loopCompare = ts.createLessThan(loopTmp, size)
  const loopIncrement = ts.createPostfixIncrement(loopTmp)

  // Recursion
  let keyCall = getReadBody(type.keyType, key)
  if (!Array.isArray(keyCall)) {
    keyCall = [keyCall]
  }
  let valueCall = getReadBody(type.valueType, value)
  if (!Array.isArray(valueCall)) {
    valueCall = [valueCall]
  }

  const keyVar = ts.createVariableDeclaration(key, undefined, undefined)
  const valueVar = ts.createVariableDeclaration(value, undefined, undefined)

  const innerVarList = ts.createVariableDeclarationList([
    keyVar,
    valueVar,
  ], ts.NodeFlags.Let)

  const loopBody = ts.createBlock([
    ts.createVariableStatement(undefined, innerVarList),
    ...keyCall,
    ...valueCall,
    ts.createStatement(ts.createCall(ts.createPropertyAccess(storage, 'set'), undefined, [key, value])),
  ])

  return [
    ts.createStatement(ts.createAssignment(storage, ts.createNew(_id.Map, undefined, []))),
    ts.createVariableStatement(undefined, varList),
    ts.createFor(loopVarList, loopCompare, loopIncrement, loopBody),
    ts.createStatement(ts.createCall(_methods.readMapEnd, undefined, undefined)),
  ]
}

function createReadSet(type, storage) {
  /*
    let storage; // outside of recursion
    storage = new Set();
    const _rtmp312 = input.readSetBegin();
    const size8 = _rtmp312.size;
    for (var _i13 = 0; _i13 < size8; ++_i13) {
      const elem14 = // recursion
      storage.add(elem14);
    }
    input.readSetEnd();
  */
  const loopTmp = ts.createLoopVariable()
  const metadata = ts.createUniqueName('metadata')
  const size = ts.createUniqueName('size')
  const value = ts.createUniqueName('value')

  const metadataVar = ts.createVariableDeclaration(metadata, undefined,
    ts.createCall(_methods.readSetBegin, undefined, undefined))
  const sizeVar = ts.createVariableDeclaration(size, undefined, ts.createPropertyAccess(metadata, 'size'))

  const varList = ts.createVariableDeclarationList([
    metadataVar,
    sizeVar,
  ], ts.NodeFlags.Const)

  const loopVar = ts.createVariableDeclaration(loopTmp, undefined, ts.createLiteral(0))
  const loopVarList = ts.createVariableDeclarationList([loopVar], ts.NodeFlags.Let)
  const loopCompare = ts.createLessThan(loopTmp, size)
  const loopIncrement = ts.createPostfixIncrement(loopTmp)

  const valueVar = ts.createVariableDeclaration(value, undefined, undefined)
  // Recursion
  let call = getReadBody(type.valueType, value)
  if (!Array.isArray(call)) {
    call = [call]
  }

  const innerVarList = ts.createVariableDeclarationList([valueVar], ts.NodeFlags.Let)

  const loopBody = ts.createBlock([
    ts.createVariableStatement(undefined, innerVarList),
    ...call,
    ts.createStatement(ts.createCall(ts.createPropertyAccess(storage, 'add'), undefined, [value])),
  ])

  return [
    ts.createStatement(ts.createAssignment(storage, ts.createNew(_id.Set, undefined, []))),
    ts.createVariableStatement(undefined, varList),
    ts.createFor(loopVarList, loopCompare, loopIncrement, loopBody),
    ts.createStatement(ts.createCall(_methods.readSetEnd, undefined, undefined)),
  ]
}

function createReadList(type, storage) {
  /*
    let storage; // outside of recursion
    storage = [];
    const _rtmp312 = input.readListBegin();
    const size8 = _rtmp312.size;
    for (var _i13 = 0; _i13 < size8; ++_i13) {
      const elem14 = // recursion
      storage.push(elem14);
    }
    input.readListEnd();
  */
  const loopTmp = ts.createLoopVariable()
  const metadata = ts.createUniqueName('metadata')
  const size = ts.createUniqueName('size')
  const value = ts.createUniqueName('value')

  const metadataVar = ts.createVariableDeclaration(metadata, undefined,
    ts.createCall(_methods.readListBegin, undefined, undefined))
  const sizeVar = ts.createVariableDeclaration(size, undefined, ts.createPropertyAccess(metadata, 'size'))

  const varList = ts.createVariableDeclarationList([
    metadataVar,
    sizeVar,
  ], ts.NodeFlags.Const)

  const loopVar = ts.createVariableDeclaration(loopTmp, undefined, ts.createLiteral(0))
  const loopVarList = ts.createVariableDeclarationList([loopVar], ts.NodeFlags.Let)
  const loopCompare = ts.createLessThan(loopTmp, size)
  const loopIncrement = ts.createPostfixIncrement(loopTmp)

  const valueVar = ts.createVariableDeclaration(value, undefined, undefined)
  // Recursion
  let call = getReadBody(type.valueType, value)
  if (!Array.isArray(call)) {
    call = [call]
  }

  const innerVarList = ts.createVariableDeclarationList([valueVar], ts.NodeFlags.Let)

  const loopBody = ts.createBlock([
    ts.createVariableStatement(undefined, innerVarList),
    ...call,
    ts.createStatement(ts.createCall(ts.createPropertyAccess(storage, 'push'), undefined, [value])),
  ])

  return [
    ts.createStatement(ts.createAssignment(storage, ts.createArrayLiteral())),
    ts.createVariableStatement(undefined, varList),
    ts.createFor(loopVarList, loopCompare, loopIncrement, loopBody),
    ts.createStatement(ts.createCall(_methods.readListEnd, undefined, undefined)),
  ]
}

function createReadValue(type, storage) {
  const enumType = type.toEnum()

  // TODO: better name for eRead
  const call = ts.createCall(eRead[enumType], undefined, undefined)
  const assign = ts.createAssignment(storage, call)

  return ts.createStatement(assign)
}

function createReadStruct(type, storage) {
  // this.bed = new ttypes.Embed();
  // this.bed.read(input);

  return [
    // TODO: type.valueType should probably be some sort of access method on the type to get recursively
    ts.createStatement(ts.createAssignment(storage, ts.createNew(ts.createIdentifier(type.valueType), undefined, []))),
    ts.createStatement(ts.createCall(ts.createPropertyAccess(storage, 'read'), undefined, [_id.input])),
  ]
}

export function getReadBody(type: ITypeNode, storage: ts.Node) {
  // TODO:
  //  'readValue'?
  switch (type.toEnum()) {
    case 'SET': {
      return createReadSet(type, storage)
    }
    case 'LIST': {
      return createReadList(type, storage)
    }
    case 'MAP': {
      return createReadMap(type, storage)
    }
    case 'STRUCT': {
      return createReadStruct(type, storage)
    }
    default:
      return createReadValue(type, storage)
  }
}
