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

import {
    createFieldIncrementer,
    createFieldValidation,
    incrementFieldsSet,
} from './utils'

import ResolverFile from '../../../resolver/file'
import { looseNameForStruct, throwForField } from '../struct/utils'

export function createEncodeMethod(
    node: UnionDefinition,
    file: ResolverFile,
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
                    ts.createIdentifier(looseNameForStruct(node, file)),
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
                ...createTempVariables(node, file),
                writeStructBegin(node.name.value),
                ...node.fields.filter(isNotVoid).map((field) => {
                    return createWriteForField(node, field, file)
                }),
                writeFieldStop(),
                writeStructEnd(),
                createFieldValidation(node),
                ts.createReturn(),
            ],
            true,
        ),
    )
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
    file: ResolverFile,
): ts.IfStatement {
    const isFieldNull: ts.BinaryExpression = createNotNullCheck(
        `obj.${field.name.value}`,
    )
    const thenWrite: ts.Statement = createWriteForFieldType(
        node,
        field,
        ts.createIdentifier(`obj.${field.name.value}`),
        file,
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
    file: ResolverFile,
): ts.Block {
    return ts.createBlock(
        [
            incrementFieldsSet(),
            writeFieldBegin(field, file),
            ...writeValueForField(node, field.fieldType, fieldName, file),
            writeFieldEnd(),
        ],
        true,
    )
}
