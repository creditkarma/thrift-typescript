import * as ts from 'typescript'
import {
  createVariable
} from './ast-helpers';

import {
  identifiers as _id
} from './ast/identifiers';
import {
  types as _types
} from './ast/thrift-types';
import {
  methods as _methods
} from './ast/methods';

// readStruct
export function readStructBegin() {
  const _readStructBeginCall = ts.createCall(_methods.readStructBegin, undefined, undefined);
  const _readStructBeginStatement = ts.createStatement(_readStructBeginCall);

  return _readStructBeginStatement;
}
export function readStructEnd() {
  const _readStructEndCall = ts.createCall(_methods.readStructEnd, undefined, undefined);
  const _readStructEndStatement = ts.createStatement(_readStructEndCall);

  return _readStructEndStatement;
}

// readField
export function readFieldBegin() {
  const _readFieldBeginCall = ts.createCall(_methods.readFieldBegin, undefined, undefined);
  const _assignmentConst = createVariable(_id.ret, _readFieldBeginCall);

  return _assignmentConst;
}
export function readFieldEnd() {
  const _readFieldEndCall = ts.createCall(_methods.readFieldEnd, undefined, undefined);
  const _readFieldEndStatement = ts.createStatement(_readFieldEndCall);

  return _readFieldEndStatement;
}

// writeField
export function writeFieldBegin(name: string, type: string, fieldId: number) : ts.ExpressionStatement {
  const _writeFieldBeginCall = ts.createCall(_methods.writeFieldBegin, undefined, [
    ts.createLiteral(name),
    _types[type],
    ts.createLiteral(fieldId)
  ]);
  const _writeFieldBeginStatement = ts.createStatement(_writeFieldBeginCall);
  return _writeFieldBeginStatement;
}
export function writeFieldEnd() : ts.ExpressionStatement {
  const _writeFieldEndCall = ts.createCall(_methods.writeFieldEnd, undefined, undefined);
  const _writeFieldEndStatement = ts.createStatement(_writeFieldEndCall);

  return _writeFieldEndStatement;
}


export function skip() {
  const _skipCall = ts.createCall(_methods.skip, undefined, [_id.ftype]);
  const _skipStatement = ts.createStatement(_skipCall);

  return _skipStatement;
}