import * as ts from 'typescript'

import { getReadBody } from './read-types'
import { getWriteBody } from './write-types'

import {
  createIf,
  createNotEquals,
  createThrow,
  createVariable,
} from './ast-helpers'
import * as gen from './ast-specifics'

import { identifiers as _id } from './ast/identifiers'
import { methods as _methods } from './ast/methods'
import { types as _types } from './ast/thrift-types'
import { tokens as _tokens } from './ast/tokens'

import StructNode from './nodes/StructNode'
import StructPropertyNode from './nodes/StructPropertyNode'
import StructTypeNode from './nodes/StructTypeNode'

function createAssignment(left, right): ts.ExpressionStatement {
  const propertyAssignment = ts.createAssignment(left, right)

  return ts.createStatement(propertyAssignment)
}

export function createConstructor(struct: StructNode): ts.ConstructorDeclaration {

  let argsType
  if (struct.size) {
    argsType = ts.createTypeReferenceNode(struct.implements, undefined)
  }

  const argsParameter = ts.createParameter(undefined, undefined, undefined,
    _id.args, _tokens.question, argsType, undefined)

  const fieldAssignments = struct.fields.map((field) => {

    const argsPropAccess = ts.createPropertyAccess(_id.args, field.name)
    const thisPropAccess = ts.createPropertyAccess(ts.createThis(), field.name)

    // Map is supposed to use Thrift.copyMap but that doesn't work if we use something better than an object
    // Set/List is supposed to use Thrift.copyList but the implementation is weird and might not work
    // when combined with the custom Map copying
    // TODO: should we perform a deep clone? Currently shallow but not sure if deep cloning is actually needed
    let thenAssign
    switch (field.type.toEnum()) {
      case 'SET': {
        // TODO: without some sort of recursion/deep-clone, a Set inside a Map/Set/List
        // won't be a true Set but forEach should operate the same way
        // However, it wouldn't ensure unique values
        const copy = ts.createNew(_id.Set, undefined, [argsPropAccess])
        thenAssign = createAssignment(thisPropAccess, copy)
        break
      }
      case 'LIST': {
        const copy = ts.createCall(_methods.Arrayfrom, undefined, [argsPropAccess])
        thenAssign = createAssignment(thisPropAccess, copy)
        break
      }
      case 'MAP': {
        // TODO: without some sort of recursion/deep-clone, a Map inside a Map/Set/List
        // won't be a true Map which would screw up our forEach
        const copy = ts.createNew(_id.Map, undefined, [argsPropAccess])
        thenAssign = createAssignment(thisPropAccess, copy)
        break
      }
      case 'STRUCT': {
        const type = field.type as StructTypeNode
        // TODO: doesn't handle struct aliases
        const newCall = ts.createNew(ts.createIdentifier(type.valueType), undefined, [argsPropAccess])
        thenAssign = createAssignment(thisPropAccess, newCall)
        break
      }
      case 'BOOL': {
        thenAssign = createAssignment(thisPropAccess, argsPropAccess)
        break
      }
      case 'I32': {
        thenAssign = createAssignment(thisPropAccess, argsPropAccess)
        break
      }
      case 'I16': {
        thenAssign = createAssignment(thisPropAccess, argsPropAccess)
        break
      }
      case 'STRING': {
        thenAssign = createAssignment(thisPropAccess, argsPropAccess)
        break
      }
      case 'BINARY': {
        thenAssign = createAssignment(thisPropAccess, argsPropAccess)
        break
      }
      case 'DOUBLE': {
        thenAssign = createAssignment(thisPropAccess, argsPropAccess)
        break
      }
      case 'I64': {
        thenAssign = createAssignment(thisPropAccess, argsPropAccess)
        break
      }
      case 'BYTE': {
        thenAssign = createAssignment(thisPropAccess, argsPropAccess)
        break
      }
      // The thrift binary warns to use i8 but then spits out writeByte
      case 'I8': {
        thenAssign = createAssignment(thisPropAccess, argsPropAccess)
        break
      }
      // TODO: probably need to handle other type aliases OR the validator/normalize phase can output these
      default:
        // TODO: custom types
        thenAssign = createAssignment(thisPropAccess, argsPropAccess)
        // throw new Error('Not Implemented ' + field.type)
    }

    const comparison = createNotEquals(argsPropAccess, ts.createNull())

    let elseThrow
    if (field.option === 'required') {
      const errCtor = ts.createPropertyAccess(_id.Thrift, 'TProtocolException')
      const errType = ts.createPropertyAccess(_id.Thrift, 'TProtocolExceptionType.UNKNOWN')
      const errArgs = [errType, ts.createLiteral(`Required field ${field.name} is unset!`)]
      elseThrow = createThrow(errCtor, errArgs)
    }

    return createIf(comparison, thenAssign, elseThrow)
  })

  let constructorBlock
  if (fieldAssignments.length) {
    const ifArgs = createIf(_id.args, fieldAssignments)
    constructorBlock = ts.createBlock([ifArgs], true)
  } else {
    constructorBlock = ts.createBlock(undefined)
  }

  return ts.createConstructor(undefined, undefined, [argsParameter], constructorBlock)
}

function createReadField(field: StructPropertyNode): ts.CaseClause {

  const enumType = field.type.toEnum()

  const comparison = ts.createStrictEquality(_id.ftype, _types[enumType])

  const thisName = ts.createPropertyAccess(ts.createThis(), field.name)
  const readAndAssign = getReadBody(field.type, thisName)

  const skip = gen.skip()

  const breakStatement = ts.createBreak()

  const ifType = createIf(comparison, readAndAssign, skip)

  return ts.createCaseClause(ts.createLiteral(field.id), [ts.createBlock([ifType, breakStatement], true)])
}

export function createRead(struct: StructNode): ts.MethodDeclaration {
  const readStructBegin = gen.readStructBegin()
  const readFieldBegin = gen.readFieldBegin()

  // TODO: what is this used for? Doesn't seem used in my testing
  const retFname = ts.createPropertyAccess(_id.ret, _id.fname)
  const fnameConst = createVariable(_id.fname, retFname)

  const retFtype = ts.createPropertyAccess(_id.ret, _id.ftype)
  const ftypeConst = createVariable(_id.ftype, retFtype)

  const retFid = ts.createPropertyAccess(_id.ret, _id.fid)
  const fidConst = createVariable(_id.fid, retFid)

  const comparison = ts.createStrictEquality(_id.ftype, _types.STOP)

  const ifStop = createIf(comparison, ts.createBreak())

  const skip = gen.skip()
  const skipBlock = ts.createBlock([skip], true)

  const readFieldEnd = gen.readFieldEnd()

  let whileBody
  if (struct.size) {
    const cases = struct.fields.map(createReadField)
    const defaultClause = ts.createDefaultClause([skipBlock])
    const caseBlock = ts.createCaseBlock([
      ...cases,
      defaultClause,
    ])
    const switchStatement = ts.createSwitch(_id.fid, caseBlock)

    whileBody = ts.createBlock([
      readFieldBegin,
      fnameConst,
      ftypeConst,
      fidConst,
      ifStop,
      switchStatement,
      readFieldEnd,
    ], true)
  } else {
     whileBody = ts.createBlock([
      readFieldBegin,
      ftypeConst,
      ifStop,
      skip,
      readFieldEnd,
    ], true)
  }

  const whileStatment = ts.createWhile(ts.createTrue(), whileBody)

  const readStructEnd = gen.readStructEnd()

  const readBlock = ts.createBlock([
    readStructBegin,
    whileStatment,
    readStructEnd,
  ], true)

  const inputDeclaration = ts.createParameter(undefined, undefined, undefined,
    _id.input, undefined, undefined, undefined)

  return ts.createMethod(undefined, [_tokens.public], undefined, _id.read, undefined, undefined,
    [inputDeclaration], undefined, readBlock)
}

function createWriteField(field: StructPropertyNode): ts.IfStatement {
  const thisPropAccess = ts.createPropertyAccess(ts.createThis(), field.name)

  const comparison = createNotEquals(thisPropAccess, ts.createNull())

  const enumType = field.type.toEnum()

  let body = getWriteBody(field.type, thisPropAccess)

  const ifStatement = ts.createIf(comparison, ts.createBlock([
    gen.writeFieldBegin(field.name, enumType, field.id),
    ...body,
    gen.writeFieldEnd(),
  ]))

  return ifStatement
}

export function createWrite(struct: StructNode): ts.MethodDeclaration {

  const writeStructBeginCall = ts.createCall(_methods.writeStructBegin, undefined, [
    ts.createLiteral(`${struct.name}`),
  ])
  const writeStructBeginStatement = ts.createStatement(writeStructBeginCall)

  const writeFields = struct.fields.map(createWriteField)

  const writeFieldStopCall = ts.createCall(_methods.writeFieldStop, undefined, undefined)
  const writeFieldStopStatement = ts.createStatement(writeFieldStopCall)

  const writeStructEndCall = ts.createCall(_methods.writeStructEnd, undefined, undefined)
  const writeStructEndStatement = ts.createStatement(writeStructEndCall)

  const writeBlock = ts.createBlock([
    writeStructBeginStatement,
    ...writeFields,
    writeFieldStopStatement,
    writeStructEndStatement,
  ], true)

  const outputDeclaration = ts.createParameter(undefined, undefined, undefined,
    _id.output, undefined, undefined, undefined)

  return ts.createMethod(undefined, [_tokens.public], undefined, _id.write, undefined, undefined,
    [outputDeclaration], undefined, writeBlock)
}
