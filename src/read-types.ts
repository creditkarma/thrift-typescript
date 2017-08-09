import * as ts from 'typescript'

import { read } from './ast/enum-mapped'
import { identifiers } from './ast/identifiers'
import { methods } from './ast/methods'

import { ITypeNode } from './nodes/interfaces'
import ListTypeNode from './nodes/ListTypeNode'
import MapTypeNode from './nodes/MapTypeNode'
import SetTypeNode from './nodes/SetTypeNode'
import StructTypeNode from './nodes/StructTypeNode'

// Map/Set/List don't seem to use the etype,ktype,vtype property that's initialized

function createReadMap(type: MapTypeNode, storage: ts.Expression): ts.Statement[] {
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
    ts.createCall(methods.readMapBegin, undefined, undefined))
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
  const keyCall = getReadBody(type.keyType, key)
  const valueCall = getReadBody(type.valueType, value)

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
    ts.createStatement(ts.createAssignment(storage, ts.createNew(identifiers.Map, undefined, []))),
    ts.createVariableStatement(undefined, varList),
    ts.createFor(loopVarList, loopCompare, loopIncrement, loopBody),
    ts.createStatement(ts.createCall(methods.readMapEnd, undefined, undefined)),
  ]
}

function createReadSet(type: SetTypeNode, storage: ts.Expression): ts.Statement[] {
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
    ts.createCall(methods.readSetBegin, undefined, undefined))
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
  const call = getReadBody(type.valueType, value)

  const innerVarList = ts.createVariableDeclarationList([valueVar], ts.NodeFlags.Let)

  const loopBody = ts.createBlock([
    ts.createVariableStatement(undefined, innerVarList),
    ...call,
    ts.createStatement(ts.createCall(ts.createPropertyAccess(storage, 'add'), undefined, [value])),
  ])

  return [
    ts.createStatement(ts.createAssignment(storage, ts.createNew(identifiers.Set, undefined, []))),
    ts.createVariableStatement(undefined, varList),
    ts.createFor(loopVarList, loopCompare, loopIncrement, loopBody),
    ts.createStatement(ts.createCall(methods.readSetEnd, undefined, undefined)),
  ]
}

function createReadList(type: ListTypeNode, storage: ts.Expression): ts.Statement[] {
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
    ts.createCall(methods.readListBegin, undefined, undefined))
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
  const call = getReadBody(type.valueType, value)

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
    ts.createStatement(ts.createCall(methods.readListEnd, undefined, undefined)),
  ]
}

function createReadValue(type: ITypeNode, storage: ts.Expression): ts.ExpressionStatement {
  const enumType = type.toEnum()

  const call = ts.createCall(read[enumType], undefined, undefined)
  const assign = ts.createAssignment(storage, call)

  return ts.createStatement(assign)
}

function createReadStruct(type: StructTypeNode, storage: ts.Expression): ts.ExpressionStatement[] {
  // this.bed = new ttypes.Embed();
  // this.bed.read(input);

  return [
    // TODO: type.valueType should probably be some sort of access method on the type to get recursively
    ts.createStatement(ts.createAssignment(storage, ts.createNew(ts.createIdentifier(type.valueType), undefined, []))),
    ts.createStatement(ts.createCall(ts.createPropertyAccess(storage, 'read'), undefined, [identifiers.input])),
  ]
}

export function getReadBody(type: ITypeNode, storage: ts.Expression): ts.Statement[] {
  // TODO: Can compare instanceof or something here?
  switch (type.toEnum()) {
    // TODO:
    //  'readValue'?
    case 'SET': {
      // TODO: I'd like to avoid this "as"
      return createReadSet(type as SetTypeNode, storage)
    }
    case 'LIST': {
      // TODO: I'd like to avoid this "as"
      return createReadList(type as ListTypeNode, storage)
    }
    case 'MAP': {
      // TODO: I'd like to avoid this "as"
      return createReadMap(type as MapTypeNode, storage)
    }
    case 'STRUCT': {
      // TODO: I'd like to avoid this "as"
      return createReadStruct(type as StructTypeNode, storage)
    }
    default:
      return [createReadValue(type, storage)]
  }
}
