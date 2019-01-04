import * as ts from 'typescript'

import {
    FieldDefinition,
    FieldRequired,
    InterfaceWithFields,
} from '@creditkarma/thrift-parser'
import { COMMON_IDENTIFIERS } from './identifiers'

/**
 * Create a binary ts.Expression for testing not equal to null
 *
 * EXAMPLE
 *
 * createNotNull(obj, prop) => 'obj && (obj.prop != null)'
 */
export function createNotNullCheck(
    obj: string | ts.Expression,
): ts.BinaryExpression {
    return ts.createBinary(
        typeof obj === 'string' ? ts.createIdentifier(obj) : obj,
        ts.SyntaxKind.ExclamationEqualsToken,
        ts.createNull(),
    )
}

export function createNullCheck(
    obj: string | ts.Expression,
): ts.BinaryExpression {
    return ts.createBinary(
        typeof obj === 'string' ? ts.createIdentifier(obj) : obj,
        ts.SyntaxKind.EqualsEqualsToken,
        ts.createNull(),
    )
}

/**
 * Create a check for strict inequality
 *
 * EXAMPLE
 *
 * createNotEquals(left, right) => 'left !== right'
 */
export function createNotEqualsCheck(
    left: ts.Expression,
    right: ts.Expression,
): ts.BinaryExpression {
    return ts.createBinary(
        left,
        ts.SyntaxKind.ExclamationEqualsEqualsToken,
        right,
    )
}

/**
 * Create a check for strict equality
 *
 * EXAMPLE
 *
 * createEquals(left, right) => 'left === right'
 */
export function createEqualsCheck(
    left: ts.Expression,
    right: ts.Expression,
): ts.BinaryExpression {
    return ts.createBinary(left, ts.SyntaxKind.EqualsEqualsEqualsToken, right)
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

export function createPublicMethod(
    name: ts.Identifier,
    args: Array<ts.ParameterDeclaration>,
    type: ts.TypeNode,
    statements: Array<ts.Statement>,
): ts.MethodDeclaration {
    return ts.createMethod(
        undefined,
        [ts.createToken(ts.SyntaxKind.PublicKeyword)],
        undefined,
        name,
        undefined,
        undefined,
        args,
        type,
        ts.createBlock(statements, true),
    )
}

/**
 * Create assignment of one ts.Expression to another
 */
export function createAssignmentStatement(
    left: ts.Expression,
    right: ts.Expression,
): ts.ExpressionStatement {
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
    return ts.createVariableDeclarationList(
        [ts.createVariableDeclaration(name, type, initializer)],
        ts.NodeFlags.Const,
    )
}

export function createLet(
    name: string | ts.Identifier,
    type?: ts.TypeNode,
    initializer?: ts.Expression,
): ts.VariableDeclarationList {
    return ts.createVariableDeclarationList(
        [ts.createVariableDeclaration(name, type, initializer)],
        ts.NodeFlags.Let,
    )
}

export function createPrivateProperty(
    name: string | ts.Identifier,
    type?: ts.TypeNode,
    initializer?: ts.Expression,
): ts.PropertyDeclaration {
    return ts.createProperty(
        undefined,
        [ts.createToken(ts.SyntaxKind.PrivateKeyword)],
        name,
        undefined,
        type,
        initializer,
    )
}

export function createProtectedProperty(
    name: string | ts.Identifier,
    type?: ts.TypeNode,
    initializer?: ts.Expression,
): ts.PropertyDeclaration {
    return ts.createProperty(
        undefined,
        [ts.createToken(ts.SyntaxKind.ProtectedKeyword)],
        name,
        undefined,
        type,
        initializer,
    )
}

export function createPublicProperty(
    name: string | ts.Identifier,
    type?: ts.TypeNode,
    initializer?: ts.Expression,
) {
    return ts.createProperty(
        undefined,
        [ts.createToken(ts.SyntaxKind.PublicKeyword)],
        name,
        undefined,
        type,
        initializer,
    )
}

export function createCallStatement(
    obj: ts.Expression,
    args: Array<ts.Expression> = [],
): ts.ExpressionStatement {
    return ts.createStatement(
        ts.createCall(
            typeof obj === 'string' ? ts.createIdentifier(obj) : obj,
            undefined,
            args,
        ),
    )
}

export function createMethodCallStatement(
    obj: string | ts.Identifier,
    methodName: string | ts.Identifier,
    args: Array<ts.Expression> = [],
): ts.ExpressionStatement {
    return createCallStatement(
        propertyAccessForIdentifier(obj, methodName),
        args,
    )
}

export function createMethodCall(
    obj: string | ts.Expression,
    method: string | ts.Identifier,
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
 */
export function propertyAccessForIdentifier(
    obj: string | ts.Expression,
    prop: string | ts.Identifier,
): ts.PropertyAccessExpression {
    switch (obj) {
        case 'this':
            return ts.createPropertyAccess(ts.createThis(), prop)

        default:
            return ts.createPropertyAccess(
                typeof obj === 'string' ? ts.createIdentifier(obj) : obj,
                prop,
            )
    }
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
        typeof name === 'string' ? ts.createIdentifier(name) : name,
        isOptional ? ts.createToken(ts.SyntaxKind.QuestionToken) : undefined,
        typeNode,
        initializer,
    )
}

export function renderOptional(
    value: FieldRequired | null,
): ts.Token<ts.SyntaxKind.QuestionToken> | undefined {
    if (value !== 'required') {
        return ts.createToken(ts.SyntaxKind.QuestionToken)
    } else {
        return undefined
    }
}

export function hasRequiredField(struct: InterfaceWithFields): boolean {
    return struct.fields.reduce((acc: boolean, next: FieldDefinition) => {
        if (acc === false) {
            acc = next.requiredness === 'required'
        }
        return acc
    }, false)
}

export function createPromise(
    type: ts.TypeNode,
    returnType: ts.TypeNode,
    body: Array<ts.Statement>,
): ts.NewExpression {
    return ts.createNew(
        COMMON_IDENTIFIERS.Promise,
        [type],
        [
            ts.createArrowFunction(
                undefined,
                undefined,
                [
                    createFunctionParameter('resolve', undefined),
                    createFunctionParameter('reject', undefined),
                ],
                returnType,
                undefined,
                ts.createBlock([...body], true),
            ),
        ],
    )
}
