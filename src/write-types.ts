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

function createWriteBody(type, accessVar: ts.Expression) {
  let methodName;
  switch(getType(type)) {
    case 'bool': {
      methodName = 'writeBool';
      break;
    }
    case 'i32': {
      methodName = 'writeI32';
      break;
    }
    case 'i16': {
      methodName = 'writeI16';
      break;
    }
    case 'string': {
      methodName = 'writeString';
      break;
    }
    // This is output as readString by the thrift binary
    case 'binary': {
      methodName = 'writeBinary';
      break;
    }
    case 'double': {
      methodName = 'writeDouble';
      break;
    }
    case 'i64': {
      methodName = 'writeI64';
      break;
    }
    case 'byte': {
      methodName = 'writeByte';
      break;
    }
    // The thrift binary warns to use i8 but then spits out writeByte
    case 'i8': {
      methodName = 'writeByte';
      break;
    }
    // TODO: probably need to handle other type aliases OR the validator/normalize phase can output these
    default: {
      // TODO: custom types
      throw new Error('Not Implemented ' + type);
    }
  }

  const _writeType = ts.createPropertyAccess(_id.output, methodName);
  const _writeTypeCall = ts.createCall(_writeType, undefined, [accessVar]);

  return ts.createStatement(_writeTypeCall);
}

function writeContainerBegin(methodName: string | ts.Identifier, args: ts.Expression[]) : ts.ExpressionStatement {
  const _writeContainerBegin = ts.createPropertyAccess(_id.output, methodName);
  const _writeContainerBeginCall = ts.createCall(_writeContainerBegin, undefined, args);
  const _writeContainerBeginStatement = ts.createStatement(_writeContainerBeginCall);

  return _writeContainerBeginStatement;
}

function writeContainerEnd(methodName: string | ts.Identifier) : ts.ExpressionStatement {
  const _writeContainerEnd = ts.createPropertyAccess(_id.output, methodName);
  const _writeContainerEndCall = ts.createCall(_writeContainerEnd, undefined, undefined);
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
    writeContainerBegin('writeSetBegin', [
      ts.createPropertyAccess(_id.Thrift, `Type.${_enumType}`),
      ts.createPropertyAccess(accessVar, 'size')
    ]),
    _forEach,
    writeContainerEnd('writeSetEnd')
  ];
}

function createListBody(type, accessVar) {
  const _forEach = createLoopBody(type, accessVar);

  const _enumType = getEnumType(type.valueType);

  return [
    writeContainerBegin('writeListBegin', [
      ts.createPropertyAccess(_id.Thrift, `Type.${_enumType}`),
      ts.createPropertyAccess(accessVar, 'length')
    ]),
    _forEach,
    writeContainerEnd('writeListEnd')
  ];
}

function createMapBody(type, accessVar) {
  const _forEach = createLoopBody(type, accessVar);

  const keyType = getEnumType(type.keyType);
  const valueType = getEnumType(type.valueType);

  return [
    writeContainerBegin('writeMapBegin', [
      ts.createPropertyAccess(_id.Thrift, `Type.${keyType}`),
      ts.createPropertyAccess(_id.Thrift, `Type.${valueType}`),
      ts.createPropertyAccess(accessVar, 'size')
    ]),
    _forEach,
    writeContainerEnd('writeMapEnd')
  ];
}

function createStructBody(type, accessVar) {

  const _output = _id.output;

  const _writeStruct = ts.createPropertyAccess(accessVar, 'write');
  const _writeStructCall = ts.createCall(_writeStruct, undefined, [_output]);

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
