import * as ts from 'typescript';

import { tokens as _tokens } from './ast/tokens';

export function createIf(_comparison: ts.BinaryExpression | ts.CallExpression | ts.Identifier, _then?: ts.Statement | ts.Statement[], _else?: ts.Statement | ts.Statement[]) {
  let _thenBlock;
  if (_then) {
    _then = Array.isArray(_then) ? _then : [_then];
    _thenBlock = ts.createBlock(_then, true);
  }

  let _elseBlock;
  if (_else) {
    _else = Array.isArray(_else) ? _else : [_else];
    _elseBlock = ts.createBlock(_else, true);
  }

  return ts.createIf(_comparison, _thenBlock, _elseBlock);
}

export function createThrow(_ctor, _args) {
  const _err = ts.createNew(_ctor, undefined, _args);

  return ts.createThrow(_err);
}

export function createNotEquals(_left: ts.Expression, _right: ts.Expression) {
  return ts.createBinary(_left, ts.SyntaxKind.ExclamationEqualsToken, _right);
}

export function createVariable(_name: string | ts.Identifier, _init: ts.Expression) {
  const _varDec = ts.createVariableDeclaration(_name, undefined, _init);
  const _varDecList = ts.createVariableDeclarationList([_varDec], ts.NodeFlags.Const);

  return ts.createVariableStatement(undefined, _varDecList);
}

export function toOptional(option: string = '') {
  // This only works in certain cases, even if the methods take a questionToken as an argument
  switch(option.toUpperCase()) {
    case 'REQUIRED':
      // Ignore
      return;
    case 'OPTIONAL':
    default:
      return _tokens.question;
  }
}
