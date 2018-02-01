/**
 * UTILS
 *
 * This module contains abstractions around the TypeScript factory functions to make them more
 * concise.
 */
import * as ts from 'typescript'

import {
  FieldRequired,
} from '@creditkarma/thrift-parser'

import {
  TApplicationException,
  TProtocolException,
} from './types'

import {
  COMMON_IDENTIFIERS,
  PROTOCOL_EXCEPTION,
  APPLICATION_EXCEPTION,
} from './identifiers'

export function createPrivateProperty(name: string | ts.Identifier, type?: ts.TypeNode, initializer?: ts.Expression): ts.PropertyDeclaration {
  return ts.createProperty(
    undefined,
    [ ts.createToken(ts.SyntaxKind.PrivateKeyword) ],
    name,
    undefined,
    type,
    initializer,
  )
}

export function createProtectedProperty(name: string | ts.Identifier, type?: ts.TypeNode, initializer?: ts.Expression): ts.PropertyDeclaration {
  return ts.createProperty(
    undefined,
    [ ts.createToken(ts.SyntaxKind.ProtectedKeyword) ],
    name,
    undefined,
    type,
    initializer,
  )
}

export function createPublicProperty(name: string | ts.Identifier, type?: ts.TypeNode, initializer?: ts.Expression) {
  return ts.createProperty(
    undefined,
    [ ts.createToken(ts.SyntaxKind.PublicKeyword) ],
    name,
    undefined,
    type,
    initializer,
  )
}

export function createPromise(
  type: ts.TypeNode,
  returnType: ts.TypeNode,
  body: Array<ts.Statement>
): ts.NewExpression {
  return ts.createNew(
    ts.createIdentifier('Promise'),
    [ type ],
    [ ts.createArrowFunction(
      undefined,
      undefined,
      [
        createFunctionParameter('resolve', undefined),
        createFunctionParameter('reject', undefined),
      ],
      returnType,
      undefined,
      ts.createBlock([
        ...body,
      ], true),
    ) ],
  )
}

export function createProtocolException(
  type: TProtocolException,
  message: string,
): ts.NewExpression {
  const errCtor = COMMON_IDENTIFIERS.TProtocolException
  const errType = PROTOCOL_EXCEPTION[type]
  const errArgs = [ errType, ts.createLiteral(message) ]
  return ts.createNew(errCtor, undefined, errArgs)
}

export function throwProtocolException(
  type: TProtocolException,
  message: string,
): ts.ThrowStatement {
  return ts.createThrow(createProtocolException(type, message))
}

export function createApplicationException(
  type: TApplicationException,
  message: string | ts.Expression,
): ts.NewExpression {
  const errCtor = COMMON_IDENTIFIERS.TApplicationException
  const errType = APPLICATION_EXCEPTION[type]
  const errArgs = [
    errType,
    (typeof message === 'string' ? ts.createLiteral(message) : message),
  ]
  return ts.createNew(errCtor, undefined, errArgs)
}

export function throwApplicationException(
  type: TApplicationException,
  message: string,
): ts.ThrowStatement {
  return ts.createThrow(createApplicationException(type, message))
}

export function createCallStatement(
  obj: ts.Expression,
  args: Array<ts.Expression> = [],
): ts.ExpressionStatement {
  return ts.createStatement(ts.createCall(
    (typeof obj === 'string' ? ts.createIdentifier(obj) : obj),
    undefined,
    args,
  ))
}

export function createMethodCallStatement(
  obj: string | ts.Identifier,
  methodName: string,
  args: Array<ts.Expression> = [],
): ts.ExpressionStatement {
  return createCallStatement(
    propertyAccessForIdentifier(obj, methodName),
    args,
  )
}

export function createMethodCall(
  obj: string | ts.Expression,
  method: string,
  args: Array<ts.Expression> = [],
): ts.CallExpression {
  return ts.createCall(
    propertyAccessForIdentifier(obj, method),
    undefined,
    args,
  )
}

/**
 * Given an object ts.Identifier and a field name, this returns an ts.Expression accessing that property
 *
 * EXAMPLE
 *
 * propertyAccessForIdentifier('test', 'this') => 'test.this'
 *
 * @param obj
 * @param field
 */
export function propertyAccessForIdentifier(obj: string | ts.Expression, prop: string): ts.PropertyAccessExpression {
  switch (obj) {
    case 'this':
      return ts.createPropertyAccess(ts.createThis(), prop)

    default:
      return ts.createPropertyAccess(
        (typeof obj === 'string' ? ts.createIdentifier(obj) : obj),
        prop,
      )
  }
}

/**
 * Create assignment of one ts.Expression to another
 *
 * @param left
 * @param right
 */
export function createAssignmentStatement(left: ts.Expression, right: ts.Expression): ts.ExpressionStatement {
  return ts.createStatement(ts.createAssignment(left, right))
}

export function createLetStatement(
  name: string | ts.Identifier,
  type?: ts.TypeNode,
  initializer?: ts.Expression,
): ts.VariableStatement {
  return ts.createVariableStatement(
    undefined,
    createLet(name, type, initializer),
  )
}

export function createConstStatement(
  name: string | ts.Identifier,
  type?: ts.TypeNode,
  initializer?: ts.Expression,
): ts.VariableStatement {
  return ts.createVariableStatement(
    undefined,
    createConst(name, type, initializer),
  )
}

export function createConst(
  name: string | ts.Identifier,
  type?: ts.TypeNode,
  initializer?: ts.Expression,
): ts.VariableDeclarationList {
  return ts.createVariableDeclarationList([
    ts.createVariableDeclaration(name, type, initializer),
  ], ts.NodeFlags.Const)
}

export function createLet(
  name: string | ts.Identifier,
  type?: ts.TypeNode,
  initializer?: ts.Expression,
): ts.VariableDeclarationList {
  return ts.createVariableDeclarationList([
    ts.createVariableDeclaration(name, type, initializer),
  ], ts.NodeFlags.Let)
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
export function createNotEquals(left: ts.Expression, right: ts.Expression): ts.BinaryExpression {
  return ts.createBinary(left, ts.SyntaxKind.ExclamationEqualsEqualsToken, right)
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
export function createEquals(left: ts.Expression, right: ts.Expression): ts.BinaryExpression {
  return ts.createBinary(left, ts.SyntaxKind.EqualsEqualsEqualsToken, right)
}

/**
 * Create a binary ts.Expression for testing not equal to null
 *
 * EXAMPLE
 *
 * createNotNull(obj, prop) => 'obj && (obj.prop != null)'
 *
 * @param obj
 * @param prop
 */
export function createNotNullCheck(obj: string | ts.Expression ): ts.BinaryExpression {
  return ts.createBinary(
    ((typeof obj === 'string') ? ts.createIdentifier(obj) : obj),
    ts.SyntaxKind.ExclamationEqualsToken,
    ts.createNull(),
  )
}

export function renderOptional(value: FieldRequired | null): ts.Token<ts.SyntaxKind.QuestionToken> | undefined {
  if (value !== 'required') {
    return ts.createToken(ts.SyntaxKind.QuestionToken)
  } else {
    return undefined
  }
}

export function createClassConstructor(
  parameters: Array<ts.ParameterDeclaration>,
  statements: Array<ts.Statement>,
): ts.ConstructorDeclaration {
  return ts.createConstructor(
    undefined,
    undefined,
    parameters,
    ts.createBlock(statements, true),
  )
}

export function createFunctionParameter(
  name: string | ts.Identifier,
  typeNode: ts.TypeNode | undefined,
  initializer?: ts.Expression,
  isOptional?: boolean,
): ts.ParameterDeclaration {
  return ts.createParameter(
    undefined,
    undefined,
    undefined,
    (typeof name === 'string' ? ts.createIdentifier(name) : name),
    (isOptional ? ts.createToken(ts.SyntaxKind.QuestionToken) : undefined),
    typeNode,
    initializer,
  )
}

export function createPublicMethod(
  name: string,
  args: Array<ts.ParameterDeclaration>,
  type: ts.TypeNode,
  statements: Array<ts.Statement>,
): ts.MethodDeclaration {
  return ts.createMethod(
    undefined,
    [ ts.createToken(ts.SyntaxKind.PublicKeyword) ],
    undefined,
    ts.createIdentifier(name),
    undefined,
    undefined,
    args,
    type,
    ts.createBlock(statements, true),
  )
}
