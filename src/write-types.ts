import * as ts from 'typescript';

import {
  getType,
  createIf,
  createVariable,
  getEnumType
} from './ast-helpers';

import {
  identifiers as _id
} from './ast/identifiers';
import {
  types as _types
} from './ast/thrift-types';
import { methods as _methods } from './ast/methods';

function createWriteBody(type, accessVar: ts.Expression) {
  let method;
  switch(getType(type)) {
    case 'bool': {
      method = _methods.writeBool;
      break;
    }
    case 'i32': {
      method = _methods.writeI32;
      break;
    }
    case 'i16': {
      method = _methods.writeI16;
      break;
    }
    case 'string': {
      method = _methods.writeString;
      break;
    }
    // This is output as readString by the thrift binary
    case 'binary': {
      method = _methods.writeBinary;
      break;
    }
    case 'double': {
      method = _methods.writeDouble;
      break;
    }
    case 'i64': {
      method = _methods.writeI64;
      break;
    }
    case 'byte': {
      method = _methods.writeByte;
      break;
    }
    // The thrift binary warns to use i8 but then spits out writeByte
    case 'i8': {
      method = _methods.writeByte;
      break;
    }
    // TODO: probably need to handle other type aliases OR the validator/normalize phase can output these
    default: {
      // TODO: custom types
      throw new Error('Not Implemented ' + type);
    }
  }

  const _writeTypeCall = ts.createCall(method, undefined, [accessVar]);

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
  switch(getType(type)) {
    // TODO:
    //  'writeValue'?
    case 'set': {
      return createSetBody(type, accessVar);
    }
    case 'list': {
      return createListBody(type, accessVar);
    }
    case 'map': {
      return createMapBody(type, accessVar);
    }
    case 'struct': {
      return createStructBody(type, accessVar);
    }
    default: {
      return createWriteBody(type, accessVar);
    }
  }
}
