import * as ts from 'typescript'

import {
    ContainerType,
    FieldDefinition,
    SyntaxType,
    UnionDefinition,
} from '@creditkarma/thrift-parser'

import {
    COMMON_IDENTIFIERS,
    THRIFT_IDENTIFIERS,
    THRIFT_TYPES,
} from '../identifiers'

import { createNumberType, thriftTypeForFieldType } from '../types'

import {
    createConstStatement,
    createEqualsCheck,
    propertyAccessForIdentifier,
    throwProtocolException,
} from '../utils'

import { IRenderState } from '../../../types'

import {
    createInputParameter,
    createSkipBlock,
    readFieldBegin,
    readFieldEnd,
    readStructBegin,
    readStructEnd,
    readValueForFieldType,
} from '../struct/decode'

import { strictNameForStruct } from '../struct/utils'
import { fieldTypeAccess } from './union-fields'
import {
    createFieldIncrementer,
    createFieldValidation,
    createReturnVariable,
    incrementFieldsSet,
    throwBlockForFieldValidation,
} from './utils'

export function createDecodeMethod(
    node: UnionDefinition,
    state: IRenderState,
): ts.MethodDeclaration {
    const inputParameter: ts.ParameterDeclaration = createInputParameter()
    const returnVariable: ts.VariableStatement = createReturnVariable(
        node,
        state,
    )

    const fieldsSet: ts.VariableStatement = createFieldIncrementer()

    /**
     * cosnt ret: { fieldName: string; fieldType: Thrift.Type; fieldId: number; } = input.readFieldBegin()
     * const fieldType: Thrift.Type = ret.fieldType
     * const fieldId: number = ret.fieldId
     */
    const ret: ts.VariableStatement = createConstStatement(
        'ret',
        ts.createTypeReferenceNode(THRIFT_IDENTIFIERS.IThriftField, undefined),
        readFieldBegin(),
    )

    const fieldType: ts.VariableStatement = createConstStatement(
        COMMON_IDENTIFIERS.fieldType,
        ts.createTypeReferenceNode(THRIFT_IDENTIFIERS.Thrift_Type, undefined),
        propertyAccessForIdentifier('ret', COMMON_IDENTIFIERS.fieldType),
    )

    const fieldId: ts.VariableStatement = createConstStatement(
        COMMON_IDENTIFIERS.fieldId,
        createNumberType(),
        propertyAccessForIdentifier('ret', COMMON_IDENTIFIERS.fieldId),
    )

    /**
     * if (fieldType === Thrift.Type.STOP) {
     *     break;
     * }
     */
    const checkStop: ts.IfStatement = ts.createIf(
        createEqualsCheck(COMMON_IDENTIFIERS.fieldType, THRIFT_TYPES.STOP),
        ts.createBlock([ts.createBreak()], true),
    )

    const whileLoop: ts.WhileStatement = ts.createWhile(
        ts.createLiteral(true),
        ts.createBlock(
            [
                ret,
                fieldType,
                fieldId,
                checkStop,
                ts.createSwitch(
                    COMMON_IDENTIFIERS.fieldId, // what to switch on
                    ts.createCaseBlock([
                        ...node.fields.map((next: FieldDefinition) => {
                            return createCaseForField(node, next, state)
                        }),
                        ts.createDefaultClause([createSkipBlock()]),
                    ]),
                ),
                readFieldEnd(),
            ],
            true,
        ),
    )

    return ts.createMethod(
        undefined,
        undefined,
        undefined,
        COMMON_IDENTIFIERS.decode,
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
                readStructBegin(),
                whileLoop,
                readStructEnd(),
                createFieldValidation(throwBlockForFieldValidation()),
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

function createUnionObjectForField(
    node: UnionDefinition,
    field: FieldDefinition,
    state: IRenderState,
): ts.ObjectLiteralExpression {
    if (state.options.withNameField) {
        return ts.createObjectLiteral(
            [
                ts.createPropertyAssignment(
                    COMMON_IDENTIFIERS.__name,
                    ts.createLiteral(node.name.value),
                ),
                ts.createPropertyAssignment(
                    COMMON_IDENTIFIERS.__type,
                    ts.createIdentifier(fieldTypeAccess(node, field, state)),
                ),
                ts.createPropertyAssignment(
                    ts.createIdentifier(field.name.value),
                    ts.createPropertyAccess(
                        COMMON_IDENTIFIERS._returnValue,
                        field.name.value,
                    ),
                ),
            ],
            true,
        )
    } else {
        return ts.createObjectLiteral(
            [
                ts.createPropertyAssignment(
                    COMMON_IDENTIFIERS.__type,
                    ts.createIdentifier(fieldTypeAccess(node, field, state)),
                ),
                ts.createPropertyAssignment(
                    ts.createIdentifier(field.name.value),
                    ts.createPropertyAccess(
                        COMMON_IDENTIFIERS._returnValue,
                        field.name.value,
                    ),
                ),
            ],
            true,
        )
    }
}

export function createReturnForFields(
    node: UnionDefinition,
    fields: Array<FieldDefinition>,
    state: IRenderState,
): ts.Statement {
    if (state.options.strictUnions) {
        const [head, ...tail] = fields
        if (tail.length > 0) {
            return ts.createIf(
                ts.createBinary(
                    ts.createPropertyAccess(
                        COMMON_IDENTIFIERS._returnValue,
                        head.name.value,
                    ),
                    ts.SyntaxKind.ExclamationEqualsEqualsToken,
                    COMMON_IDENTIFIERS.undefined,
                ),
                ts.createBlock(
                    [
                        ts.createReturn(
                            createUnionObjectForField(node, head, state),
                        ),
                    ],
                    true,
                ),
                ts.createBlock([createReturnForFields(node, tail, state)]),
            )
        } else {
            return ts.createReturn(createUnionObjectForField(node, head, state))
        }
    } else {
        return ts.createReturn(COMMON_IDENTIFIERS._returnValue)
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

export function endReadForField(
    node: UnionDefinition,
    fieldName: ts.Identifier,
    field: FieldDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    switch (field.fieldType.type) {
        case SyntaxType.VoidKeyword:
            if (state.options.withNameField) {
                return [
                    ts.createStatement(
                        ts.createAssignment(
                            COMMON_IDENTIFIERS._returnValue,
                            ts.createObjectLiteral([
                                ts.createPropertyAssignment(
                                    COMMON_IDENTIFIERS.__name,
                                    ts.createLiteral(node.name.value),
                                ),
                            ]),
                        ),
                    ),
                ]
            } else {
                return []
            }

        default:
            if (state.options.withNameField) {
                return [
                    ts.createStatement(
                        ts.createAssignment(
                            COMMON_IDENTIFIERS._returnValue,
                            ts.createObjectLiteral([
                                ts.createPropertyAssignment(
                                    COMMON_IDENTIFIERS.__name,
                                    ts.createLiteral(node.name.value),
                                ),
                                ts.createPropertyAssignment(
                                    field.name.value,
                                    fieldName,
                                ),
                            ]),
                        ),
                    ),
                ]
            } else {
                return [
                    ts.createStatement(
                        ts.createAssignment(
                            COMMON_IDENTIFIERS._returnValue,
                            ts.createObjectLiteral([
                                ts.createPropertyAssignment(
                                    field.name.value,
                                    fieldName,
                                ),
                            ]),
                        ),
                    ),
                ]
            }
    }
}

export function metadataTypeForFieldType(
    fieldType: ContainerType,
): ts.TypeNode {
    switch (fieldType.type) {
        case SyntaxType.MapType:
            return ts.createTypeReferenceNode(
                THRIFT_IDENTIFIERS.IThriftMap,
                undefined,
            )

        case SyntaxType.SetType:
            return ts.createTypeReferenceNode(
                THRIFT_IDENTIFIERS.IThriftSet,
                undefined,
            )

        case SyntaxType.ListType:
            return ts.createTypeReferenceNode(
                THRIFT_IDENTIFIERS.IThriftList,
                undefined,
            )

        default:
            const msg: never = fieldType
            throw new Error(`Non-exhaustive match for: ${msg}`)
    }
}
