import * as ts from 'typescript'

import { FieldDefinition, UnionDefinition } from '@creditkarma/thrift-parser'

import { COMMON_IDENTIFIERS } from '../identifiers'

import { thriftTypeForFieldType } from '../types'

import { createFunctionParameter } from '../utils'

import { createEqualsCheck, throwProtocolException } from '../utils'

import { IRenderState } from '../../../types'

import { createSkipBlock, readValueForFieldType } from '../struct/decode'

import { createReturnForFields, endReadForField } from './decode'

import { strictNameForStruct } from '../struct/utils'
import { unionTypeName } from './union-fields'

import {
    createFieldAssignment,
    createFieldIncrementer,
    createFieldValidation,
    createReturnVariable,
    fieldWithDefault,
    incrementFieldsSet,
    throwBlockForFieldValidation,
} from './utils'

import { renderValue } from '../../apache/values'

function createArgsParameter(
    node: UnionDefinition,
    state: IRenderState,
): ts.ParameterDeclaration {
    return createFunctionParameter(
        'args', // param name
        ts.createTypeReferenceNode(
            ts.createIdentifier(unionTypeName(node.name.value, state, false)),
            undefined,
        ),
    )
}

export function createCreateMethod(
    node: UnionDefinition,
    state: IRenderState,
): ts.MethodDeclaration {
    const inputParameter: ts.ParameterDeclaration = createArgsParameter(
        node,
        state,
    )
    const returnVariable: ts.VariableStatement = createReturnVariable(
        node,
        state,
    )

    const fieldsSet: ts.VariableStatement = createFieldIncrementer()

    const fieldAssignments: Array<ts.IfStatement> = node.fields.map(
        (next: FieldDefinition) => {
            return createFieldAssignment(next, state)
        },
    )

    return ts.createMethod(
        undefined,
        undefined,
        undefined,
        COMMON_IDENTIFIERS.create,
        undefined,
        undefined,
        [inputParameter],
        ts.createTypeReferenceNode(
            ts.createIdentifier(strictNameForStruct(node, state)),
            undefined,
        ), // return type
        ts.createBlock(
            [
                fieldsSet,
                returnVariable,
                ...fieldAssignments,
                createFieldValidation(thenBlockForFieldValidation(node, state)),
                ts.createIf(
                    ts.createBinary(
                        COMMON_IDENTIFIERS._returnValue,
                        ts.SyntaxKind.ExclamationEqualsEqualsToken,
                        ts.createNull(),
                    ),
                    ts.createBlock(
                        [createReturnForFields(node, node.fields, state)],
                        true,
                    ),
                    ts.createBlock(
                        [
                            throwProtocolException(
                                'UNKNOWN',
                                'Unable to read data for TUnion',
                            ),
                        ],
                        true,
                    ),
                ),
            ],
            true,
        ),
    )
}

function thenBlockForFieldValidation(
    node: UnionDefinition,
    state: IRenderState,
): ts.Block {
    const defaultField: FieldDefinition | null = fieldWithDefault(node)

    if (defaultField !== null) {
        return ts.createBlock(
            [
                ts.createStatement(
                    ts.createAssignment(
                        COMMON_IDENTIFIERS._returnValue,
                        ts.createObjectLiteral([
                            ts.createPropertyAssignment(
                                defaultField.name.value,
                                renderValue(
                                    defaultField.fieldType,
                                    defaultField.defaultValue!,
                                    state,
                                ),
                            ),
                        ]),
                    ),
                ),
            ],
            true,
        )
    } else {
        return throwBlockForFieldValidation()
    }
}

/**
 * EXAMPLE
 *
 * case 1: {
 *   if (fieldType === Thrift.Type.I32) {
 *     this.id = input.readI32();
 *   }
 *   else {
 *     input.skip(fieldType);
 *   }
 *   break;
 * }
 */
export function createCaseForField(
    node: UnionDefinition,
    field: FieldDefinition,
    state: IRenderState,
): ts.CaseClause {
    const fieldAlias: ts.Identifier = ts.createUniqueName('value')
    const checkType: ts.IfStatement = ts.createIf(
        createEqualsCheck(
            COMMON_IDENTIFIERS.fieldType,
            thriftTypeForFieldType(field.fieldType, state),
        ),
        ts.createBlock(
            [
                incrementFieldsSet(),
                ...readValueForFieldType(field.fieldType, fieldAlias, state),
                ...endReadForField(node, fieldAlias, field, state),
            ],
            true,
        ),
        createSkipBlock(),
    )

    if (field.fieldID !== null) {
        return ts.createCaseClause(ts.createLiteral(field.fieldID.value), [
            checkType,
            ts.createBreak(),
        ])
    } else {
        throw new Error(`FieldID on line ${field.loc.start.line} is null`)
    }
}
