import * as ts from 'typescript';

import {
  getType,
  createIf,
  createVariable,
  getEnumType
} from './ast-helpers';

function createWriteBody(methodName: string | ts.Identifier, args: ts.Expression | ts.Expression[] | undefined) {
  if (!Array.isArray(args)) {
    args = [args];
  }

  const _writeType = ts.createPropertyAccess(ts.createIdentifier('output'), methodName);
  const _writeTypeCall = ts.createCall(_writeType, undefined, args);

  return ts.createStatement(_writeTypeCall);
}

function writeContainerBegin(methodName: string | ts.Identifier, args: ts.Expression[]) : ts.ExpressionStatement {
  const _writeContainerBegin = ts.createPropertyAccess(ts.createIdentifier('output'), methodName);
  const _writeContainerBeginCall = ts.createCall(_writeContainerBegin, undefined, args);
  const _writeContainerBeginStatement = ts.createStatement(_writeContainerBeginCall);

  return _writeContainerBeginStatement;
}

function writeContainerEnd(methodName: string | ts.Identifier) : ts.ExpressionStatement {
  const _writeContainerEnd = ts.createPropertyAccess(ts.createIdentifier('output'), methodName);
  const _writeContainerEndCall = ts.createCall(_writeContainerEnd, undefined, undefined);
  const _writeContainerEndStatement = ts.createStatement(_writeContainerEndCall);

  return _writeContainerEndStatement;
}

function createLoopBody(accessVar, valueType, keyType?) {
  // TODO: Set and List are stored in an array, maybe this should be a for loop instead
  const _loopTmp = ts.createLoopVariable();
  const _key = ts.createVariableDeclarationList([
    ts.createVariableDeclaration(_loopTmp)
  ]);

  const _hasOwnProp = ts.createPropertyAccess(accessVar, 'hasOwnProperty');
  const _hasOwnPropCall = ts.createCall(_hasOwnProp, undefined, [
    _loopTmp
  ]);

  const _elAccess = ts.createElementAccess(accessVar, _loopTmp);
  const _tmpVar = ts.createTempVariable(undefined);
  const _assign = createVariable(_tmpVar, _elAccess);

  // Yay, real recursion
  let _writeKey = [];
  if (keyType) {
    _writeKey = _writeKey.concat(getBody(keyType, _loopTmp));
  }
  let _writeValue = [];
  if (valueType) {
    _writeValue = _writeValue.concat(getBody(valueType, _tmpVar));
  }

  const _ifHasOwnProp = createIf(_hasOwnPropCall, [
    _assign,
    ..._writeKey,
    ..._writeValue
  ]);
  const _writeBlock = ts.createBlock([
    _ifHasOwnProp
  ]);
  const _forIn = ts.createForIn(_key, accessVar, _writeBlock);

  return _forIn;
}

function createSetBody(accessVar, valueType) {
  const _forIn = createLoopBody(accessVar, valueType);

  const _enumType = getEnumType(valueType);

  return [
    writeContainerBegin('writeSetBegin', [
      ts.createPropertyAccess(ts.createIdentifier('Thrift'), `Type.${_enumType}`),
      ts.createPropertyAccess(accessVar, 'length')
    ]),
    _forIn,
    writeContainerEnd('writeSetEnd')
  ];
}

function createListBody(accessVar, valueType) {
  const _forIn = createLoopBody(accessVar, valueType);

  const _enumType = getEnumType(valueType);

  return [
    writeContainerBegin('writeListBegin', [
      ts.createPropertyAccess(ts.createIdentifier('Thrift'), `Type.${_enumType}`),
      ts.createPropertyAccess(accessVar, 'length')
    ]),
    _forIn,
    writeContainerEnd('writeListEnd')
  ];
}

function createMapBody(accessVar, valueType, keyType) {
  const _forIn = createLoopBody(accessVar, valueType, keyType);

  const _objectLength = ts.createPropertyAccess(ts.createIdentifier('Thrift'), 'objectLength');
  const _objectLengthCall = ts.createCall(_objectLength, undefined, [
    accessVar
  ]);

  keyType = getEnumType(keyType);
  valueType = getEnumType(valueType);

  return [
    writeContainerBegin('writeMapBegin', [
      ts.createPropertyAccess(ts.createIdentifier('Thrift'), `Type.${keyType}`),
      ts.createPropertyAccess(ts.createIdentifier('Thrift'), `Type.${valueType}`),
      _objectLengthCall
    ]),
    _forIn,
    writeContainerEnd('writeMapEnd')
  ];
}

export function getBody(type, accessVar) {
  switch(getType(type)) {
    case 'set': {
      return createSetBody(accessVar, type.valueType);
    }
    case 'list': {
      return createListBody(accessVar, type.valueType);
    }
    case 'map': {
      return createMapBody(accessVar, type.valueType, type.keyType)
    }
    case 'bool': {
      return createWriteBody('writeBool', accessVar);
    }
    case 'i32': {
      return createWriteBody('writeI32', accessVar);
    }
    case 'i16': {
      return createWriteBody('writeI16', accessVar);
    }
    case 'string': {
      return createWriteBody('writeString', accessVar);
    }
    default:
      throw new Error('Not Implemented ' + type)
  }
}