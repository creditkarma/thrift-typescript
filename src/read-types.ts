import * as ts from 'typescript';

import { identifiers as _id } from './ast/identifiers';
import { methods as _methods } from './ast/methods';
import { read as eRead } from './ast/enum-mapped';

// Map/Set/List don't seem to use the etype,ktype,vtype property that's initialized

function createReadMap(type, _storage) {
  /*
    let storage; // outside of recursion
    storage = new Map();
    var _rtmp34 = input.readMapBegin();
    var _size0 = _rtmp34.size;
    for (var _i5 = 0; _i5 < _size0; ++_i5) {
      let key6;
      key6 = // recursion
      let val7;
      val7 = // recursion
      storage.set(key6, val7);
    }
    input.readMapEnd();
  */
  const _loopTmp = ts.createLoopVariable();
  const _metadata = ts.createUniqueName('metadata');
  const _size = ts.createUniqueName('size');
  const _key = ts.createUniqueName('key');
  const _value = ts.createUniqueName('value');

  const _metadataVar = ts.createVariableDeclaration(_metadata, undefined, ts.createCall(_methods.readMapBegin, undefined, undefined))
  const _sizeVar = ts.createVariableDeclaration(_size, undefined, ts.createPropertyAccess(_metadata, 'size'));

  const _varList = ts.createVariableDeclarationList([
    _metadataVar,
    _sizeVar
  ], ts.NodeFlags.Const);

  const _loopVar = ts.createVariableDeclaration(_loopTmp, undefined, ts.createLiteral(0));
  const _loopVarList = ts.createVariableDeclarationList([_loopVar], ts.NodeFlags.Let);
  const _loopCompare = ts.createLessThan(_loopTmp, _size);
  const _loopIncrement = ts.createPostfixIncrement(_loopTmp);

  // Recursion
  let _keyCall = getReadBody(type.keyType, _key);
  if (!Array.isArray(_keyCall)) {
    _keyCall = [_keyCall];
  }
  let _valueCall = getReadBody(type.valueType, _value);
  if (!Array.isArray(_valueCall)) {
    _valueCall = [_valueCall];
  }

  const _keyVar = ts.createVariableDeclaration(_key, undefined, undefined);
  const _valueVar = ts.createVariableDeclaration(_value, undefined, undefined);

  const _innerVarList = ts.createVariableDeclarationList([
    _keyVar,
    _valueVar
  ], ts.NodeFlags.Let);

  const _loopBody = ts.createBlock([
    ts.createVariableStatement(undefined, _innerVarList),
    ..._keyCall,
    ..._valueCall,
    ts.createStatement(ts.createCall(ts.createPropertyAccess(_storage, 'set'), undefined, [_key, _value]))
  ]);

  return [
    ts.createStatement(ts.createAssignment(_storage, ts.createNew(_id.Map, undefined, []))),
    ts.createVariableStatement(undefined, _varList),
    ts.createFor(_loopVarList, _loopCompare, _loopIncrement, _loopBody),
    ts.createStatement(ts.createCall(_methods.readMapEnd, undefined, undefined)),
  ];
}

function createReadSet(type, _storage) {
  /*
    let storage; // outside of recursion
    storage = new Set();
    const _rtmp312 = input.readSetBegin();
    const _size8 = _rtmp312.size;
    for (var _i13 = 0; _i13 < _size8; ++_i13) {
      const elem14 = // recursion
      storage.add(elem14);
    }
    input.readSetEnd();
  */
  const _loopTmp = ts.createLoopVariable();
  const _metadata = ts.createUniqueName('metadata');
  const _size = ts.createUniqueName('size');
  const _value = ts.createUniqueName('value');

  const _metadataVar = ts.createVariableDeclaration(_metadata, undefined, ts.createCall(_methods.readSetBegin, undefined, undefined))
  const _sizeVar = ts.createVariableDeclaration(_size, undefined, ts.createPropertyAccess(_metadata, 'size'));

  const _varList = ts.createVariableDeclarationList([
    _metadataVar,
    _sizeVar
  ], ts.NodeFlags.Const);

  const _loopVar = ts.createVariableDeclaration(_loopTmp, undefined, ts.createLiteral(0));
  const _loopVarList = ts.createVariableDeclarationList([_loopVar], ts.NodeFlags.Let);
  const _loopCompare = ts.createLessThan(_loopTmp, _size);
  const _loopIncrement = ts.createPostfixIncrement(_loopTmp);

  const _valueVar = ts.createVariableDeclaration(_value, undefined, undefined);
  // Recursion
  let _call = getReadBody(type.valueType, _value);
  if (!Array.isArray(_call)) {
    _call = [_call];
  }

  const _innerVarList = ts.createVariableDeclarationList([_valueVar], ts.NodeFlags.Let);

  const _loopBody = ts.createBlock([
    ts.createVariableStatement(undefined, _innerVarList),
    ..._call,
    ts.createStatement(ts.createCall(ts.createPropertyAccess(_storage, 'add'), undefined, [_value]))
  ]);

  return [
    ts.createStatement(ts.createAssignment(_storage, ts.createNew(_id.Set, undefined, []))),
    ts.createVariableStatement(undefined, _varList),
    ts.createFor(_loopVarList, _loopCompare, _loopIncrement, _loopBody),
    ts.createStatement(ts.createCall(_methods.readSetEnd, undefined, undefined))
  ];
}

function createReadList(type, _storage) {
  /*
    let storage; // outside of recursion
    storage = [];
    const _rtmp312 = input.readListBegin();
    const _size8 = _rtmp312.size;
    for (var _i13 = 0; _i13 < _size8; ++_i13) {
      const elem14 = // recursion
      storage.push(elem14);
    }
    input.readListEnd();
  */
  const _loopTmp = ts.createLoopVariable();
  const _metadata = ts.createUniqueName('metadata');
  const _size = ts.createUniqueName('size');
  const _value = ts.createUniqueName('value');

  const _metadataVar = ts.createVariableDeclaration(_metadata, undefined, ts.createCall(_methods.readListBegin, undefined, undefined))
  const _sizeVar = ts.createVariableDeclaration(_size, undefined, ts.createPropertyAccess(_metadata, 'size'));

  const _varList = ts.createVariableDeclarationList([
    _metadataVar,
    _sizeVar
  ], ts.NodeFlags.Const);

  const _loopVar = ts.createVariableDeclaration(_loopTmp, undefined, ts.createLiteral(0));
  const _loopVarList = ts.createVariableDeclarationList([_loopVar], ts.NodeFlags.Let);
  const _loopCompare = ts.createLessThan(_loopTmp, _size);
  const _loopIncrement = ts.createPostfixIncrement(_loopTmp);

  const _valueVar = ts.createVariableDeclaration(_value, undefined, undefined);
  // Recursion
  let _call = getReadBody(type.valueType, _value);
  if (!Array.isArray(_call)) {
    _call = [_call];
  }

  const _innerVarList = ts.createVariableDeclarationList([_valueVar], ts.NodeFlags.Let);

  const _loopBody = ts.createBlock([
    ts.createVariableStatement(undefined, _innerVarList),
    ..._call,
    ts.createStatement(ts.createCall(ts.createPropertyAccess(_storage, 'push'), undefined, [_value]))
  ]);

  return [
    ts.createStatement(ts.createAssignment(_storage, ts.createArrayLiteral())),
    ts.createVariableStatement(undefined, _varList),
    ts.createFor(_loopVarList, _loopCompare, _loopIncrement, _loopBody),
    ts.createStatement(ts.createCall(_methods.readListEnd, undefined, undefined))
  ];
}


function createReadValue(type, _storage) {
  const enumType = type.toEnum();

  // TODO: better name for eRead
  const _call = ts.createCall(eRead[enumType], undefined, undefined);
  const _assign = ts.createAssignment(_storage, _call);

  return ts.createStatement(_assign);
}

function createReadStruct(type, _storage) {
  // this.bed = new ttypes.Embed();
  // this.bed.read(input);

  return [
    // TODO: type.valueType.name should probably be some sort of access method on the type to get recursively
    ts.createStatement(ts.createAssignment(_storage, ts.createNew(ts.createIdentifier(type.valueType.name), undefined, []))),
    ts.createStatement(ts.createCall(ts.createPropertyAccess(_storage, 'read'), undefined, [_id.input]))
  ];
}

export function getReadBody(type, _storage) {
  // TODO:
  //  'readValue'?
  switch(type.toEnum()) {
    case 'SET': {
      return createReadSet(type, _storage);
    }
    case 'LIST': {
      return createReadList(type, _storage);
    }
    case 'MAP': {
      return createReadMap(type, _storage);
    }
    case 'STRUCT': {
      return createReadStruct(type, _storage);
    }
    default:
      return createReadValue(type, _storage);
  }
}