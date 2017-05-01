import * as ts from 'typescript'
import {
  createVariable
} from './ast-helpers';

export const id = {
  Thrift: ts.createIdentifier('Thrift'),
  input: ts.createIdentifier('input'),
  ret: ts.createIdentifier('ret'),
  fname: ts.createIdentifier('fname'),
  ftype: ts.createIdentifier('ftype'),
  fid: ts.createIdentifier('fid')
};

export function readStructBegin() {
  const _readStructBegin = ts.createPropertyAccess(id.input, 'readStructBegin');
  const _readStructBeginCall = ts.createCall(_readStructBegin, undefined, undefined);
  const _readStructBeginStatement = ts.createStatement(_readStructBeginCall);

  return _readStructBeginStatement;
}

export function readFieldBegin() {
  const _readFieldBegin = ts.createPropertyAccess(id.input, 'readFieldBegin');
  const _readFieldBeginCall = ts.createCall(_readFieldBegin, undefined, undefined);
  const _assignmentConst = createVariable(id.ret, _readFieldBeginCall);

  return _assignmentConst;
}

export function readFieldEnd() {
  const _readFieldEnd = ts.createPropertyAccess(id.input, 'readFieldEnd');
  const _readFieldEndCall = ts.createCall(_readFieldEnd, undefined, undefined);
  const _readFieldEndStatement = ts.createStatement(_readFieldEndCall);

  return _readFieldEndStatement;
}

export function readStructEnd() {
  const _readStructEnd = ts.createPropertyAccess(id.input, 'readStructEnd');
  const _readStructEndCall = ts.createCall(_readStructEnd, undefined, undefined);
  const _readStructEndStatement = ts.createStatement(_readStructEndCall);

  return _readStructEndStatement;
}

export function skip() {
  const _skip = ts.createPropertyAccess(id.input, 'skip');
  const _skipCall = ts.createCall(_skip, undefined, [id.ftype]);
  const _skipStatement = ts.createStatement(_skipCall);

  return _skipStatement;
}