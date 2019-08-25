import * as ts from 'typescript'

import {
    ContainerType,
    FieldDefinition,
    FunctionType,
    InterfaceWithFields,
    ListType,
    MapType,
    SetType,
    SyntaxType,
} from '@creditkarma/thrift-parser'

import { DefinitionType, IRenderState, IResolveResult } from '../../../types'

import {
    createFunctionParameter,
    createMethodCall,
    createMethodCallStatement,
    createNotNullCheck,
    createPublicMethod,
    propertyAccessForIdentifier,
} from '../utils'

import {
    createVoidType,
    thriftTypeForFieldType,
    typeNodeForFieldType,
} from '../types'

import { COMMON_IDENTIFIERS, THRIFT_IDENTIFIERS } from '../identifiers'

import { Resolver } from '../../../resolver'
import { WRITE_METHODS, WriteMethodName } from './methods'

function isNotVoid(field: FieldDefinition): boolean {
    return field.fieldType.type !== SyntaxType.VoidKeyword
}

/**
 * public write(output: TProtocol): void {
 *     output.writeStructBegin("{{StructName}}")
 *     {{#fields}}
 *     if (this.{{fieldName}} != null) {
 *         {{>writeField}}
 *     }
 *     {{/fields}}
 *     output.writeFieldStop()
 *     output.writeStructEnd()
 *     return
 * }
 */
export function createWriteMethod(
    struct: InterfaceWithFields,
    state: IRenderState,
): ts.MethodDeclaration {
    const fieldWrites: Array<ts.IfStatement> = struct.fields
        .filter(isNotVoid)
        .map((field) => {
            return createWriteForField(struct, field, state)
        })
    const inputParameter: ts.ParameterDeclaration = createFunctionParameter(
        COMMON_IDENTIFIERS.output,
        ts.createTypeReferenceNode(THRIFT_IDENTIFIERS.TProtocol, undefined),
    )

    return createPublicMethod(
        COMMON_IDENTIFIERS.write, // Method name
        [inputParameter], // Method parameters
        createVoidType(), // Method return type
        [
            writeStructBegin(struct.name.value),
            ...fieldWrites,
            writeFieldStop(),
            writeStructEnd(),
            ts.createReturn(),
        ], // Method body statements
    )
}

/**
 * {{#optional}}
 * if (this.{{fieldName}} !== undefined) {
 * {{/optional}}
 * {{^optional}}
 * {{#nullable}}
 * if (this.{{fieldName}} !== null) {
 * {{/nullable}}
 * {{^nullable}}
 * if (true) {
 * {{/nullable}}
 * {{/optional}}
 *     const {{valueVariableName}} = this.{{fieldName}}
 *     output.writeFieldBegin("{{fieldName}}", Thrift.Type.{{^isEnum}}{{constType}}{{/isEnum}}{{#isEnum}}I32{{/isEnum}}, {{id}})
 *     {{#readWriteInfo}}
 *     {{>writeValue}}
 *     {{/readWriteInfo}}
 *     output.writeFieldEnd()
 * }
 */
export function createWriteForField(
    struct: InterfaceWithFields,
    field: FieldDefinition,
    state: IRenderState,
): ts.IfStatement {
    return ts.createIf(
        createNotNullCheck(`this.${field.name.value}`), // Condition
        createWriteForFieldType(
            struct,
            field,
            ts.createIdentifier(`this.${field.name.value}`),
            state,
        ), // Then block
        undefined, // Else block
    )
}

/**
 * This generates the method calls to write for a single field
 *
 * EXAMPLE
 *
 * output.writeFieldBegin("id", Thrift.Type.I32, 1);
 * output.writeI32(this.id);
 * output.writeFieldEnd();
 */
export function createWriteForFieldType(
    struct: InterfaceWithFields,
    field: FieldDefinition,
    fieldName: ts.Identifier,
    state: IRenderState,
): ts.Block {
    return ts.createBlock([
        writeFieldBegin(field, state),
        ...writeValueForField(struct, field.fieldType, fieldName, state),
        writeFieldEnd(),
    ])
}

export function writeValueForIdentifier(
    definition: DefinitionType,
    node: InterfaceWithFields,
    fieldName: ts.Identifier,
    state: IRenderState,
): Array<ts.Expression> {
    switch (definition.type) {
        case SyntaxType.ConstDefinition:
            throw new TypeError(
                `Identifier ${definition.name.value} is a value being used as a type`,
            )

        case SyntaxType.ServiceDefinition:
            throw new TypeError(
                `Service ${definition.name.value} is being used as a type`,
            )

        case SyntaxType.StructDefinition:
        case SyntaxType.UnionDefinition:
        case SyntaxType.ExceptionDefinition:
            return [
                createMethodCall(fieldName, COMMON_IDENTIFIERS.write, [
                    COMMON_IDENTIFIERS.output,
                ]),
            ]

        case SyntaxType.EnumDefinition:
            return [
                writeMethodForName(
                    WRITE_METHODS[SyntaxType.I32Keyword],
                    fieldName,
                ),
            ]

        case SyntaxType.TypedefDefinition:
            return writeValueForType(
                node,
                definition.definitionType,
                fieldName,
                state,
            )

        default:
            const msg: never = definition
            throw new Error(`Non-exhaustive match for: ${msg}`)
    }
}

export function writeValueForType(
    struct: InterfaceWithFields,
    fieldType: FunctionType,
    fieldName: ts.Identifier,
    state: IRenderState,
): Array<ts.Expression> {
    switch (fieldType.type) {
        case SyntaxType.Identifier:
            const result: IResolveResult = Resolver.resolveIdentifierDefinition(
                fieldType,
                {
                    currentNamespace: state.currentNamespace,
                    namespaceMap: state.project.namespaces,
                },
            )

            return writeValueForIdentifier(
                result.definition,
                struct,
                fieldName,
                state,
            )

        /**
         * Container types:
         *
         * SetType | MapType | ListType
         */
        case SyntaxType.SetType:
            return [
                writeSetBegin(fieldType, fieldName, state),
                forEach(struct, fieldType, fieldName, state),
                writeSetEnd(),
            ]

        case SyntaxType.MapType:
            return [
                writeMapBegin(fieldType, fieldName, state),
                forEach(struct, fieldType, fieldName, state),
                writeMapEnd(),
            ]

        case SyntaxType.ListType:
            return [
                writeListBegin(fieldType, fieldName, state),
                forEach(struct, fieldType, fieldName, state),
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
            return [
                writeMethodForName(WRITE_METHODS[fieldType.type], fieldName),
            ]

        case SyntaxType.VoidKeyword:
            return []

        default:
            const msg: never = fieldType
            throw new Error(`Non-exhaustive match for: ${msg}`)
    }
}

function writeMethodForName(
    methodName: WriteMethodName,
    fieldName: ts.Identifier,
): ts.CallExpression {
    return createMethodCall('output', methodName, [fieldName])
}

function writeValueForField(
    struct: InterfaceWithFields,
    fieldType: FunctionType,
    fieldName: ts.Identifier,
    state: IRenderState,
): Array<ts.ExpressionStatement> {
    return writeValueForType(struct, fieldType, fieldName, state).map(
        ts.createStatement,
    )
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
 * this.field1.forEach((value_1: string): void => {
 *   output.writeString(value_1);
 * });
 */
function forEach(
    struct: InterfaceWithFields,
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
        ...writeValueForField(struct, fieldType.valueType, value, state),
    ]

    // If map we have to handle key type as well as value type
    if (fieldType.type === SyntaxType.MapType) {
        const key: ts.Identifier = ts.createUniqueName('key')
        forEachParameters.push(
            createFunctionParameter(
                key,
                typeNodeForFieldType(fieldType.keyType, state),
            ),
        )

        forEachStatements.unshift(
            ...writeValueForField(struct, fieldType.keyType, key, state),
        )
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

// output.writeStructBegin(<structName>)
function writeStructBegin(structName: string): ts.ExpressionStatement {
    return createMethodCallStatement('output', 'writeStructBegin', [
        ts.createLiteral(structName),
    ])
}

// output.writeStructEnd()
function writeStructEnd(): ts.ExpressionStatement {
    return createMethodCallStatement('output', 'writeStructEnd')
}

// output.writeMapBeing(<field.keyType>, <field.valueType>, <field.size>)
function writeMapBegin(
    fieldType: MapType,
    fieldName: string | ts.Identifier,
    state: IRenderState,
): ts.CallExpression {
    return createMethodCall('output', 'writeMapBegin', [
        thriftTypeForFieldType(fieldType.keyType, state),
        thriftTypeForFieldType(fieldType.valueType, state),
        propertyAccessForIdentifier(fieldName, 'size'),
    ])
}

// output.writeMapEnd()
function writeMapEnd(): ts.CallExpression {
    return createMethodCall('output', 'writeMapEnd')
}

// output.writeListBegin(<field.type>, <field.length>)
function writeListBegin(
    fieldType: ListType,
    fieldName: string | ts.Identifier,
    state: IRenderState,
): ts.CallExpression {
    return createMethodCall('output', 'writeListBegin', [
        thriftTypeForFieldType(fieldType.valueType, state),
        propertyAccessForIdentifier(fieldName, 'length'),
    ])
}

// output.writeListEnd()
function writeListEnd(): ts.CallExpression {
    return createMethodCall('output', 'writeListEnd')
}

// output.writeSetBegin(<field.type>, <field.size>)
function writeSetBegin(
    fieldType: SetType,
    fieldName: string | ts.Identifier,
    state: IRenderState,
): ts.CallExpression {
    return createMethodCall('output', 'writeSetBegin', [
        thriftTypeForFieldType(fieldType.valueType, state),
        propertyAccessForIdentifier(fieldName, 'size'),
    ])
}

// output.writeSetEnd()
function writeSetEnd(): ts.CallExpression {
    return createMethodCall('output', 'writeSetEnd')
}

// output.writeFieldBegin(<field.name>, <field.fieldType>, <field.fieldID>)
function writeFieldBegin(
    field: FieldDefinition,
    state: IRenderState,
): ts.ExpressionStatement {
    if (field.fieldID !== null) {
        return createMethodCallStatement('output', 'writeFieldBegin', [
            ts.createLiteral(field.name.value),
            thriftTypeForFieldType(field.fieldType, state),
            ts.createLiteral(field.fieldID.value),
        ])
    } else {
        throw new Error(`FieldID on line ${field.loc.start.line} is null`)
    }
}

// output.writeFieldEnd
function writeFieldEnd(): ts.ExpressionStatement {
    return createMethodCallStatement('output', 'writeFieldEnd')
}

// output.writeFieldStop
function writeFieldStop(): ts.ExpressionStatement {
    return createMethodCallStatement('output', 'writeFieldStop')
}
