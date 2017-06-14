import * as ts from 'typescript'

import { tokens as _tokens } from './ast/tokens'

export type Comparison = ts.BinaryExpression | ts.CallExpression | ts.Identifier
export type ThenStatement = ts.Statement | ts.Statement[]
export type ElseStatement = ts.Statement | ts.Statement[]

export function createIf(comparison: Comparison, thenStatement?: ThenStatement, elseStatement?: ElseStatement) {
  let thenBlock
  if (thenStatement) {
    thenStatement = Array.isArray(thenStatement) ? thenStatement : [thenStatement]
    thenBlock = ts.createBlock(thenStatement, true)
  }

  let elseBlock
  if (elseStatement) {
    elseStatement = Array.isArray(elseStatement) ? elseStatement : [elseStatement]
    elseBlock = ts.createBlock(elseStatement, true)
  }

  return ts.createIf(comparison, thenBlock, elseBlock)
}

export function createThrow(ctor, args) {
  const err = ts.createNew(ctor, undefined, args)

  return ts.createThrow(err)
}

export function createNotEquals(left: ts.Expression, right: ts.Expression) {
  return ts.createBinary(left, ts.SyntaxKind.ExclamationEqualsToken, right)
}

export function createVariable(name: string | ts.Identifier, init: ts.Expression) {
  const varDec = ts.createVariableDeclaration(name, undefined, init)
  const varDecList = ts.createVariableDeclarationList([varDec], ts.NodeFlags.Const)

  return ts.createVariableStatement(undefined, varDecList)
}

export function toOptional(option: string = '') {
  // This only works in certain cases, even if the methods take a questionToken as an argument
  switch (option.toUpperCase()) {
    case 'REQUIRED':
      // Ignore
      return
    case 'OPTIONAL':
    default:
      return _tokens.question
  }
}
