import * as ts from 'typescript';

export function createIf(_comparison: ts.BinaryExpression | ts.Identifier, _then?: ts.Statement | ts.Statement[], _else?: ts.Statement | ts.Statement[]) {
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

export function toOptional(option: string) {
  // This only works in certain cases, even if the methods take a questionToken as an argument
  switch(option.toUpperCase()) {
    case 'REQUIRED':
      // Ignore
      return;
    case 'OPTIONAL':
    default:
      return ts.createToken(ts.SyntaxKind.QuestionToken);
  }
}

export function toAstType(type: string) : ts.KeywordTypeNode {
  // This is all types as defined by the `thrift` node library
  switch(type.toUpperCase()) {
    case 'BOOL':
      return ts.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
    case 'BYTE': // TODO: is this a number type?
    case 'I08': // TODO: is this a number type?
    case 'DOUBLE':
    case 'I16':
    case 'I32':
    case 'I64':
      return ts.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
    case 'STRING':
    case 'UTF7':
    case 'UTF8':
    case 'UTF16':
      return ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
    case 'VOID': // TODO: does this need a type?
    case 'STRUCT':
    case 'MAP':
    case 'SET':
    case 'LIST':
      throw new Error('Not Implemented');
    default:
      return;
  }
}