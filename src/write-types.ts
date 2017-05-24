import * as ts from 'typescript';

import { getEnumType } from './ast-helpers';

import { identifiers as _id } from './ast/identifiers';
import { types as _types } from './ast/thrift-types';
import { methods as _methods } from './ast/methods';
import { write as eWrite } from './ast/enum-mapped';

function createWriteBody(type, accessVar: ts.Expression) {
  const enumType = getEnumType(type);

  // TODO: better name for eWrite
  const _writeTypeCall = ts.createCall(eWrite[enumType], undefined, [accessVar]);

  return ts.createStatement(_writeTypeCall);
}

function writeContainerBegin(method: ts.PropertyAccessExpression, args: ts.Expression[]) : ts.ExpressionStatement {
  const _writeContainerBeginCall = ts.createCall(method, undefined, args);
  const _writeContainerBeginStatement = ts.createStatement(_writeContainerBeginCall);

  return _writeContainerBeginStatement;
}

function writeContainerEnd(method: ts.PropertyAccessExpression) : ts.ExpressionStatement {
  const _writeContainerEndCall = ts.createCall(method, undefined, undefined);
  const _writeContainerEndStatement = ts.createStatement(_writeContainerEndCall);

  return _writeContainerEndStatement;
}

function createLoopBody(type, accessVar) {
  // forEach to normalize data types
  const _keyTemp = ts.createUniqueName('key');
  const _valueTemp = ts.createUniqueName('value');

  // Yay, real recursion
  let _writeKey = [];
  if (type.keyType) {
    _writeKey = _writeKey.concat(getWriteBody(type.keyType, _keyTemp));
  }
  let _writeValue = [];
  if (type.valueType) {
    _writeValue = _writeValue.concat(getWriteBody(type.valueType, _valueTemp));
  }

  const _keyParam = ts.createParameter(undefined, undefined, undefined, _keyTemp);
  const _valueParam = ts.createParameter(undefined, undefined, undefined, _valueTemp);

  const _loopBody = ts.createBlock([
    ..._writeKey,
    ..._writeValue
  ], true);

  const _callback = ts.createArrowFunction(undefined, undefined, [_valueParam, _keyParam], undefined, undefined, _loopBody);

  const _forEachAccess = ts.createPropertyAccess(accessVar, 'forEach');
  const _forEach = ts.createCall(_forEachAccess, undefined, [_callback]);

  return ts.createStatement(_forEach);
}

function createSetBody(type, accessVar) {
  const _forEach = createLoopBody(type, accessVar);

  const _enumType = getEnumType(type.valueType);

  return [
    writeContainerBegin(_methods.writeSetBegin, [
      _types[_enumType],
      ts.createPropertyAccess(accessVar, 'size')
    ]),
    _forEach,
    writeContainerEnd(_methods.writeSetEnd)
  ];
}

function createListBody(type, accessVar) {
  const _forEach = createLoopBody(type, accessVar);

  const _enumType = getEnumType(type.valueType);

  return [
    writeContainerBegin(_methods.writeListBegin, [
      _types[_enumType],
      ts.createPropertyAccess(accessVar, 'length')
    ]),
    _forEach,
    writeContainerEnd(_methods.writeListEnd)
  ];
}

function createMapBody(type, accessVar) {
  const _forEach = createLoopBody(type, accessVar);

  const keyType = getEnumType(type.keyType);
  const valueType = getEnumType(type.valueType);

  return [
    writeContainerBegin(_methods.writeMapBegin, [
      _types[keyType],
      _types[valueType],
      ts.createPropertyAccess(accessVar, 'size')
    ]),
    _forEach,
    writeContainerEnd(_methods.writeMapEnd)
  ];
}

function createStructBody(type, accessVar) {

  const _writeStruct = ts.createPropertyAccess(accessVar, 'write');
  const _writeStructCall = ts.createCall(_writeStruct, undefined, [_id.output]);

  return ts.createStatement(_writeStructCall)
}

export function getWriteBody(type, accessVar) {
  switch(getEnumType(type)) {
    // TODO:
    //  'writeValue'?
    case 'SET': {
      return createSetBody(type, accessVar);
    }
    case 'LIST': {
      return createListBody(type, accessVar);
    }
    case 'MAP': {
      return createMapBody(type, accessVar);
    }
    case 'STRUCT': {
      return createStructBody(type, accessVar);
    }
    default: {
      return createWriteBody(type, accessVar);
    }
  }
}
