import * as ts from 'typescript'

import { FieldDefinition, UnionDefinition } from '@creditkarma/thrift-parser'

import { COMMON_IDENTIFIERS, THRIFT_IDENTIFIERS } from '../identifiers'

import {
    createTempVariables,
    writeFieldBegin,
    writeFieldEnd,
    writeFieldStop,
    writeStructBegin,
    writeStructEnd,
    writeValueForField,
} from '../struct/encode'

import {
    createFunctionParameter,
    createNotNullCheck,
    isNotVoid,
} from '../utils'

import { createVoidType } from '../types'

import { IRenderState } from '../../../types'

import {
    createFieldIncrementer,
    createFieldValidation,
    fieldWithDefault,
    incrementFieldsSet,
    throwBlockForFieldValidation,
} from './utils'

import { renderValue } from '../initializers'
import { looseNameForStruct, throwForField } from '../struct/utils'

export function createEncodeMethod(
    node: UnionDefinition,
    state: IRenderState,
): ts.MethodDeclaration {
    return ts.createMethod(
        undefined,
        undefined,
        undefined,
        COMMON_IDENTIFIERS.encode,
        undefined,
        undefined,
        [
            createFunctionParameter(
                COMMON_IDENTIFIERS.args,
                ts.createTypeReferenceNode(
                    ts.createIdentifier(looseNameForStruct(node, state)),
                    undefined,
                ),
            ),
            createFunctionParameter(
                COMMON_IDENTIFIERS.output,
                ts.createTypeReferenceNode(
                    THRIFT_IDENTIFIERS.TProtocol,
                    undefined,
                ),
            ),
        ],
        createVoidType(),
        ts.createBlock(
            [
                createFieldIncrementer(),
                ...createTempVariables(node, state, false),
                ...checkDefaults(node, state),
                writeStructBegin(node.name.value),
                ...node.fields.filter(isNotVoid).map((field) => {
                    return createWriteForField(node, field, state)
                }),
                writeFieldStop(),
                writeStructEnd(),
                createFieldValidation(throwBlockForFieldValidation()),
                ts.createReturn(),
            ],
            true,
        ),
    )
}

function nullCheckForFields(
    fields: Array<FieldDefinition>,
): ts.BinaryExpression {
    if (fields.length > 1) {
        const [field, ...remaining] = fields
        return ts.createBinary(
            ts.createBinary(
                ts.createPropertyAccess(
                    COMMON_IDENTIFIERS.obj,
                    ts.createIdentifier(field.name.value),
                ),
                ts.SyntaxKind.EqualsEqualsToken,
                ts.createNull(),
            ),
            ts.SyntaxKind.AmpersandAmpersandToken,
            nullCheckForFields(remaining),
        )
    } else {
        return ts.createBinary(
            ts.createPropertyAccess(
                COMMON_IDENTIFIERS.obj,
                ts.createIdentifier(fields[0].name.value),
            ),
            ts.SyntaxKind.EqualsEqualsToken,
            ts.createNull(),
        )
    }
}

function checkDefaults(
    node: UnionDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    const defaultField: FieldDefinition | null = fieldWithDefault(node)
    if (defaultField !== null) {
        return [
            ts.createIf(
                nullCheckForFields(node.fields),
                ts.createBlock(
                    [
                        ts.createStatement(
                            ts.createAssignment(
                                COMMON_IDENTIFIERS.obj,
                                ts.createObjectLiteral([
                                    ts.createPropertyAssignment(
                                        ts.createIdentifier(
                                            defaultField.name.value,
                                        ),
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
                ),
            ),
        ]
    } else {
        return []
    }
}

/**
 * Write field to output protocol.
 *
 * If field is required, but not set, throw error.
 *
 * If field is optional and has a default value write the default if value not set.
 */
export function createWriteForField(
    node: UnionDefinition,
    field: FieldDefinition,
    state: IRenderState,
): ts.IfStatement {
    const isFieldNull: ts.BinaryExpression = createNotNullCheck(
        `obj.${field.name.value}`,
    )
    const thenWrite: ts.Statement = createWriteForFieldType(
        node,
        field,
        ts.createIdentifier(`obj.${field.name.value}`),
        state,
    )
    const elseThrow: ts.Statement | undefined = throwForField(field)

    return ts.createIf(
        isFieldNull,
        thenWrite, // Then block
        elseThrow === undefined ? undefined : ts.createBlock([elseThrow], true),
    )
}

/**
 * This generates the method calls to write for a single field
 *
 * EXAMPLE
 *
 * _fieldsSet++;
 * output.writeFieldBegin("id", Thrift.Type.I32, 1);
 * output.writeI32(obj.id);
 * output.writeFieldEnd();
 */
export function createWriteForFieldType(
    node: UnionDefinition,
    field: FieldDefinition,
    fieldName: ts.Identifier,
    state: IRenderState,
): ts.Block {
    return ts.createBlock(
        [
            incrementFieldsSet(),
            writeFieldBegin(field, state),
            ...writeValueForField(node, field.fieldType, fieldName, state),
            writeFieldEnd(),
        ],
        true,
    )
}
