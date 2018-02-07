import * as ts from 'typescript'

import {
    UnionDefinition,
} from '@creditkarma/thrift-parser'

import {
    createLetStatement,
} from '../../shared/utils'

import {
    createNumberType,
} from '../../shared/types'

import {
    throwProtocolException,
} from '../utils'

export const RETURN_NAME: string = '_returnValue'
export const INCREMENTER: string = '_fieldsSet'

// let _fieldsSet: number = 0;
export function createFieldIncrementer(): ts.VariableStatement {
    return createLetStatement(
        INCREMENTER,
        createNumberType(),
        ts.createLiteral(0),
    )
}

// _fieldsSet++;
export function incrementFieldsSet(): ts.ExpressionStatement {
    return ts.createStatement(
        ts.createPostfixIncrement(
            ts.createIdentifier(INCREMENTER)
        )
    )
}

/**
 * if (fieldsSet > 1) {
 *   throw new Thrift.TProtocolException(TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with more than one set value!");
 * }
 * else if (fieldsSet < 1) {
 *   throw new Thrift.TProtocolException(TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with no set value!");
 * }
 */
export function createFieldValidation(node: UnionDefinition): ts.IfStatement {
    return ts.createIf(
        ts.createBinary(
            ts.createIdentifier(INCREMENTER),
            ts.SyntaxKind.GreaterThanToken,
            ts.createLiteral(1),
        ),
        ts.createBlock([
            throwProtocolException(
                'INVALID_DATA',
                'TUnion cannot have more than one value',
            ),
        ], true),
        ts.createIf(
            ts.createBinary(
                ts.createIdentifier(INCREMENTER),
                ts.SyntaxKind.LessThanToken,
                ts.createLiteral(1),
            ),
            ts.createBlock([
                throwProtocolException(
                    'INVALID_DATA',
                    'TUnion must have one value set',
                ),
            ], true),
        ),
    )
}
