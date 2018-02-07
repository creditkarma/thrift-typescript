import * as ts from 'typescript'

import {
    SyntaxType,
    FieldDefinition,
    FunctionType,
    ContainerType,
    UnionDefinition,
} from '@creditkarma/thrift-parser'

import {
    COMMON_IDENTIFIERS,
} from '../../shared/identifiers'

import {
    THRIFT_IDENTIFIERS,
} from '../identifiers'

import {
    isNotVoid,
} from '../utils'

import {
    WRITE_METHODS,
    WriteMethodName,
} from '../struct/methods'

import {
    throwForField,
    writeFieldBegin,
    writeFieldEnd,
    writeSetBegin,
    writeSetEnd,
    writeMapBegin,
    writeMapEnd,
    writeListBegin,
    writeListEnd,
    writeStructBegin,
    writeStructEnd,
    writeFieldStop,
    createTempVariables,
    writeValueForIdentifier,
} from '../struct/encode'

import {
    createFunctionParameter,
    createNotNullCheck,
    createMethodCall,
} from '../../shared/utils'

import {
    createVoidType,
    typeNodeForFieldType,
} from '../../shared/types'

import {
    IIdentifierMap,
} from '../../../types'

import {
    createFieldIncrementer,
    createFieldValidation,
    incrementFieldsSet,
} from './utils'

export function createEncodeMethod(union: UnionDefinition, identifiers: IIdentifierMap): ts.MethodDeclaration {
    return ts.createMethod(
        undefined,
        undefined,
        undefined,
        ts.createIdentifier('encode'),
        undefined,
        undefined,
        [
            createFunctionParameter(
                COMMON_IDENTIFIERS.val,
                ts.createTypeReferenceNode(
                    ts.createIdentifier(union.name.value),
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
            ...createTempVariables(union),
            writeStructBegin(union.name.value),
            ...union.fields.filter(isNotVoid).map((field) => {
                return createWriteForField(union, field, identifiers)
            }),
            writeFieldStop(),
            writeStructEnd(),
            createFieldValidation(union),
            ts.createReturn()
        ], true)
    )
}

/**
 * Write field to output protocol.
 *
 * If field is required, but not set, throw error.
 *
 * If field is optional and has a default value write the default if value not set.
 */
export function createWriteForField(union: UnionDefinition, field: FieldDefinition, identifiers: IIdentifierMap): ts.IfStatement {
    const isFieldNull: ts.BinaryExpression = createNotNullCheck(`obj.${field.name.value}`)
    const thenWrite: ts.Statement = createWriteForFieldType(
        union,
        field,
        ts.createIdentifier(`obj.${field.name.value}`),
        identifiers
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
    union: UnionDefinition,
    field: FieldDefinition,
    fieldName: ts.Identifier,
    identifiers: IIdentifierMap
): ts.Block {
    return ts.createBlock([
        incrementFieldsSet(),
        writeFieldBegin(field, identifiers),
        ...writeValueForField(union, field.fieldType, fieldName, identifiers),
        writeFieldEnd()
    ], true)
}

export function writeValueForType(
    union: UnionDefinition,
    fieldType: FunctionType,
    fieldName: ts.Identifier,
    identifiers: IIdentifierMap
): Array<ts.Expression> {
    switch (fieldType.type) {
        case SyntaxType.Identifier:
            return writeValueForIdentifier(
                identifiers[fieldType.value],
                union,
                fieldType,
                fieldName,
                identifiers
            )

        /**
         * Container types:
         *
         * SetType | MapType | ListType
         */
        case SyntaxType.SetType:
            return  [
                writeSetBegin(fieldType, fieldName, identifiers),
                forEach(union, fieldType, fieldName, identifiers),
                writeSetEnd()
            ]

        case SyntaxType.MapType:
            return [
                writeMapBegin(fieldType, fieldName, identifiers),
                forEach(union, fieldType, fieldName, identifiers),
                writeMapEnd()
            ]

        case SyntaxType.ListType:
            return  [
                writeListBegin(fieldType, fieldName, identifiers),
                forEach(union, fieldType, fieldName, identifiers),
                writeListEnd()
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
    union: UnionDefinition,
    fieldType: FunctionType,
    fieldName: ts.Identifier,
    identifiers: IIdentifierMap
): Array<ts.ExpressionStatement> {
    return writeValueForType(union, fieldType, fieldName, identifiers).map(ts.createStatement)
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
 *
 * @param struct
 * @param fieldType
 * @param fieldName
 */
function forEach(
    union: UnionDefinition,
    fieldType: ContainerType,
    fieldName: ts.Identifier,
    identifiers: IIdentifierMap
): ts.CallExpression {
    const value: ts.Identifier = ts.createUniqueName('value')
    const forEachParameters: Array<ts.ParameterDeclaration> = [
        createFunctionParameter(
            value,
            typeNodeForFieldType(fieldType.valueType)
        )
    ]

    const forEachStatements: Array<ts.Statement> = [
        ...writeValueForField(union, fieldType.valueType, value, identifiers)
    ]

    // If map we have to handle key type as well as value type
    if (fieldType.type === SyntaxType.MapType) {
        const key: ts.Identifier = ts.createUniqueName('key')
        forEachParameters.push(createFunctionParameter(
            key,
            typeNodeForFieldType(fieldType.keyType)
        ))

        forEachStatements.unshift(...writeValueForField(union, fieldType.keyType, key, identifiers))
    }

    return createMethodCall(fieldName, 'forEach', [
        ts.createArrowFunction(
            undefined, // modifiers
            undefined, // type parameters
            forEachParameters, // parameters
            createVoidType(), // return type,
            ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken), // greater than equals token
            ts.createBlock(forEachStatements, true) // body
        )
    ])
}
