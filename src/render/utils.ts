import {
  BinaryExpression,
  CallExpression,
  ConstructorDeclaration,
  createAssignment,
  createBinary,
  createBlock,
  createCall,
  createConstructor,
  createIdentifier,
  createLiteral,
  createMethod,
  createNew,
  createNull,
  createParameter,
  createPropertyAccess,
  createStatement,
  createThis,
  createThrow,
  createToken,
  createVariableDeclaration,
  createVariableDeclarationList,
  createVariableStatement,
  Expression,
  ExpressionStatement,
  Identifier,
  MethodDeclaration,
  NodeFlags,
  ParameterDeclaration,
  PropertyAccessExpression,
  Statement,
  SyntaxKind,
  ThrowStatement,
  Token,
  TypeNode,
  VariableDeclarationList,
  VariableStatement,
} from 'typescript'

import {
  FieldRequired,
} from '@creditkarma/thrift-parser'

import {
  TProtocolException,
} from './types'

import {
  COMMON_IDENTIFIERS,
} from './identifiers'

/**
 * UTILS
 *
 * This module contains abstractions around the TypeScript factory functions to make them more
 * concise.
 */

export function createProtocolException(
  type: TProtocolException,
  message: string,
): ThrowStatement {
  const errCtor = createPropertyAccess(COMMON_IDENTIFIERS.Thrift, 'TProtocolException')
  const errType = createPropertyAccess(COMMON_IDENTIFIERS.Thrift, type)
  const errArgs = [ errType, createLiteral(message) ]
  return createThrow(createNew(errCtor, undefined, errArgs))
}

export function createCallStatement(
  obj: string | Identifier,
  method: string,
  args: Array<Expression> = [],
): ExpressionStatement {
  return createStatement(createMethodCall(obj, method, args))
}

export function createMethodCall(
  obj: string | Identifier,
  method: string,
  args: Array<Expression> = [],
): CallExpression {
  return createCall(
    propertyAccessForIdentifier(obj, method),
    undefined,
    args,
  )
}

/**
 * Given an object identifier and a field name, this returns an expression accessing that property
 *
 * EXAMPLE
 *
 * propertyAccessForIdentifier('test', 'this') => 'test.this'
 *
 * @param obj
 * @param field
 */
export function propertyAccessForIdentifier(obj: string | Identifier, prop: string): PropertyAccessExpression {
  switch (obj) {
    case 'this':
      return createPropertyAccess(createThis(), prop)

    default:
      return createPropertyAccess(
        (typeof obj === 'string' ? createIdentifier(obj) : obj),
        prop,
      )
  }
}

/**
 * Create assignment of one expression to another
 *
 * @param left
 * @param right
 */
export function createAssignmentStatement(left: Expression, right: Expression): ExpressionStatement {
  return createStatement(createAssignment(left, right))
}

export function createLetStatement(
  name: string | Identifier,
  type?: TypeNode,
  initializer?: Expression,
): VariableStatement {
  return createVariableStatement(
    undefined,
    createLet(name, type, initializer),
  )
}

export function createConstStatement(
  name: string | Identifier,
  type?: TypeNode,
  initializer?: Expression,
): VariableStatement {
  return createVariableStatement(
    undefined,
    createConst(name, type, initializer),
  )
}

export function createConst(
  name: string | Identifier,
  type?: TypeNode,
  initializer?: Expression,
): VariableDeclarationList {
  return createVariableDeclarationList([
    createVariableDeclaration(name, type, initializer),
  ], NodeFlags.Const)
}

export function createLet(
  name: string | Identifier,
  type?: TypeNode,
  initializer?: Expression,
): VariableDeclarationList {
  return createVariableDeclarationList([
    createVariableDeclaration(name, type, initializer),
  ], NodeFlags.Let)
}

/**
 * Create a check for strict inequality
 *
 * EXAMPLE
 *
 * createNotEquals(left, right) => 'left !== right'
 *
 * @param left
 * @param right
 */
export function createNotEquals(left: Expression, right: Expression): BinaryExpression {
  return createBinary(left, SyntaxKind.ExclamationEqualsEqualsToken, right)
}

/**
 * Create a check for strict equality
 *
 * EXAMPLE
 *
 * createEquals(left, right) => 'left === right'
 *
 * @param left
 * @param right
 */
export function createEquals(left: Expression, right: Expression): BinaryExpression {
  return createBinary(left, SyntaxKind.EqualsEqualsEqualsToken, right)
}

/**
 * Create a binary expression for testing not equal to null
 *
 * EXAMPLE
 *
 * createNotNull(obj, prop) => 'obj && (obj.prop != null)'
 *
 * @param obj
 * @param prop
 */
export function createNotNull(obj: string | Identifier ): BinaryExpression {
  return createBinary(
    ((typeof obj === 'string') ? createIdentifier(obj) : obj),
    SyntaxKind.ExclamationEqualsToken,
    createNull(),
  )
}

export function renderOptional(value: FieldRequired): Token<SyntaxKind.QuestionToken> | undefined {
  if (value === 'required') {
    return undefined
  } else {
    return createToken(SyntaxKind.QuestionToken)
  }
}

export function createClassConstructor(
  args: Array<ParameterDeclaration>,
  statements: Array<Statement>,
): ConstructorDeclaration {
  return createConstructor(undefined, undefined, args, createBlock(statements, true))
}

export function createFunctionParameter(
  name: string | Identifier,
  typeNode: TypeNode,
  initializer?: Expression,
  isOptional?: boolean,
): ParameterDeclaration {
  return createParameter(
    undefined,
    undefined,
    undefined,
    (typeof name === 'string' ? createIdentifier(name) : name),
    (isOptional ? createToken(SyntaxKind.QuestionToken) : undefined),
    typeNode,
    initializer,
  )
}

export function createPublicMethod(
  name: string,
  args: Array<ParameterDeclaration>,
  type: TypeNode,
  statements: Array<Statement>,
): MethodDeclaration {
  return createMethod(
    undefined,
    [ createToken(SyntaxKind.PublicKeyword) ],
    undefined,
    createIdentifier(name),
    undefined,
    undefined,
    args,
    type,
    createBlock(statements, true),
  )
}
