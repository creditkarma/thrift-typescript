import {
    ContainerType,
    FieldDefinition,
    FieldType,
    FunctionType,
    SyntaxType,
} from '@creditkarma/thrift-parser'
import * as ts from 'typescript'

import {
    coerceType,
    createConstStatement,
    createFunctionParameter,
    createMethodCallStatement,
} from '../utils'

import { className, toolkitName } from './utils'

import { resolveIdentifierDefinition } from '../../../resolver/utils'
import { DefinitionType, IRenderState } from '../../../types'
import { createMethodCall } from '../../shared/utils'
import { COMMON_IDENTIFIERS } from '../identifiers'
import { createVoidType, typeNodeForFieldType } from '../types'

type ValueAssignment = (
    valueName: ts.Identifier,
    field: FieldDefinition,
) => ts.Statement

function defaultValueAssignment(
    valueName: ts.Identifier,
    field: FieldDefinition,
): ts.Statement {
    return ts.createStatement(
        ts.createAssignment(
            ts.createIdentifier(`this.${field.name.value}`),
            valueName,
        ),
    )
}

export function assignmentForField(
    field: FieldDefinition,
    state: IRenderState,
    valueAssignment: ValueAssignment = defaultValueAssignment,
): Array<ts.Statement> {
    const valueName: ts.Identifier = ts.createUniqueName('value')
    return [
        ...assignmentForFieldType(
            field,
            field.fieldType,
            valueName,
            ts.createIdentifier(`args.${field.name.value}`),
            state,
        ),
        valueAssignment(valueName, field),
    ]
}

// const saveSame: FieldType = coerce(readName)
export function defaultAssignment(
    saveName: ts.Identifier,
    readName: ts.Identifier,
    fieldType: FieldType,
    state: IRenderState,
): ts.Statement {
    return createConstStatement(
        saveName,
        typeNodeForFieldType(fieldType, state),
        coerceType(readName, fieldType),
    )
}

export function assignmentForIdentifier(
    id: string,
    field: FieldDefinition,
    definition: DefinitionType,
    fieldType: FieldType,
    saveName: ts.Identifier,
    readName: ts.Identifier,
    state: IRenderState,
): Array<ts.Statement> {
    switch (definition.type) {
        case SyntaxType.ConstDefinition:
            throw new TypeError(
                `Identifier ${
                    definition.name.value
                } is a value being used as a type`,
            )

        case SyntaxType.ServiceDefinition:
            throw new TypeError(
                `Service ${definition.name.value} is being used as a type`,
            )

        // Handle creating value for args.
        case SyntaxType.UnionDefinition:
            if (state.options.strictUnions) {
                return [
                    createConstStatement(
                        saveName,
                        typeNodeForFieldType(fieldType, state),
                        createMethodCall(toolkitName(id, state), 'create', [
                            readName,
                        ]),
                    ),
                ]
            } else {
                // Else we fall through to render as struct
            }

        case SyntaxType.StructDefinition:
        case SyntaxType.ExceptionDefinition:
            return [
                createConstStatement(
                    saveName,
                    typeNodeForFieldType(fieldType, state),
                    ts.createNew(
                        ts.createIdentifier(className(id, state)),
                        undefined,
                        [readName],
                    ),
                ),
            ]

        case SyntaxType.EnumDefinition:
            return [defaultAssignment(saveName, readName, fieldType, state)]

        case SyntaxType.TypedefDefinition:
            return assignmentForFieldType(
                field,
                definition.definitionType,
                saveName,
                readName,
                state,
            )

        default:
            const msg: never = definition
            throw new Error(`Non-exhaustive match for: ${msg}`)
    }
}

export function assignmentForFieldType(
    field: FieldDefinition,
    fieldType: FunctionType,
    saveName: ts.Identifier,
    readName: ts.Identifier,
    state: IRenderState,
): Array<ts.Statement> {
    switch (fieldType.type) {
        case SyntaxType.Identifier:
            const definition = resolveIdentifierDefinition(
                fieldType,
                state.currentNamespace,
                state.project.namespaces,
                state.project.sourceDir,
            )

            return assignmentForIdentifier(
                fieldType.value,
                field,
                definition,
                fieldType,
                saveName,
                readName,
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
        case SyntaxType.I64Keyword: {
            return [defaultAssignment(saveName, readName, fieldType, state)]
        }

        /**
         * Container types:
         *
         * SetType | MapType | ListType
         */
        case SyntaxType.MapType: {
            return [
                createConstStatement(
                    saveName,
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
                ...loopOverContainer(
                    field,
                    fieldType,
                    saveName,
                    readName,
                    state,
                ),
            ]
        }

        case SyntaxType.ListType: {
            return [
                createConstStatement(
                    saveName,
                    typeNodeForFieldType(fieldType, state),
                    ts.createNew(
                        COMMON_IDENTIFIERS.Array, // class name
                        [typeNodeForFieldType(fieldType.valueType, state)],
                        [],
                    ),
                ),
                ...loopOverContainer(
                    field,
                    fieldType,
                    saveName,
                    readName,
                    state,
                ),
            ]
        }

        case SyntaxType.SetType: {
            return [
                createConstStatement(
                    saveName,
                    typeNodeForFieldType(fieldType, state),
                    ts.createNew(
                        COMMON_IDENTIFIERS.Set, // class name
                        [typeNodeForFieldType(fieldType.valueType, state)],
                        [],
                    ),
                ),
                ...loopOverContainer(
                    field,
                    fieldType,
                    saveName,
                    readName,
                    state,
                ),
            ]
        }

        case SyntaxType.VoidKeyword:
            return [
                createConstStatement(
                    saveName,
                    createVoidType(),
                    COMMON_IDENTIFIERS.undefined,
                ),
            ]

        default:
            const msg: never = fieldType
            throw new Error(`Non-exhaustive match for: ${msg}`)
    }
}

export function loopOverContainer(
    field: FieldDefinition,
    fieldType: ContainerType,
    saveName: ts.Identifier,
    readName: ts.Identifier,
    state: IRenderState,
): Array<ts.Statement> {
    switch (fieldType.type) {
        case SyntaxType.MapType: {
            const valueParam: ts.Identifier = ts.createUniqueName('value')
            const valueConst: ts.Identifier = ts.createUniqueName('value')
            const keyName: ts.Identifier = ts.createUniqueName('key')
            const keyConst: ts.Identifier = ts.createUniqueName('key')
            return [
                ts.createStatement(
                    ts.createCall(
                        ts.createPropertyAccess(
                            readName,
                            ts.createIdentifier('forEach'),
                        ),
                        undefined,
                        [
                            ts.createArrowFunction(
                                undefined,
                                undefined,
                                [
                                    createFunctionParameter(
                                        valueParam, // param name
                                        typeNodeForFieldType(
                                            fieldType.valueType,
                                            state,
                                            true,
                                        ), // param type
                                        undefined,
                                    ),
                                    createFunctionParameter(
                                        keyName, // param name
                                        typeNodeForFieldType(
                                            fieldType.keyType,
                                            state,
                                            true,
                                        ), // param type
                                        undefined,
                                    ),
                                ],
                                createVoidType(),
                                ts.createToken(
                                    ts.SyntaxKind.EqualsGreaterThanToken,
                                ),
                                ts.createBlock(
                                    [
                                        ...assignmentForFieldType(
                                            field,
                                            fieldType.valueType,
                                            valueConst,
                                            valueParam,
                                            state,
                                        ),
                                        ...assignmentForFieldType(
                                            field,
                                            fieldType.keyType,
                                            keyConst,
                                            keyName,
                                            state,
                                        ),
                                        createMethodCallStatement(
                                            saveName,
                                            'set',
                                            [keyConst, valueConst],
                                        ),
                                    ],
                                    true,
                                ),
                            ),
                        ],
                    ),
                ),
            ]
        }

        case SyntaxType.ListType: {
            const valueParam: ts.Identifier = ts.createUniqueName('value')
            const valueConst: ts.Identifier = ts.createUniqueName('value')
            return [
                ts.createStatement(
                    ts.createCall(
                        ts.createPropertyAccess(
                            readName,
                            ts.createIdentifier('forEach'),
                        ),
                        undefined,
                        [
                            ts.createArrowFunction(
                                undefined,
                                undefined,
                                [
                                    createFunctionParameter(
                                        valueParam, // param name
                                        typeNodeForFieldType(
                                            fieldType.valueType,
                                            state,
                                            true,
                                        ), // param type
                                        undefined,
                                    ),
                                ],
                                createVoidType(),
                                ts.createToken(
                                    ts.SyntaxKind.EqualsGreaterThanToken,
                                ),
                                ts.createBlock(
                                    [
                                        ...assignmentForFieldType(
                                            field,
                                            fieldType.valueType,
                                            valueConst,
                                            valueParam,
                                            state,
                                        ),
                                        createMethodCallStatement(
                                            saveName,
                                            'push',
                                            [valueConst],
                                        ),
                                    ],
                                    true,
                                ),
                            ),
                        ],
                    ),
                ),
            ]
        }

        case SyntaxType.SetType: {
            const valueParam: ts.Identifier = ts.createUniqueName('value')
            const valueConst: ts.Identifier = ts.createUniqueName('value')
            return [
                ts.createStatement(
                    ts.createCall(
                        ts.createPropertyAccess(
                            readName,
                            ts.createIdentifier('forEach'),
                        ),
                        undefined,
                        [
                            ts.createArrowFunction(
                                undefined,
                                undefined,
                                [
                                    createFunctionParameter(
                                        valueParam, // param name
                                        typeNodeForFieldType(
                                            fieldType.valueType,
                                            state,
                                            true,
                                        ), // param type
                                        undefined,
                                    ),
                                ],
                                createVoidType(),
                                ts.createToken(
                                    ts.SyntaxKind.EqualsGreaterThanToken,
                                ),
                                ts.createBlock(
                                    [
                                        ...assignmentForFieldType(
                                            field,
                                            fieldType.valueType,
                                            valueConst,
                                            valueParam,
                                            state,
                                        ),
                                        createMethodCallStatement(
                                            saveName,
                                            'add',
                                            [valueConst],
                                        ),
                                    ],
                                    true,
                                ),
                            ),
                        ],
                    ),
                ),
            ]
        }
    }
}
