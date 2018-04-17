import * as ts from 'typescript'

import {
    InterfaceWithFields,
    FieldDefinition,
    UnionDefinition,
    SyntaxType,
    ContainerType,
} from '@creditkarma/thrift-parser'

import {
    THRIFT_IDENTIFIERS,
    THRIFT_TYPES,
    COMMON_IDENTIFIERS,
} from '../identifiers'

import {
    createNumberType,
    thriftTypeForFieldType,
} from '../types'

import {
    createLetStatement,
    createConstStatement,
    propertyAccessForIdentifier,
    createEqualsCheck,
    hasRequiredField,
    getInitializerForField,
    throwProtocolException,
} from '../utils'

import {
    IIdentifierMap
} from '../../../types'

import {
    createCheckForFields,
    readFieldBegin,
    createInputParameter,
    createSkipBlock,
    readFieldEnd,
    readStructBegin,
    readStructEnd,
    readValueForFieldType,
} from '../struct/decode'

import {
    RETURN_NAME,
    createFieldIncrementer,
    incrementFieldsSet,
    createFieldValidation,
} from './utils'

export function createDecodeMethod(union: UnionDefinition, identifiers: IIdentifierMap): ts.MethodDeclaration {
    const inputParameter: ts.ParameterDeclaration = createInputParameter()
    const returnVariable: ts.VariableStatement = createLetStatement(
        ts.createIdentifier(RETURN_NAME),
        ts.createUnionTypeNode([
            ts.createTypeReferenceNode(
                ts.createIdentifier(union.name.value),
                undefined,
            ),
            ts.createNull(),
        ]),
        ts.createNull()
    )

    const fieldsSet: ts.VariableStatement = createFieldIncrementer()

    /**
     * cosnt ret: { fieldName: string; fieldType: Thrift.Type; fieldId: number; } = input.readFieldBegin()
     * const fieldType: Thrift.Type = ret.fieldType
     * const fieldId: number = ret.fieldId
     */
    const ret: ts.VariableStatement = createConstStatement(
        'ret',
        ts.createTypeReferenceNode(
            THRIFT_IDENTIFIERS.IThriftField,
            undefined
        ),
        readFieldBegin()
    )

    const fieldType: ts.VariableStatement = createConstStatement(
        'fieldType',
        ts.createTypeReferenceNode(THRIFT_IDENTIFIERS.Thrift_Type, undefined),
        propertyAccessForIdentifier('ret', 'fieldType')
    )

    const fieldId: ts.VariableStatement = createConstStatement(
        'fieldId',
        createNumberType(),
        propertyAccessForIdentifier('ret', 'fieldId')
    )

    /**
     * if (fieldType === Thrift.Type.STOP) {
     *     break;
     * }
     */
    const checkStop: ts.IfStatement = ts.createIf(
        createEqualsCheck(
            COMMON_IDENTIFIERS.fieldType,
            THRIFT_TYPES.STOP
        ),
        ts.createBlock([
            ts.createBreak()
        ], true)
    )

    const whileLoop: ts.WhileStatement = ts.createWhile(
        ts.createLiteral(true),
        ts.createBlock([
            ret,
            fieldType,
            fieldId,
            checkStop,
            ts.createSwitch(
                COMMON_IDENTIFIERS.fieldId, // what to switch on
                ts.createCaseBlock([
                    ...union.fields.map((next: FieldDefinition) => {
                        return createCaseForField(union, next, identifiers)
                    }),
                    ts.createDefaultClause([
                        createSkipBlock()
                    ])
                ])
            ),
            readFieldEnd(),
        ], true)
    )

    return ts.createMethod(
        undefined,
        undefined,
        undefined,
        ts.createIdentifier('decode'),
        undefined,
        undefined,
        [ inputParameter ],
        ts.createTypeReferenceNode(
            ts.createIdentifier(union.name.value),
            undefined,
        ), // return type
        ts.createBlock([
            fieldsSet,
            returnVariable,
            readStructBegin(),
            whileLoop,
            readStructEnd(),
            createFieldValidation(union),
            ts.createIf(
                ts.createBinary(
                    ts.createIdentifier(RETURN_NAME),
                    ts.SyntaxKind.ExclamationEqualsEqualsToken,
                    ts.createNull()
                ),
                ts.createBlock([
                    ts.createReturn(
                        ts.createIdentifier(RETURN_NAME)
                    ),
                ], true),
                ts.createBlock([
                    throwProtocolException(
                        'UNKNOWN',
                        'Unable to read data for TUnion',
                    ),
                ], true)
            )
        ], true),
    )
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
export function createCaseForField(node: UnionDefinition, field: FieldDefinition, identifiers: IIdentifierMap): ts.CaseClause {
    const fieldAlias: ts.Identifier = ts.createUniqueName('value')
    const checkType: ts.IfStatement = ts.createIf(
        createEqualsCheck(
            COMMON_IDENTIFIERS.fieldType,
            thriftTypeForFieldType(field.fieldType, identifiers)
        ),
        ts.createBlock([
            incrementFieldsSet(),
            ...readValueForFieldType(
                field.fieldType,
                fieldAlias,
                identifiers
            ),
            ...endReadForField(node, fieldAlias, field)
        ], true),
        createSkipBlock()
    )

    if (field.fieldID !== null) {
        return ts.createCaseClause(
            ts.createLiteral(field.fieldID.value),
            [
                checkType,
                ts.createBreak()
            ]
        )
    } else {
        throw new Error(`FieldID on line ${field.loc.start.line} is null`)
    }
}

export function endReadForField(node: UnionDefinition, fieldName: ts.Identifier, field: FieldDefinition): Array<ts.Statement> {
    switch (field.fieldType.type) {
        case SyntaxType.VoidKeyword:
            return []

        default:
            return [
                ts.createStatement(
                    ts.createAssignment(
                        ts.createIdentifier(RETURN_NAME),
                        ts.createObjectLiteral([
                            ts.createPropertyAssignment(
                                field.name.value,
                                fieldName,
                            )
                        ])
                    )
                )
            ]
    }
}

export function metadataTypeForFieldType(fieldType: ContainerType): ts.TypeNode {
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

export function createReturnForStruct(struct: InterfaceWithFields): ts.Statement {
    if (hasRequiredField(struct)) {
        return ts.createIf(
            createCheckForFields(struct.fields),
            ts.createBlock([
                ts.createReturn(
                    ts.createObjectLiteral(
                        struct.fields.map((next: FieldDefinition): ts.ObjectLiteralElementLike => {
                            return ts.createPropertyAssignment(
                                next.name.value,
                                getInitializerForField('_args', next),
                            )
                        }),
                        true // multiline
                    )
                )
            ], true),
            ts.createBlock([
                throwProtocolException(
                    'UNKNOWN',
                    `Unable to read ${struct.name.value} from input`
                )
            ], true)
        )
    } else {
        return ts.createReturn(
            ts.createNew(
                ts.createIdentifier(struct.name.value),
                undefined,
                [ ts.createIdentifier('_args') ]
            )
        )
    }
}
