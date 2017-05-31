import * as ts from 'typescript';

import { getReadBody } from './read-types';
import { getWriteBody } from './write-types';

import {
  createIf,
  createThrow,
  createVariable,
  createNotEquals
} from './ast-helpers'
import * as gen from './ast-specifics'

import { identifiers as _id } from './ast/identifiers';
import { types as _types } from './ast/thrift-types';
import { methods as _methods } from './ast/methods';
import { tokens as _tokens } from './ast/tokens';

import {
  StructTypeNode
} from './resolve/typedefs';

function createAssignment(left, right) {
  const _propertyAssignment = ts.createAssignment(left, right);

  return ts.createStatement(_propertyAssignment);
}

export function createConstructor(struct) {

  const hasFields = (struct.fields.length > 0);

  if (!hasFields) {
    // TODO: should we remove the constructor completely? Not sure the best way to do that
    return ts.createConstructor(undefined, undefined, undefined, ts.createBlock([]));
  }

  const _argsType = ts.createTypeReferenceNode(struct.implements, undefined);

  const _argsParameter = ts.createParameter(undefined, undefined, undefined, _id.args, _tokens.question, _argsType, undefined);

  const _fieldAssignments = struct.fields.map(function(field) {

    const _argsPropAccess = ts.createPropertyAccess(_id.args, field.name);
    const _thisPropAccess = ts.createPropertyAccess(ts.createThis(), field.name);

    // Map is supposed to use Thrift.copyMap but that doesn't work if we use something better than an object
    // Set/List is supposed to use Thrift.copyList but the implementation is weird and might not work when combined with the custom Map copying
    // TODO: should we perform a deep clone? Currently shallow but not sure if deep cloning is actually needed
    let _thenAssign;
    switch(field.type.toEnum()) {
      case 'SET': {
        // TODO: without some sort of recursion/deep-clone, a Set inside a Map/Set/List won't be a true Set but forEach should operate the same way
        // However, it wouldn't ensure unique values
        const _copy = ts.createNew(_id.Set, undefined, [_argsPropAccess]);
        _thenAssign = createAssignment(_thisPropAccess, _copy);
        break;
      }
      case 'LIST': {
        const _copy = ts.createCall(_methods.Arrayfrom, undefined, [_argsPropAccess]);
        _thenAssign = createAssignment(_thisPropAccess, _copy);
        break;
      }
      case 'MAP': {
        // TODO: without some sort of recursion/deep-clone, a Map inside a Map/Set/List won't be a true Map which would screw up our forEach
        const _copy = ts.createNew(_id.Map, undefined, [_argsPropAccess]);
        _thenAssign = createAssignment(_thisPropAccess, _copy);
        break;
      }
      case 'STRUCT': {
        const type = <StructTypeNode>field.type;
        // TODO: doesn't handle struct aliases
        const _new = ts.createNew(ts.createIdentifier(type.valueType), undefined, [_argsPropAccess]);
        _thenAssign = createAssignment(_thisPropAccess, _new);
        break;
      }
      case 'BOOL': {
        _thenAssign = createAssignment(_thisPropAccess, _argsPropAccess);
        break;
      }
      case 'I32': {
        _thenAssign = createAssignment(_thisPropAccess, _argsPropAccess);
        break;
      }
      case 'I16': {
        _thenAssign = createAssignment(_thisPropAccess, _argsPropAccess);
        break;
      }
      case 'STRING': {
        _thenAssign = createAssignment(_thisPropAccess, _argsPropAccess);
        break;
      }
      case 'BINARY': {
        _thenAssign = createAssignment(_thisPropAccess, _argsPropAccess);
        break;
      }
      case 'DOUBLE': {
        _thenAssign = createAssignment(_thisPropAccess, _argsPropAccess);
        break;
      }
      case 'I64': {
        _thenAssign = createAssignment(_thisPropAccess, _argsPropAccess);
        break;
      }
      case 'BYTE': {
        _thenAssign = createAssignment(_thisPropAccess, _argsPropAccess);
        break;
      }
      // The thrift binary warns to use i8 but then spits out writeByte
      case 'I8': {
        _thenAssign = createAssignment(_thisPropAccess, _argsPropAccess);
        break;
      }
      // TODO: probably need to handle other type aliases OR the validator/normalize phase can output these
      default:
        // TODO: custom types
        _thenAssign = createAssignment(_thisPropAccess, _argsPropAccess);
        // throw new Error('Not Implemented ' + field.type)
    }

    const _comparison = createNotEquals(_argsPropAccess, ts.createNull());

    let _elseThrow;
    if (field.option === 'required') {
      const _errCtor = ts.createPropertyAccess(_id.Thrift, 'TProtocolException');
      const _errType = ts.createPropertyAccess(_id.Thrift, 'TProtocolExceptionType.UNKNOWN')
      const _errArgs = [_errType, ts.createLiteral(`Required field ${field.name} is unset!`)];
      _elseThrow = createThrow(_errCtor, _errArgs);
    }

    return createIf(_comparison, _thenAssign, _elseThrow);
  })

  const _ifArgs = createIf(_id.args, _fieldAssignments);

  const _constructorBlock = ts.createBlock([_ifArgs], true);

  return ts.createConstructor(undefined, undefined, [_argsParameter], _constructorBlock);
}

function createReadField(field) {

  const _enumType = field.type.toEnum();

  const _comparison = ts.createStrictEquality(_id.ftype, _types[_enumType]);

  const _thisName = ts.createPropertyAccess(ts.createThis(), field.name);
  const _readAndAssign = getReadBody(field.type, _thisName);

  const _skip = gen.skip();

  const _break = ts.createBreak();

  const _ifType = createIf(_comparison, _readAndAssign, _skip);

  return ts.createCaseClause(ts.createLiteral(field.id), [
    ts.createBlock([_ifType, _break], true)
  ]);
}

export function createRead(struct) {
  const hasFields = (struct.fields.length > 0);

  const _readStructBegin = gen.readStructBegin();
  const _readFieldBegin = gen.readFieldBegin();

  // TODO: what is this used for? Doesn't seem used in my testing
  const _retFname = ts.createPropertyAccess(_id.ret, _id.fname);
  const _fnameConst = createVariable(_id.fname, _retFname);

  const _retFtype = ts.createPropertyAccess(_id.ret, _id.ftype);
  const _ftypeConst = createVariable(_id.ftype, _retFtype)

  const _retFid = ts.createPropertyAccess(_id.ret, _id.fid);
  const _fidConst = createVariable(_id.fid, _retFid);

  const _comparison = ts.createStrictEquality(_id.ftype, _types.STOP);

  const _ifStop = createIf(_comparison, ts.createBreak());

  const _skip = gen.skip();
  const _skipBlock = ts.createBlock([_skip], true);

  const _readFieldEnd = gen.readFieldEnd();

  let _whileBody;
  if (hasFields) {
    const _cases = struct.fields.map(createReadField);
    const _default = ts.createDefaultClause([_skipBlock])
    const _caseBlock = ts.createCaseBlock([
      ..._cases,
      _default
    ]);
    const _switch = ts.createSwitch(_id.fid, _caseBlock);


    _whileBody = ts.createBlock([
      _readFieldBegin,
      _fnameConst,
      _ftypeConst,
      _fidConst,
      _ifStop,
      _switch,
      _readFieldEnd
    ], true);
  } else {
     _whileBody = ts.createBlock([
      _readFieldBegin,
      _ftypeConst,
      _ifStop,
      _skip,
      _readFieldEnd
    ], true);
  }

  const _while = ts.createWhile(ts.createTrue(), _whileBody);

  const _readStructEnd = gen.readStructEnd();

  const _readBlock = ts.createBlock([
    _readStructBegin,
    _while,
    _readStructEnd
  ], true);

  const _inputDeclaration = ts.createParameter(undefined, undefined, undefined, _id.input, undefined, undefined, undefined);
  return ts.createMethod(undefined, [_tokens.public], undefined, _id.read, undefined, undefined, [_inputDeclaration], undefined, _readBlock);
}




function createWriteField(field) {
  const _thisPropAccess = ts.createPropertyAccess(ts.createThis(), field.name);

  const _comparison = createNotEquals(_thisPropAccess, ts.createNull());

  const _enumType = field.type.toEnum();

  let body = getWriteBody(field.type, _thisPropAccess);

  if (!Array.isArray(body)) {
    body = [body];
  }

  const _if = ts.createIf(_comparison, ts.createBlock([
    gen.writeFieldBegin(field.name, _enumType, field.id),
    ...body,
    gen.writeFieldEnd(),
  ]))

  return _if;
}

export function createWrite(struct) {

  const _writeStructBeginCall = ts.createCall(_methods.writeStructBegin, undefined, [ts.createLiteral(`${struct.name}`)]);
  const _writeStructBeginStatement = ts.createStatement(_writeStructBeginCall);

  const _writeFields = struct.fields.map(createWriteField);

  const _writeFieldStopCall = ts.createCall(_methods.writeFieldStop, undefined, undefined);
  const _writeFieldStopStatement = ts.createStatement(_writeFieldStopCall);

  const _writeStructEndCall = ts.createCall(_methods.writeStructEnd, undefined, undefined);
  const _writeStructEndStatement = ts.createStatement(_writeStructEndCall);

  const _writeBlock = ts.createBlock([
    _writeStructBeginStatement,
    ..._writeFields,
    _writeFieldStopStatement,
    _writeStructEndStatement
  ], true);

  const _outputDeclaration = ts.createParameter(undefined, undefined, undefined, _id.output, undefined, undefined, undefined);
  return ts.createMethod(undefined, [_tokens.public], undefined, _id.write, undefined, undefined, [_outputDeclaration], undefined, _writeBlock);
}