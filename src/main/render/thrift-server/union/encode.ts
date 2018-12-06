import * as ts from 'typescript'

import {
    ContainerType,
    FieldDefinition,
    FunctionType,
    SyntaxType,
    UnionDefinition,
} from '@creditkarma/thrift-parser'

import {
    COMMON_IDENTIFIERS,
    THRIFT_IDENTIFIERS,
} from '../identifiers'

import {
    WRITE_METHODS,
    WriteMethodName,
} from '../struct/methods'

import {
    createTempVariables,
    writeFieldBegin,
    writeFieldEnd,
    writeFieldStop,
    writeListBegin,
    writeListEnd,
    writeMapBegin,
    writeMapEnd,
    writeSetBegin,
    writeSetEnd,
    writeStructBegin,
    writeStructEnd,
    writeValueForIdentifier,
} from '../struct/encode'

import {
    createFunctionParameter,
    createMethodCall,
    createNotNullCheck,
    isNotVoid,
} from '../utils'

import {
    createVoidType,
    typeNodeForFieldType,
} from '../types'

import {
    IRenderState,
} from '../../../types'

import {
    createFieldIncrementer,
    createFieldValidation,
    incrementFieldsSet,
} from './utils'

import {
    looseNameForStruct,
    throwForField,
} from '../struct/utils'

export function createEncodeMethod(node: UnionDefinition, state: IRenderState): ts.MethodDeclaration {
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
                    ts.createIdentifier(looseNameForStruct(node)),
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
        ts.createBlock([
            createFieldIncrementer(),
            ...createTempVariables(node, state),
            writeStructBegin(node.name.value),
            ...node.fields.filter(isNotVoid).map((field) => {
                return createWriteForField(node, field, state)
            }),
            writeFieldStop(),
            writeStructEnd(),
            createFieldValidation(node),
            ts.createReturn(),
        ], true),
    )
}

/**
 * Write field to output protocol.
 *
 * If field is required, but not set, throw error.
 *
 * If field is optional and has a default value write the default if value not set.
 */
export function createWriteForField(node: UnionDefinition, field: FieldDefinition, state: IRenderState): ts.IfStatement {
    const isFieldNull: ts.BinaryExpression = createNotNullCheck(`obj.${field.name.value}`)
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
        (elseThrow === undefined) ? undefined : ts.createBlock([elseThrow], true),
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
    return ts.createBlock([
        incrementFieldsSet(),
        writeFieldBegin(field, state),
        ...writeValueForField(node, field.fieldType, fieldName, state),
        writeFieldEnd(),
    ], true)
}

export function writeValueForType(
    node: UnionDefinition,
    fieldType: FunctionType,
    fieldName: ts.Identifier,
    state: IRenderState,
): Array<ts.Expression> {
    switch (fieldType.type) {
        case SyntaxType.Identifier:
            return writeValueForIdentifier(
                state.identifiers[fieldType.value],
                node,
                fieldType,
                fieldName,
                state,
            )

        /**
         * Container types:
         *
         * SetType | MapType | ListType
         */
        case SyntaxType.SetType:
            return  [
                writeSetBegin(fieldType, fieldName, state),
                forEach(node, fieldType, fieldName, state),
                writeSetEnd(),
            ]

        case SyntaxType.MapType:
            return [
                writeMapBegin(fieldType, fieldName, state),
                forEach(node, fieldType, fieldName, state),
                writeMapEnd(),
            ]

        case SyntaxType.ListType:
            return  [
                writeListBegin(fieldType, fieldName, state),
                forEach(node, fieldType, fieldName, state),
                writeListEnd(),
            ]

        /**
         * Base types:
         *
         * SyntaxType.StringKeyword | SyntaxType.DoubleKeyword | SyntaxType.BoolKeyword |
         * SyntaxType.I8Keyword | SyntaxType.I16Keyword | SyntaxType.I32Keyword |
         * SyntaxType.I64Keyword | SyntaxType.BinaryKeyword | SyntaxType.ByteKeyword
         */
        case SyntaxType.BoolKeyword:
        case SyntaxType.BinaryKeyword:
        case SyntaxType.StringKeyword:
        case SyntaxType.DoubleKeyword:
        case SyntaxType.I8Keyword:
        case SyntaxType.ByteKeyword:
        case SyntaxType.I16Keyword:
        case SyntaxType.I32Keyword:
        case SyntaxType.I64Keyword:
            return [ writeMethodForName(WRITE_METHODS[fieldType.type], fieldName) ]

        case SyntaxType.VoidKeyword:
            return []

        default:
            const msg: never = fieldType
            throw new Error(`Non-exhaustive match for: ${msg}`)
    }
}

function writeMethodForName(methodName: WriteMethodName, fieldName: ts.Identifier): ts.CallExpression {
    return createMethodCall('output', methodName, [ fieldName ])
}

function writeValueForField(
    node: UnionDefinition,
    fieldType: FunctionType,
    fieldName: ts.Identifier,
    state: IRenderState,
): Array<ts.ExpressionStatement> {
    return writeValueForType(node, fieldType, fieldName, state).map(ts.createStatement)
}

/**
 * Loop through container types and write the values for all children
 *
 * EXAMPLE FOR SET
 *
 * // thrift
 * struct MyStruct {
 *   1: required set<string> field1;
 * }
 *
 * // typescript
 * obj.field1.forEach((value_1: string): void => {
 *   output.writeString(value_1);
 * });
 */
function forEach(
    node: UnionDefinition,
    fieldType: ContainerType,
    fieldName: ts.Identifier,
    state: IRenderState,
): ts.CallExpression {
    const value: ts.Identifier = ts.createUniqueName('value')
    const forEachParameters: Array<ts.ParameterDeclaration> = [
        createFunctionParameter(
            value,
            typeNodeForFieldType(fieldType.valueType, state),
        ),
    ]

    const forEachStatements: Array<ts.Statement> = [
        ...writeValueForField(node, fieldType.valueType, value, state),
    ]

    // If map we have to handle key type as well as value type
    if (fieldType.type === SyntaxType.MapType) {
        const key: ts.Identifier = ts.createUniqueName('key')
        forEachParameters.push(createFunctionParameter(
            key,
            typeNodeForFieldType(fieldType.keyType, state),
        ))

        forEachStatements.unshift(...writeValueForField(node, fieldType.keyType, key, state))
    }

    return createMethodCall(fieldName, 'forEach', [
        ts.createArrowFunction(
            undefined, // modifiers
            undefined, // type parameters
            forEachParameters, // parameters
            createVoidType(), // return type,
            ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken), // greater than equals token
            ts.createBlock(forEachStatements, true), // body
        ),
    ])
}
