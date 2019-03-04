import * as ts from 'typescript'

import { FieldDefinition, UnionDefinition } from '@creditkarma/thrift-parser'

import { createLetStatement, throwProtocolException } from '../utils'

import { IRenderState } from '../../../types'
import { COMMON_IDENTIFIERS } from '../../shared/identifiers'
import { assignmentForField as _assignmentForField } from '../struct/reader'
import { strictNameForStruct } from '../struct/utils'
import { createAnyType, createNumberType } from '../types'
import { createNotNullCheck } from '../utils'

export function createReturnVariable(
    node: UnionDefinition,
    state: IRenderState,
): ts.VariableStatement {
    if (state.options.strictUnions) {
        return createLetStatement(
            COMMON_IDENTIFIERS._returnValue,
            createAnyType(),
            ts.createNull(),
        )
    } else {
        return createLetStatement(
            COMMON_IDENTIFIERS._returnValue,
            ts.createUnionTypeNode([
                ts.createTypeReferenceNode(
                    ts.createIdentifier(strictNameForStruct(node, state)),
                    undefined,
                ),
                ts.createNull(),
            ]),
            ts.createNull(),
        )
    }
}

// let _fieldsSet: number = 0;
export function createFieldIncrementer(): ts.VariableStatement {
    return createLetStatement(
        COMMON_IDENTIFIERS._fieldsSet,
        createNumberType(),
        ts.createLiteral(0),
    )
}

// _fieldsSet++;
export function incrementFieldsSet(): ts.ExpressionStatement {
    return ts.createStatement(
        ts.createPostfixIncrement(COMMON_IDENTIFIERS._fieldsSet),
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
            COMMON_IDENTIFIERS._fieldsSet,
            ts.SyntaxKind.GreaterThanToken,
            ts.createLiteral(1),
        ),
        ts.createBlock(
            [
                throwProtocolException(
                    'INVALID_DATA',
                    'TUnion cannot have more than one value',
                ),
            ],
            true,
        ),
        ts.createIf(
            ts.createBinary(
                COMMON_IDENTIFIERS._fieldsSet,
                ts.SyntaxKind.LessThanToken,
                ts.createLiteral(1),
            ),
            ts.createBlock(
                [
                    throwProtocolException(
                        'INVALID_DATA',
                        'TUnion must have one value set',
                    ),
                ],
                true,
            ),
        ),
    )
}

function returnAssignment(
    valueName: ts.Identifier,
    field: FieldDefinition,
): ts.Statement {
    return ts.createStatement(
        ts.createAssignment(
            COMMON_IDENTIFIERS._returnValue,
            ts.createObjectLiteral([
                ts.createPropertyAssignment(field.name.value, valueName),
            ]),
        ),
    )
}

/**
 * This actually creates the assignment for some field in the args argument to the corresponding field
 * in our struct class
 *
 * interface IStructArgs {
 *   id: number;
 * }
 *
 * constructor(args: IStructArgs) {
 *   if (args.id !== null && args.id !== undefined) {
 *     this.id = args.id;
 *   }
 * }
 *
 * This function creates the 'this.id = args.id' bit.
 */
export function assignmentForField(
    field: FieldDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    if (state.options.strictUnions) {
        return [
            incrementFieldsSet(),
            ..._assignmentForField(field, state, returnAssignment),
        ]
    } else {
        return [incrementFieldsSet(), ..._assignmentForField(field, state)]
    }
}

/**
 * Assign field if contained in args:
 *
 * if (args && args.<field.name> != null) {
 *   this.<field.name> = args.<field.name>
 * }
 *
 * If field is required throw an error:
 *
 * else {
 *   throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, 'Required field {{fieldName}} is unset!')
 * }
 */
export function createFieldAssignment(
    field: FieldDefinition,
    state: IRenderState,
): ts.IfStatement {
    const hasValue: ts.BinaryExpression = createNotNullCheck(
        ts.createPropertyAccess(COMMON_IDENTIFIERS.args, `${field.name.value}`),
    )

    const thenAssign: Array<ts.Statement> = assignmentForField(field, state)

    return ts.createIf(hasValue, ts.createBlock([...thenAssign], true))
}
