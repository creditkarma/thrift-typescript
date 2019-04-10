/**
 * UTILS
 *
 * This module contains abstractions around the TypeScript factory functions to make them more
 * concise.
 */
import * as ts from 'typescript'

import {
    FieldDefinition,
    FunctionType,
    SyntaxType,
} from '@creditkarma/thrift-parser'

import { TApplicationException, TProtocolException } from './types'

import { renderValue } from './initializers'

import { createNotNullCheck } from './utils'

import { IRenderState } from '../../types'
import {
    APPLICATION_EXCEPTION,
    COMMON_IDENTIFIERS,
    PROTOCOL_EXCEPTION,
    THRIFT_IDENTIFIERS,
} from './identifiers'

export * from '../shared/utils'

export function coerceType(
    valueName: ts.Identifier,
    fieldType: FunctionType,
): ts.Expression {
    switch (fieldType.type) {
        case SyntaxType.I64Keyword:
            return ts.createParen(
                ts.createConditional(
                    ts.createBinary(
                        ts.createTypeOf(valueName),
                        ts.SyntaxKind.EqualsEqualsEqualsToken,
                        ts.createLiteral('number'),
                    ),
                    ts.createNew(COMMON_IDENTIFIERS.Int64, undefined, [
                        valueName,
                    ]),
                    ts.createConditional(
                        ts.createBinary(
                            ts.createTypeOf(valueName),
                            ts.SyntaxKind.EqualsEqualsEqualsToken,
                            ts.createLiteral('string'),
                        ),
                        ts.createCall(
                            ts.createPropertyAccess(
                                COMMON_IDENTIFIERS.Int64,
                                ts.createIdentifier('fromDecimalString'),
                            ),
                            undefined,
                            [valueName],
                        ),
                        valueName,
                    ),
                ),
            )

        case SyntaxType.BinaryKeyword:
            return ts.createParen(
                ts.createConditional(
                    ts.createBinary(
                        ts.createTypeOf(valueName),
                        ts.SyntaxKind.EqualsEqualsEqualsToken,
                        ts.createLiteral('string'),
                    ),
                    ts.createCall(
                        ts.createIdentifier('Buffer.from'),
                        undefined,
                        [valueName],
                    ),
                    valueName,
                ),
            )

        default:
            return valueName
    }
}

export function getInitializerForField(
    objName: string,
    field: FieldDefinition,
    state: IRenderState,
    loose: boolean = false,
): ts.Expression {
    const valueName: ts.Identifier = ts.createIdentifier(
        `${objName}.${field.name.value}`,
    )

    if (field.defaultValue !== null && field.defaultValue !== undefined) {
        return ts.createParen(
            ts.createConditional(
                createNotNullCheck(valueName),
                loose === true
                    ? coerceType(valueName, field.fieldType)
                    : valueName,
                renderValue(field.fieldType, field.defaultValue, state),
            ),
        )
    } else {
        return loose === true
            ? coerceType(valueName, field.fieldType)
            : valueName
    }
}

export function isNotVoid(field: FieldDefinition): boolean {
    return field.fieldType.type !== SyntaxType.VoidKeyword
}

export function createProtocolException(
    type: TProtocolException,
    message: string,
): ts.NewExpression {
    const errCtor = THRIFT_IDENTIFIERS.TProtocolException
    const errType = PROTOCOL_EXCEPTION[type]
    const errArgs = [errType, ts.createLiteral(message)]
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
    const errCtor = THRIFT_IDENTIFIERS.TApplicationException
    const errType = APPLICATION_EXCEPTION[type]
    const errArgs = [
        errType,
        typeof message === 'string' ? ts.createLiteral(message) : message,
    ]
    return ts.createNew(errCtor, undefined, errArgs)
}

export function throwApplicationException(
    type: TApplicationException,
    message: string,
): ts.ThrowStatement {
    return ts.createThrow(createApplicationException(type, message))
}
