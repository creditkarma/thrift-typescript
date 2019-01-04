/**
 * UTILS
 *
 * This module contains abstractions around the TypeScript factory functions to make them more
 * concise.
 */
import * as ts from 'typescript'

import { TApplicationException, TProtocolException } from './types'

import {
    APPLICATION_EXCEPTION,
    PROTOCOL_EXCEPTION,
    THRIFT_IDENTIFIERS,
} from './identifiers'

export * from '../shared/utils'

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
