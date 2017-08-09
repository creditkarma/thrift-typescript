import {
  createArrayLiteral,
  createAssignment,
  createBlock,
  createCall,
  createFor,
  createIdentifier,
  createLessThan,
  createLiteral,
  createLoopVariable,
  createNew,
  createPostfixIncrement,
  createPropertyAccess,
  createStatement,
  createUniqueName,
  createVariableDeclaration,
  createVariableDeclarationList,
  createVariableStatement,
  Expression,
  ExpressionStatement,
  NodeFlags,
  Statement,
} from 'typescript'

import { read } from './ast/enum-mapped'
import { identifiers } from './ast/identifiers'
import { methods } from './ast/methods'

import { ITypeNode } from './nodes/interfaces'
import ListTypeNode from './nodes/ListTypeNode'
import MapTypeNode from './nodes/MapTypeNode'
import SetTypeNode from './nodes/SetTypeNode'
import StructTypeNode from './nodes/StructTypeNode'

// Map/Set/List don't seem to use the etype,ktype,vtype property that's initialized

function createReadMap(type: MapTypeNode, storage: Expression): Statement[] {
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
  const loopTmp = createLoopVariable()
  const metadata = createUniqueName('metadata')
  const size = createUniqueName('size')
  const key = createUniqueName('key')
  const value = createUniqueName('value')

  const readMapBeginCall = createCall(methods.readMapBegin, undefined, undefined)
  const metadataVar = createVariableDeclaration(metadata, undefined, readMapBeginCall)
  const sizeVar = createVariableDeclaration(size, undefined, createPropertyAccess(metadata, 'size'))

  const varList = createVariableDeclarationList([
    metadataVar,
    sizeVar,
  ], NodeFlags.Const)

  const loopVar = createVariableDeclaration(loopTmp, undefined, createLiteral(0))
  const loopVarList = createVariableDeclarationList([loopVar], NodeFlags.Let)
  const loopCompare = createLessThan(loopTmp, size)
  const loopIncrement = createPostfixIncrement(loopTmp)

  // Recursion
  const keyCall = getReadBody(type.keyType, key)
  const valueCall = getReadBody(type.valueType, value)

  const keyVar = createVariableDeclaration(key, undefined, undefined)
  const valueVar = createVariableDeclaration(value, undefined, undefined)

  const innerVarList = createVariableDeclarationList([
    keyVar,
    valueVar,
  ], NodeFlags.Let)

  const loopBody = createBlock([
    createVariableStatement(undefined, innerVarList),
    ...keyCall,
    ...valueCall,
    createStatement(createCall(createPropertyAccess(storage, 'set'), undefined, [key, value])),
  ])

  return [
    createStatement(createAssignment(storage, createNew(identifiers.Map, undefined, []))),
    createVariableStatement(undefined, varList),
    createFor(loopVarList, loopCompare, loopIncrement, loopBody),
    createStatement(createCall(methods.readMapEnd, undefined, undefined)),
  ]
}

function createReadSet(type: SetTypeNode, storage: Expression): Statement[] {
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
  const loopTmp = createLoopVariable()
  const metadata = createUniqueName('metadata')
  const size = createUniqueName('size')
  const value = createUniqueName('value')

  const readSetBeginCall = createCall(methods.readSetBegin, undefined, undefined)
  const metadataVar = createVariableDeclaration(metadata, undefined, readSetBeginCall)
  const sizeVar = createVariableDeclaration(size, undefined, createPropertyAccess(metadata, 'size'))

  const varList = createVariableDeclarationList([
    metadataVar,
    sizeVar,
  ], NodeFlags.Const)

  const loopVar = createVariableDeclaration(loopTmp, undefined, createLiteral(0))
  const loopVarList = createVariableDeclarationList([loopVar], NodeFlags.Let)
  const loopCompare = createLessThan(loopTmp, size)
  const loopIncrement = createPostfixIncrement(loopTmp)

  const valueVar = createVariableDeclaration(value, undefined, undefined)
  // Recursion
  const call = getReadBody(type.valueType, value)

  const innerVarList = createVariableDeclarationList([valueVar], NodeFlags.Let)

  const loopBody = createBlock([
    createVariableStatement(undefined, innerVarList),
    ...call,
    createStatement(createCall(createPropertyAccess(storage, 'add'), undefined, [value])),
  ])

  return [
    createStatement(createAssignment(storage, createNew(identifiers.Set, undefined, []))),
    createVariableStatement(undefined, varList),
    createFor(loopVarList, loopCompare, loopIncrement, loopBody),
    createStatement(createCall(methods.readSetEnd, undefined, undefined)),
  ]
}

function createReadList(type: ListTypeNode, storage: Expression): Statement[] {
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
  const loopTmp = createLoopVariable()
  const metadata = createUniqueName('metadata')
  const size = createUniqueName('size')
  const value = createUniqueName('value')

  const readListBeginCall = createCall(methods.readListBegin, undefined, undefined)
  const metadataVar = createVariableDeclaration(metadata, undefined, readListBeginCall)
  const sizeVar = createVariableDeclaration(size, undefined, createPropertyAccess(metadata, 'size'))

  const varList = createVariableDeclarationList([
    metadataVar,
    sizeVar,
  ], NodeFlags.Const)

  const loopVar = createVariableDeclaration(loopTmp, undefined, createLiteral(0))
  const loopVarList = createVariableDeclarationList([loopVar], NodeFlags.Let)
  const loopCompare = createLessThan(loopTmp, size)
  const loopIncrement = createPostfixIncrement(loopTmp)

  const valueVar = createVariableDeclaration(value, undefined, undefined)
  // Recursion
  const call = getReadBody(type.valueType, value)

  const innerVarList = createVariableDeclarationList([valueVar], NodeFlags.Let)

  const loopBody = createBlock([
    createVariableStatement(undefined, innerVarList),
    ...call,
    createStatement(createCall(createPropertyAccess(storage, 'push'), undefined, [value])),
  ])

  return [
    createStatement(createAssignment(storage, createArrayLiteral())),
    createVariableStatement(undefined, varList),
    createFor(loopVarList, loopCompare, loopIncrement, loopBody),
    createStatement(createCall(methods.readListEnd, undefined, undefined)),
  ]
}

function createReadValue(type: ITypeNode, storage: Expression): ExpressionStatement {
  const enumType = type.toEnum()

  const call = createCall(read[enumType], undefined, undefined)
  const assign = createAssignment(storage, call)

  return createStatement(assign)
}

function createReadStruct(type: StructTypeNode, storage: Expression): ExpressionStatement[] {
  // this.bed = new ttypes.Embed();
  // this.bed.read(input);

  return [
    // TODO: type.valueType should probably be some sort of access method on the type to get recursively
    createStatement(createAssignment(storage, createNew(createIdentifier(type.valueType), undefined, []))),
    createStatement(createCall(createPropertyAccess(storage, 'read'), undefined, [identifiers.input])),
  ]
}

export function getReadBody(type: ITypeNode, storage: Expression): Statement[] {
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
