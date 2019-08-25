import * as ts from 'typescript'

import {
    ContainerType,
    FieldDefinition,
    FunctionType,
    InterfaceWithFields,
    SyntaxType,
} from '@creditkarma/thrift-parser'

import { DefinitionType, IRenderState, IResolveResult } from '../../../types'

import { thriftTypeForFieldType, typeNodeForFieldType } from '../types'

import { throwProtocolException } from '../utils'

import {
    createAssignmentStatement,
    createConstStatement,
    createEqualsCheck,
    createFunctionParameter,
    createLet,
    createLetStatement,
    createMethodCall,
    createMethodCallStatement,
    hasRequiredField,
    propertyAccessForIdentifier,
} from '../../shared/utils'

import { COMMON_IDENTIFIERS } from '../../shared/identifiers'

import { createAnyType, createNumberType } from '../types'

import { THRIFT_IDENTIFIERS, THRIFT_TYPES } from '../identifiers'

import { Resolver } from '../../../resolver'
import { READ_METHODS } from './methods'

/**
 * public read(input: TProtocol): void {
 *     input.readStructBegin()
 *     while (true) {
 *         {{#has_fields}}
 *         const {fieldType, fieldId} = input.readFieldBegin()
 *         {{/has_fields}}
 *         {{^has_fields}}
 *         const {fieldType} = input.readFieldBegin()
 *         {{/has_fields}}
 *         if (fieldType === Thrift.Type.STOP) {
 *             break
 *         }
 *         {{#has_fields}}
 *         switch (fieldId) {
 *             {{#fields}}
 *             case {{id}}:
 *                 {{>readField}}
 *                 break
 *             {{/fields}}
 *             default:
 *                 input.skip(fieldType)
 *         }
 *         {{/has_fields}}
 *         {{^has_fields}}
 *         input.skip(fieldType)
 *         {{/has_fields}}
 *         input.readFieldEnd()
 *     }
 *     input.readStructEnd()
 *     return
 * }
 */
export function createReadMethod(
    struct: InterfaceWithFields,
    state: IRenderState,
): ts.MethodDeclaration {
    const inputParameter: ts.ParameterDeclaration = createInputParameter()
    const tempVariable: Array<ts.VariableStatement> = createTempVariable(struct)

    /**
     * cosnt ret: { fieldName: string; fieldType: Thrift.Type; fieldId: number; } = input.readFieldBegin()
     * const fieldType: Thrift.Type = ret.fieldType
     * const fieldId: number = ret.fieldId
     */
    const ret: ts.VariableStatement = createConstStatement(
        'ret',
        ts.createTypeReferenceNode(THRIFT_IDENTIFIERS.TField, undefined),
        readFieldBegin(),
    )

    const fieldType: ts.VariableStatement = createConstStatement(
        'fieldType',
        ts.createTypeReferenceNode(THRIFT_IDENTIFIERS.Thrift_Type, undefined),
        propertyAccessForIdentifier('ret', 'ftype'),
    )

    const fieldId: ts.VariableStatement = createConstStatement(
        'fieldId',
        createNumberType(),
        propertyAccessForIdentifier('ret', 'fid'),
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
                        ...struct.fields.map((next: FieldDefinition) => {
                            return createCaseForField(next, state)
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
        [
            ts.createToken(ts.SyntaxKind.PublicKeyword),
            ts.createToken(ts.SyntaxKind.StaticKeyword),
        ],
        undefined,
        COMMON_IDENTIFIERS.read,
        undefined,
        undefined,
        [inputParameter],
        ts.createTypeReferenceNode(
            ts.createIdentifier(struct.name.value),
            undefined,
        ), // return type
        ts.createBlock(
            [
                readStructBegin(),
                ...tempVariable,
                whileLoop,
                readStructEnd(),
                createReturnForStruct(struct),
            ],
            true,
        ),
    )
}

function createTempVariable(
    struct: InterfaceWithFields,
): Array<ts.VariableStatement> {
    if (struct.fields.length > 0) {
        return [
            createLetStatement(
                COMMON_IDENTIFIERS._args,
                createAnyType(),
                ts.createObjectLiteral(),
            ),
        ]
    } else {
        return []
    }
}

function createCheckForFields(
    fields: Array<FieldDefinition>,
): ts.BinaryExpression {
    return fields
        .filter((next: FieldDefinition) => {
            return next.requiredness === 'required'
        })
        .map(
            (next: FieldDefinition): ts.BinaryExpression => {
                return ts.createBinary(
                    ts.createIdentifier(`_args.${next.name.value}`),
                    ts.SyntaxKind.ExclamationEqualsEqualsToken,
                    COMMON_IDENTIFIERS.undefined,
                )
            },
        )
        .reduce((acc: ts.BinaryExpression, next: ts.BinaryExpression) => {
            return ts.createBinary(
                acc,
                ts.SyntaxKind.AmpersandAmpersandToken,
                next,
            )
        })
}

function createReturnForStruct(struct: InterfaceWithFields): ts.Statement {
    if (hasRequiredField(struct)) {
        return ts.createIf(
            createCheckForFields(struct.fields),
            ts.createBlock([createReturnValue(struct)], true),
            ts.createBlock(
                [
                    throwProtocolException(
                        'UNKNOWN',
                        `Unable to read ${struct.name.value} from input`,
                    ),
                ],
                true,
            ),
        )
    } else {
        return createReturnValue(struct)
    }
}

function createReturnValue(struct: InterfaceWithFields): ts.ReturnStatement {
    return ts.createReturn(
        ts.createNew(
            ts.createIdentifier(struct.name.value),
            undefined,
            createReturnArgs(struct),
        ),
    )
}

function createReturnArgs(struct: InterfaceWithFields): Array<ts.Expression> {
    if (struct.fields.length > 0) {
        return [COMMON_IDENTIFIERS._args]
    } else {
        return []
    }
}

export function createInputParameter(): ts.ParameterDeclaration {
    return createFunctionParameter(
        COMMON_IDENTIFIERS.input, // param name
        ts.createTypeReferenceNode(THRIFT_IDENTIFIERS.TProtocol, undefined), // param type
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
export function createCaseForField(
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
                ...readValueForFieldType(field.fieldType, fieldAlias, state),
                ...endReadForField(fieldAlias, field),
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
    fieldName: ts.Identifier,
    field: FieldDefinition,
): Array<ts.Statement> {
    switch (field.fieldType.type) {
        case SyntaxType.VoidKeyword:
            return []

        default:
            return [
                createAssignmentStatement(
                    ts.createIdentifier(`_args.${field.name.value}`),
                    fieldName,
                ),
            ]
    }
}

export function metadataTypeForFieldType(
    fieldType: ContainerType,
): ts.TypeNode {
    switch (fieldType.type) {
        case SyntaxType.MapType:
            return ts.createTypeReferenceNode(
                THRIFT_IDENTIFIERS.TMap,
                undefined,
            )

        case SyntaxType.SetType:
            return ts.createTypeReferenceNode(
                THRIFT_IDENTIFIERS.TSet,
                undefined,
            )

        case SyntaxType.ListType:
            return ts.createTypeReferenceNode(
                THRIFT_IDENTIFIERS.TList,
                undefined,
            )

        default:
            const msg: never = fieldType
            throw new Error(`Non-exhaustive match for: ${msg}`)
    }
}

function readBeginForFieldType(fieldType: ContainerType): ts.CallExpression {
    switch (fieldType.type) {
        case SyntaxType.MapType:
            return readMapBegin()

        case SyntaxType.SetType:
            return readSetBegin()

        case SyntaxType.ListType:
            return readListBegin()

        default:
            const msg: never = fieldType
            throw new Error(`Non-exhaustive match for: ${msg}`)
    }
}

function readEndForFieldType(fieldType: ContainerType): ts.CallExpression {
    switch (fieldType.type) {
        case SyntaxType.MapType:
            return readMapEnd()

        case SyntaxType.SetType:
            return readSetEnd()

        case SyntaxType.ListType:
            return readListEnd()

        default:
            const msg: never = fieldType
            throw new Error(`Non-exhaustive match for: ${msg}`)
    }
}

function loopBody(
    fieldType: ContainerType,
    fieldName: ts.Identifier,
    state: IRenderState,
): Array<ts.Statement> {
    const value: ts.Identifier = ts.createUniqueName('value')

    switch (fieldType.type) {
        case SyntaxType.MapType:
            const key: ts.Identifier = ts.createUniqueName('key')
            return [
                ...readValueForFieldType(fieldType.keyType, key, state),
                ...readValueForFieldType(fieldType.valueType, value, state),
                createMethodCallStatement(fieldName, 'set', [key, value]),
            ]

        case SyntaxType.ListType:
            return [
                ...readValueForFieldType(fieldType.valueType, value, state),
                createMethodCallStatement(fieldName, 'push', [value]),
            ]

        case SyntaxType.SetType:
            return [
                ...readValueForFieldType(fieldType.valueType, value, state),
                createMethodCallStatement(fieldName, 'add', [value]),
            ]
    }
}

/**
 * EXAMPLE OF MAP FIELD
 *
 * if (fieldType === Thrift.Type.MAP) {
 *   this.field1 = new Map<string, string>();
 *   const metadata_1: {
 *     ktype: Thrift.Type;
 *     vtype: Thrift.Type;
 *     size: number;
 *   } = input.readMapBegin();
 *   const size_1: number = metadata_1.size;
 *   for (let i_1: number = 0; i_1 < size_1; i_1++) {
 *     const key_2: string = input.readString();
 *     const value_2: string = input.readString();
 *     this.field1.set(key_2, value_2);
 *   }
 *   input.readMapEnd();
 * }
 */
function loopOverContainer(
    fieldType: ContainerType,
    fieldName: ts.Identifier,
    state: IRenderState,
): Array<ts.Statement> {
    const incrementer: ts.Identifier = ts.createUniqueName('i')
    const metadata: ts.Identifier = ts.createUniqueName('metadata')
    const size: ts.Identifier = ts.createUniqueName('size')

    return [
        // const metadata: { ktype: Thrift.Type; vtype: Thrift.Type; size: number; } = input.readMapBegin()
        createConstStatement(
            metadata,
            metadataTypeForFieldType(fieldType),
            readBeginForFieldType(fieldType),
        ),
        // cosnt size: number = metadata.size
        createConstStatement(
            size,
            createNumberType(),
            propertyAccessForIdentifier(metadata, 'size'),
        ),
        // for (let i = 0, i < size; i++) { .. }
        ts.createFor(
            createLet(incrementer, createNumberType(), ts.createLiteral(0)),
            ts.createLessThan(incrementer, size),
            ts.createPostfixIncrement(incrementer),
            ts.createBlock(loopBody(fieldType, fieldName, state), true),
        ),
        ts.createStatement(readEndForFieldType(fieldType)),
    ]
}

export function readValueForIdentifier(
    baseName: string,
    definition: DefinitionType,
    fieldType: FunctionType,
    fieldName: ts.Identifier,
    state: IRenderState,
): Array<ts.Statement> {
    switch (definition.type) {
        case SyntaxType.ConstDefinition:
            throw new TypeError(
                `Identifier ${baseName} is a value being used as a type`,
            )

        case SyntaxType.ServiceDefinition:
            throw new TypeError(`Service ${baseName} is being used as a type`)

        case SyntaxType.StructDefinition:
        case SyntaxType.UnionDefinition:
        case SyntaxType.ExceptionDefinition:
            return [
                createConstStatement(
                    fieldName,
                    typeNodeForFieldType(fieldType, state),
                    ts.createCall(
                        ts.createPropertyAccess(
                            ts.createIdentifier(
                                Resolver.resolveIdentifierName(baseName, {
                                    currentNamespace: state.currentNamespace,
                                    currentDefinitions:
                                        state.currentDefinitions,
                                    namespaceMap: state.project.namespaces,
                                }).fullName,
                            ),
                            COMMON_IDENTIFIERS.read,
                        ),
                        undefined,
                        [COMMON_IDENTIFIERS.input],
                    ),
                ),
            ]

        case SyntaxType.EnumDefinition:
            return [
                createConstStatement(
                    fieldName,
                    typeNodeForFieldType(fieldType, state),
                    createMethodCall(
                        COMMON_IDENTIFIERS.input,
                        READ_METHODS[SyntaxType.I32Keyword],
                    ),
                ),
            ]

        case SyntaxType.TypedefDefinition:
            return readValueForFieldType(
                definition.definitionType,
                fieldName,
                state,
            )

        default:
            const msg: never = definition
            throw new Error(`Non-exhaustive match for: ${msg}`)
    }
}

export function readValueForFieldType(
    fieldType: FunctionType,
    fieldName: ts.Identifier,
    state: IRenderState,
): Array<ts.Statement> {
    switch (fieldType.type) {
        case SyntaxType.Identifier:
            const result: IResolveResult = Resolver.resolveIdentifierDefinition(
                fieldType,
                {
                    currentNamespace: state.currentNamespace,
                    namespaceMap: state.project.namespaces,
                },
            )

            return readValueForIdentifier(
                fieldType.value,
                result.definition,
                fieldType,
                fieldName,
                state,
            )

        /**
         * Base types:
         *
         * SyntaxType.StringKeyword | SyntaxType.DoubleKeyword | SyntaxType.BoolKeyword |
         * SyntaxType.I8Keyword | SyntaxType.I16Keyword | SyntaxType.I32Keyword |
         * SyntaxType.I64Keyword | SyntaxType.BinaryKeyword | SyntaxType.ByteKeyword;
         */
        case SyntaxType.BoolKeyword:
        case SyntaxType.ByteKeyword:
        case SyntaxType.BinaryKeyword:
        case SyntaxType.StringKeyword:
        case SyntaxType.DoubleKeyword:
        case SyntaxType.I8Keyword:
        case SyntaxType.I16Keyword:
        case SyntaxType.I32Keyword:
        case SyntaxType.I64Keyword:
            // const <fieldName>: <fieldType> = input.<readMethod>();
            return [
                createConstStatement(
                    fieldName,
                    typeNodeForFieldType(fieldType, state),
                    createMethodCall(
                        COMMON_IDENTIFIERS.input,
                        READ_METHODS[fieldType.type],
                    ),
                ),
            ]

        /**
         * Container types:
         *
         * SetType | MapType | ListType
         */
        case SyntaxType.MapType:
            return [
                createConstStatement(
                    fieldName,
                    typeNodeForFieldType(fieldType, state),
                    ts.createNew(
                        COMMON_IDENTIFIERS.Map, // class name
                        [
                            typeNodeForFieldType(fieldType.keyType, state),
                            typeNodeForFieldType(fieldType.valueType, state),
                        ],
                        [],
                    ),
                ),
                ...loopOverContainer(fieldType, fieldName, state),
            ]

        case SyntaxType.ListType:
            return [
                createConstStatement(
                    fieldName,
                    typeNodeForFieldType(fieldType, state),
                    ts.createNew(
                        COMMON_IDENTIFIERS.Array, // class name
                        [typeNodeForFieldType(fieldType.valueType, state)],
                        [],
                    ),
                ),
                ...loopOverContainer(fieldType, fieldName, state),
            ]

        case SyntaxType.SetType:
            return [
                createConstStatement(
                    fieldName,
                    typeNodeForFieldType(fieldType, state),
                    ts.createNew(
                        COMMON_IDENTIFIERS.Set, // class name
                        [typeNodeForFieldType(fieldType.valueType, state)],
                        [],
                    ),
                ),
                ...loopOverContainer(fieldType, fieldName, state),
            ]

        case SyntaxType.VoidKeyword:
            return [
                createMethodCallStatement(COMMON_IDENTIFIERS.input, 'skip', [
                    COMMON_IDENTIFIERS.fieldType,
                ]),
            ]

        default:
            const msg: never = fieldType
            throw new Error(`Non-exhaustive match for: ${msg}`)
    }
}

// input.readStructBegin(<structName>)
export function readStructBegin(): ts.ExpressionStatement {
    return createMethodCallStatement(
        COMMON_IDENTIFIERS.input,
        COMMON_IDENTIFIERS.readStructBegin,
    )
}

// input.readStructEnd()
export function readStructEnd(): ts.ExpressionStatement {
    return createMethodCallStatement(
        COMMON_IDENTIFIERS.input,
        COMMON_IDENTIFIERS.readStructEnd,
    )
}

// input.readFieldBegin()
export function readFieldBegin(): ts.CallExpression {
    return createMethodCall(COMMON_IDENTIFIERS.input, 'readFieldBegin')
}

// input.readFieldEnd()
export function readFieldEnd(): ts.ExpressionStatement {
    return createMethodCallStatement(COMMON_IDENTIFIERS.input, 'readFieldEnd')
}

// input.readMapBegin()
export function readMapBegin(): ts.CallExpression {
    return createMethodCall(COMMON_IDENTIFIERS.input, 'readMapBegin')
}

// input.readMapEnd()
export function readMapEnd(): ts.CallExpression {
    return createMethodCall(COMMON_IDENTIFIERS.input, 'readMapEnd')
}

// input.readListBegin()
export function readListBegin(): ts.CallExpression {
    return createMethodCall(COMMON_IDENTIFIERS.input, 'readListBegin')
}

// input.readListEnd()
export function readListEnd(): ts.CallExpression {
    return createMethodCall(COMMON_IDENTIFIERS.input, 'readListEnd')
}

// input.readSetBegin()
export function readSetBegin(): ts.CallExpression {
    return createMethodCall(COMMON_IDENTIFIERS.input, 'readSetBegin')
}

// input.readSetEnd()
export function readSetEnd(): ts.CallExpression {
    return createMethodCall(COMMON_IDENTIFIERS.input, 'readSetEnd')
}

// input.skip(fieldType)
export function createSkipBlock(): ts.Block {
    return ts.createBlock([createSkipStatement()], true)
}

function createSkipStatement(): ts.ExpressionStatement {
    return createMethodCallStatement(COMMON_IDENTIFIERS.input, 'skip', [
        COMMON_IDENTIFIERS.fieldType,
    ])
}
