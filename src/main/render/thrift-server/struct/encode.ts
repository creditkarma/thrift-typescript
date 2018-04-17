import * as ts from 'typescript'

import {
    InterfaceWithFields,
    SyntaxType,
    FieldDefinition,
    FunctionType,
    ContainerType,
    MapType,
    ListType,
    SetType,
} from '@creditkarma/thrift-parser'

import {
    COMMON_IDENTIFIERS,
    THRIFT_IDENTIFIERS,
} from '../identifiers'

import {
    WRITE_METHODS,
    WriteMethodName,
} from './methods'

import {
    isNotVoid,
    createFunctionParameter,
    createNotNullCheck,
    createMethodCall,
    createConstStatement,
    createMethodCallStatement,
    propertyAccessForIdentifier,
    getInitializerForField,
    throwProtocolException,
} from '../utils'

import {
    createVoidType,
    thriftTypeForFieldType,
    typeNodeForFieldType,
} from '../types'

import {
    IIdentifierMap,
    IResolvedIdentifier,
} from '../../../types'

export function createTempVariables(struct: InterfaceWithFields, identifiers: IIdentifierMap): Array<ts.VariableStatement> {
    const structFields: Array<FieldDefinition> = struct.fields.filter((next: FieldDefinition): boolean => {
        return next.fieldType.type !== SyntaxType.VoidKeyword
    })

    if (structFields.length > 0) {
        return [ createConstStatement(
            COMMON_IDENTIFIERS.obj,
            undefined,
            ts.createObjectLiteral(
                struct.fields.map((next: FieldDefinition): ts.ObjectLiteralElementLike => {
                    return ts.createPropertyAssignment(
                        next.name.value,
                        getInitializerForField('val', next, true),
                    )
                }),
                true // multiline
            )
        ) ]
    } else {
        return []
    }
}

export function createEncodeMethod(struct: InterfaceWithFields, identifiers: IIdentifierMap): ts.MethodDeclaration {
    const tempVariables: Array<ts.VariableStatement> = createTempVariables(struct, identifiers)

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
                    ts.createIdentifier(`${struct.name.value}_Loose`),
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
            ...tempVariables,
            writeStructBegin(struct.name.value),
            ...struct.fields.filter(isNotVoid).map((field) => {
                return createWriteForField(struct, field, identifiers)
            }),
            writeFieldStop(),
            writeStructEnd(),
            ts.createReturn(),
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
export function createWriteForField(struct: InterfaceWithFields, field: FieldDefinition, identifiers: IIdentifierMap): ts.IfStatement {
    const isFieldNull: ts.BinaryExpression = createNotNullCheck(`obj.${field.name.value}`)
    const thenWrite: ts.Statement = createWriteForFieldType(
        struct,
        field,
        ts.createIdentifier(`obj.${field.name.value}`),
        identifiers,
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
 * output.writeFieldBegin("id", Thrift.Type.I32, 1);
 * output.writeI32(obj.id);
 * output.writeFieldEnd();
 */
export function createWriteForFieldType(
    struct: InterfaceWithFields,
    field: FieldDefinition,
    fieldName: ts.Identifier,
    identifiers: IIdentifierMap,
): ts.Block {
    return ts.createBlock([
        writeFieldBegin(field, identifiers),
        ...writeValueForField(struct, field.fieldType, fieldName, identifiers),
        writeFieldEnd()
    ])
}

export function writeValueForIdentifier(
    id: IResolvedIdentifier,
    struct: InterfaceWithFields,
    fieldType: FunctionType,
    fieldName: ts.Identifier,
    identifiers: IIdentifierMap,
): Array<ts.Expression> {
    switch (id.definition.type) {
        case SyntaxType.ConstDefinition:
            throw new TypeError(`Identifier[${id.definition.name.value}] is a value being used as a type`)

        case SyntaxType.ServiceDefinition:
            throw new TypeError(`Service[${id.definition.name.value}] is being used as a type`)

        case SyntaxType.StructDefinition:
        case SyntaxType.UnionDefinition:
        case SyntaxType.ExceptionDefinition:
            return [
                createMethodCall(
                    ts.createIdentifier(`${id.resolvedName}Codec`),
                    'encode',
                    [ fieldName, COMMON_IDENTIFIERS.output ],
                )
            ]

        case SyntaxType.EnumDefinition:
            return [ writeMethodForName(WRITE_METHODS[SyntaxType.I32Keyword], fieldName) ]

        case SyntaxType.TypedefDefinition:
            return writeValueForType(
                struct,
                id.definition.definitionType,
                fieldName,
                identifiers,
            )

        default:
            const msg: never = id.definition
            throw new Error(`Non-exhaustive match for: ${msg}`)
    }
}

export function writeValueForType(
    struct: InterfaceWithFields,
    fieldType: FunctionType,
    fieldName: ts.Identifier,
    identifiers: IIdentifierMap
): Array<ts.Expression> {
    switch (fieldType.type) {
        case SyntaxType.Identifier:
            return writeValueForIdentifier(
                identifiers[fieldType.value],
                struct,
                fieldType,
                fieldName,
                identifiers,
            )

        /**
         * Container types:
         *
         * SetType | MapType | ListType
         */
        case SyntaxType.SetType:
            return  [
                writeSetBegin(fieldType, fieldName, identifiers),
                forEach(struct, fieldType, fieldName, identifiers),
                writeSetEnd(),
            ]

        case SyntaxType.MapType:
            return [
                writeMapBegin(fieldType, fieldName, identifiers),
                forEach(struct, fieldType, fieldName, identifiers),
                writeMapEnd(),
            ]

        case SyntaxType.ListType:
            return  [
                writeListBegin(fieldType, fieldName, identifiers),
                forEach(struct, fieldType, fieldName, identifiers),
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
    struct: InterfaceWithFields,
    fieldType: FunctionType,
    fieldName: ts.Identifier,
    identifiers: IIdentifierMap,
): Array<ts.ExpressionStatement> {
    return writeValueForType(struct, fieldType, fieldName, identifiers).map(ts.createStatement)
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
    struct: InterfaceWithFields,
    fieldType: ContainerType,
    fieldName: ts.Identifier,
    identifiers: IIdentifierMap
): ts.CallExpression {
    const value: ts.Identifier = ts.createUniqueName('value')
    const forEachParameters: Array<ts.ParameterDeclaration> = [
        createFunctionParameter(
            value,
            typeNodeForFieldType(fieldType.valueType, identifiers, true)
        )
    ]

    const forEachStatements: Array<ts.Statement> = [
        ...writeValueForField(struct, fieldType.valueType, value, identifiers)
    ]

    // If map we have to handle key type as well as value type
    if (fieldType.type === SyntaxType.MapType) {
        const key: ts.Identifier = ts.createUniqueName('key')
        forEachParameters.push(createFunctionParameter(
            key,
            typeNodeForFieldType(fieldType.keyType, identifiers, true)
        ))

        forEachStatements.unshift(...writeValueForField(struct, fieldType.keyType, key, identifiers))
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

/**
 * Create the Error for a missing required field
 *
 * EXAMPLE
 *
 * throw new thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, 'Required field {{fieldName}} is unset!')
 */
export function throwForField(field: FieldDefinition): ts.ThrowStatement | undefined {
    if (field.requiredness === 'required') {
        return throwProtocolException(
            'UNKNOWN',
            `Required field[${field.name.value}] is unset!`
        )
    } else {
        return undefined
    }
}

// output.writeStructBegin(<structName>)
export function writeStructBegin(structName: string): ts.ExpressionStatement {
    return createMethodCallStatement('output', 'writeStructBegin', [
        ts.createLiteral(structName)
    ])
}

// output.writeStructEnd()
export function writeStructEnd(): ts.ExpressionStatement {
    return createMethodCallStatement('output', 'writeStructEnd')
}

// output.writeMapBeing(<field.keyType>, <field.valueType>, <field.size>)
export function writeMapBegin(
    fieldType: MapType,
    fieldName: string | ts.Identifier,
    identifiers: IIdentifierMap
): ts.CallExpression {
    return createMethodCall('output', 'writeMapBegin', [
        thriftTypeForFieldType(fieldType.keyType, identifiers),
        thriftTypeForFieldType(fieldType.valueType, identifiers),
        propertyAccessForIdentifier(fieldName, 'size')
    ])
}

// output.writeMapEnd()
export function writeMapEnd(): ts.CallExpression {
    return createMethodCall('output', 'writeMapEnd')
}

// output.writeListBegin(<field.type>, <field.length>)
export function writeListBegin(
    fieldType: ListType,
    fieldName: string | ts.Identifier,
    identifiers: IIdentifierMap
): ts.CallExpression {
    return createMethodCall('output', 'writeListBegin', [
        thriftTypeForFieldType(fieldType.valueType, identifiers),
        propertyAccessForIdentifier(fieldName, 'length')
    ])
}

// output.writeListEnd()
export function writeListEnd(): ts.CallExpression {
    return createMethodCall('output', 'writeListEnd')
}

// output.writeSetBegin(<field.type>, <field.size>)
export function writeSetBegin(
    fieldType: SetType,
    fieldName: string | ts.Identifier,
    identifiers: IIdentifierMap
): ts.CallExpression {
    return createMethodCall('output', 'writeSetBegin', [
        thriftTypeForFieldType(fieldType.valueType, identifiers),
        propertyAccessForIdentifier(fieldName, 'size')
    ])
}

// output.writeSetEnd()
export function writeSetEnd(): ts.CallExpression {
    return createMethodCall('output', 'writeSetEnd')
}

// output.writeFieldBegin(<field.name>, <field.fieldType>, <field.fieldID>)
export function writeFieldBegin(field: FieldDefinition, identifiers: IIdentifierMap): ts.ExpressionStatement {
    if (field.fieldID !== null) {
        return createMethodCallStatement('output', 'writeFieldBegin', [
            ts.createLiteral(field.name.value),
            thriftTypeForFieldType(field.fieldType, identifiers),
            ts.createLiteral(field.fieldID.value)
        ])
    } else {
        throw new Error(`FieldID on line ${field.loc.start.line} is null`)
    }
}

// output.writeFieldEnd
export function writeFieldEnd(): ts.ExpressionStatement {
    return createMethodCallStatement('output', 'writeFieldEnd')
}

// output.writeFieldStop
export function writeFieldStop(): ts.ExpressionStatement {
    return createMethodCallStatement('output', 'writeFieldStop')
}
