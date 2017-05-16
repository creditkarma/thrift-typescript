import * as ts from 'typescript';

import {
  getType,
  createIf,
  createVariable
} from './ast-helpers';

function createWriteBody(methodName: string | ts.Identifier, args: ts.Expression | ts.Expression[] | undefined) {
  if (!Array.isArray(args)) {
    args = [args];
  }

  const _writeType = ts.createPropertyAccess(ts.createIdentifier('output'), methodName);
  const _writeTypeCall = ts.createCall(_writeType, undefined, args);

  return ts.createStatement(_writeTypeCall);
}

function writeSetBegin(type: string, lengthAccess: ts.PropertyAccessExpression) : ts.ExpressionStatement {
  // output.writeSetBegin(Thrift.Type.STRING, this.hmm2.length);
  const _writeSetBegin = ts.createPropertyAccess(ts.createIdentifier('output'), 'writeSetBegin');
  const _writeSetBeginCall = ts.createCall(_writeSetBegin, undefined, [
    ts.createPropertyAccess(ts.createIdentifier('Thrift'), `Type.${type}`),
    lengthAccess
  ]);
  const _writeSetBeginStatement = ts.createStatement(_writeSetBeginCall);

  return _writeSetBeginStatement;
}

function writeSetEnd() : ts.ExpressionStatement {
  // output.writeSetEnd();
  const _writeSetEnd = ts.createPropertyAccess(ts.createIdentifier('output'), 'writeSetEnd');
  const _writeSetEndCall = ts.createCall(_writeSetEnd, undefined, undefined);
  const _writeSetEndStatement = ts.createStatement(_writeSetEndCall);

  return _writeSetEndStatement;
}

function writeListBegin(type: string, lengthAccess: ts.PropertyAccessExpression) : ts.ExpressionStatement {
  // output.writeListBegin(Thrift.Type.STRING, this.hmm2.length);
  const _writeListBegin = ts.createPropertyAccess(ts.createIdentifier('output'), 'writeListBegin');
  const _writeListBeginCall = ts.createCall(_writeListBegin, undefined, [
    ts.createPropertyAccess(ts.createIdentifier('Thrift'), `Type.${type}`),
    lengthAccess
  ]);
  const _writeListBeginStatement = ts.createStatement(_writeListBeginCall);

  return _writeListBeginStatement;
}

function writeListEnd() : ts.ExpressionStatement {
  // output.writeListEnd();
  const _writeListEnd = ts.createPropertyAccess(ts.createIdentifier('output'), 'writeListEnd');
  const _writeListEndCall = ts.createCall(_writeListEnd, undefined, undefined);
  const _writeListEndStatement = ts.createStatement(_writeListEndCall);

  return _writeListEndStatement;
}

function getListLikeLoop(innerType, accessVar) {
  // for (var iter46 in this.hmm2) {

  // TODO: set is stored in an array, maybe this should be a for loop instead
  const _loopTmp = ts.createLoopVariable();
  const _key = ts.createVariableDeclarationList([
    ts.createVariableDeclaration(_loopTmp)
  ]);
  //   if (this.hmm2.hasOwnProperty(iter46))
  const _hasOwnProp = ts.createPropertyAccess(accessVar, 'hasOwnProperty');
  const _hasOwnPropCall = ts.createCall(_hasOwnProp, undefined, [
    _loopTmp
  ]);
  // output.writeString(this.hmm2[iter46]);
  const _elAccess = ts.createElementAccess(accessVar, _loopTmp);
  const _tmpVar = ts.createTempVariable(undefined);
  const _assign = createVariable(_tmpVar, _elAccess);
  // Yay, real recursion
  let _writeTypeStatement = getBody(innerType, _tmpVar);
  if (!Array.isArray(_writeTypeStatement)) {
    _writeTypeStatement = [_writeTypeStatement];
  }
  const _ifHasOwnProp = createIf(_hasOwnPropCall, [
    _assign,
    ..._writeTypeStatement
  ]);
  const _writeBlock = ts.createBlock([
    _ifHasOwnProp
  ]);
  const _forIn = ts.createForIn(_key, accessVar, _writeBlock);

  return _forIn;
}

function createSetBody(accessVar, _innerType) {
  let innerType;
  // TODO: there has to be a better way to do this
  if (typeof _innerType === 'object') {
    innerType = _innerType.name[0].toUpperCase() + _innerType.name.slice(1);
  } else {
    innerType = _innerType[0].toUpperCase() + _innerType.slice(1);
  }

  const _forIn = getListLikeLoop(_innerType, accessVar)

  return [
    writeSetBegin(
      innerType.toUpperCase(),
      ts.createPropertyAccess(accessVar, 'length')
    ),
    _forIn,
    writeSetEnd()
  ];
}

function createListBody(accessVar, _innerType) {
  let innerType;
  // TODO: there has to be a better way to do this
  if (typeof _innerType === 'object') {
    innerType = _innerType.name[0].toUpperCase() + _innerType.name.slice(1);
  } else {
    innerType = _innerType[0].toUpperCase() + _innerType.slice(1);
  }

  const _forIn = getListLikeLoop(_innerType, accessVar)

  return [
    writeListBegin(
      innerType.toUpperCase(),
      ts.createPropertyAccess(accessVar, 'length')
    ),
    _forIn,
    writeListEnd()
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
    case 'map':
      break;
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
