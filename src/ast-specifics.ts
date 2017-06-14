import * as ts from 'typescript'

import { createVariable } from './ast-helpers'
import { identifiers as _id } from './ast/identifiers'
import { methods as _methods } from './ast/methods'
import { types as _types } from './ast/thrift-types'

// readStruct
export function readStructBegin() {
  const readStructBeginCall = ts.createCall(_methods.readStructBegin, undefined, undefined)
  const readStructBeginStatement = ts.createStatement(readStructBeginCall)

  return readStructBeginStatement
}
export function readStructEnd() {
  const readStructEndCall = ts.createCall(_methods.readStructEnd, undefined, undefined)
  const readStructEndStatement = ts.createStatement(readStructEndCall)

  return readStructEndStatement
}

// readField
export function readFieldBegin() {
  const readFieldBeginCall = ts.createCall(_methods.readFieldBegin, undefined, undefined)
  const assignmentConst = createVariable(_id.ret, readFieldBeginCall)

  return assignmentConst
}
export function readFieldEnd() {
  const readFieldEndCall = ts.createCall(_methods.readFieldEnd, undefined, undefined)
  const readFieldEndStatement = ts.createStatement(readFieldEndCall)

  return readFieldEndStatement
}

// writeField
export function writeFieldBegin(name: string, type: string, fieldId: number): ts.ExpressionStatement {
  const writeFieldBeginCall = ts.createCall(_methods.writeFieldBegin, undefined, [
    ts.createLiteral(name),
    _types[type],
    ts.createLiteral(fieldId),
  ])
  const writeFieldBeginStatement = ts.createStatement(writeFieldBeginCall)
  return writeFieldBeginStatement
}
export function writeFieldEnd(): ts.ExpressionStatement {
  const writeFieldEndCall = ts.createCall(_methods.writeFieldEnd, undefined, undefined)
  const writeFieldEndStatement = ts.createStatement(writeFieldEndCall)

  return writeFieldEndStatement
}


export function skip() {
  const skipCall = ts.createCall(_methods.skip, undefined, [_id.ftype])
  const skipStatement = ts.createStatement(skipCall)

  return skipStatement
}
