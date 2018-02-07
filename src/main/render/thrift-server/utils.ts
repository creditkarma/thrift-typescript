/**
 * UTILS
 *
 * This module contains abstractions around the TypeScript factory functions to make them more
 * concise.
 */
import * as ts from 'typescript'

import {
    FieldDefinition,
    SyntaxType,
} from '@creditkarma/thrift-parser'

import {
    TApplicationException,
    TProtocolException,
} from './types'

import {
    renderValue,
} from '../shared/values'

import {
    createNotNullCheck,
} from '../shared/utils'

export function getInitializerForField(objName: string, field: FieldDefinition): ts.Expression {
    if (field.defaultValue !== null && field.defaultValue !== undefined) {
        // return ts.createBinary(
        //     ts.createIdentifier(`${objName}.${field.name.value}`),
        //     ts.SyntaxKind.BarBarToken,
        //     renderValue(field.fieldType, field.defaultValue),
        // )
        return ts.createConditional(
            createNotNullCheck(
                ts.createIdentifier(`${objName}.${field.name.value}`)
            ),
            ts.createIdentifier(`${objName}.${field.name.value}`),
            renderValue(field.fieldType, field.defaultValue),
        )
    } else {
        return ts.createIdentifier(`${objName}.${field.name.value}`)
    }
}

import {
    THRIFT_IDENTIFIERS,
    PROTOCOL_EXCEPTION,
    APPLICATION_EXCEPTION,
} from './identifiers'

export function isNotVoid(field: FieldDefinition): boolean {
    return field.fieldType.type !== SyntaxType.VoidKeyword;
}

export function createProtocolException(
    type: TProtocolException,
    message: string,
): ts.NewExpression {
    const errCtor = THRIFT_IDENTIFIERS.TProtocolException
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
    const errCtor = THRIFT_IDENTIFIERS.TApplicationException
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
