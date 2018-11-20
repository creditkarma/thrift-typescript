import * as ts from 'typescript'

import {
    ContainerType,
    FieldDefinition,
    FieldType,
    FunctionType,
    InterfaceWithFields,
    SyntaxType,
} from '@creditkarma/thrift-parser'

import {
    IIdentifierMap,
    IResolvedIdentifier,
} from '../../../types'

import {
    renderAnnotations,
    renderFieldAnnotations,
} from '../annotations'

import {
    COMMON_IDENTIFIERS,
    THRIFT_IDENTIFIERS,
} from '../identifiers'

import {
    coerceType,
    createClassConstructor,
    createConstStatement,
    createFunctionParameter,
    createMethodCallStatement,
    createNotNullCheck,
    hasRequiredField,
} from '../utils'

import {
    renderValue,
} from '../values'

import {
    createVoidType,
    typeNodeForFieldType,
} from '../types'

import {
    className,
    classNameForStruct,
    codecNameForStruct,
    createSuperCall,
    extendsAbstract,
    implementsInterface,
    looseNameForStruct,
    throwForField,
} from './utils'

export function renderClass(node: InterfaceWithFields, identifiers: IIdentifierMap): ts.ClassDeclaration {
    const fields: Array<ts.PropertyDeclaration> = createFieldsForStruct(node, identifiers)

    const annotations: ts.PropertyDeclaration = renderAnnotations(node.annotations)

    const fieldAnnotations: ts.PropertyDeclaration = renderFieldAnnotations(node.fields)

    /**
     * After creating the properties on our class for the struct fields we must create
     * a constructor that knows how to assign these values based on a passed args.
     *
     * The constructor will take one arguments 'args'. This argument will be an object
     * of an interface matching the struct definition. This interface is built by another
     * function in src/render/interface
     *
     * The interface follows the naming convention of 'I<struct name>'
     *
     * If a required argument is not on the passed 'args' argument we need to throw on error.
     * Optional fields we must allow to be null or undefined.
     */
    const fieldAssignments: Array<ts.IfStatement> = node.fields.map((field: FieldDefinition) => {
        return createFieldAssignment(field, identifiers)
    })

    const argsParameter: ts.ParameterDeclaration = createArgsParameterForStruct(node, identifiers)

    // Build the constructor body
    const ctor: ts.ConstructorDeclaration = createClassConstructor(
        [ argsParameter ],
        [
            createSuperCall(),
            ...fieldAssignments,
        ],
    )

    // export class <node.name> { ... }
    return ts.createClassDeclaration(
        undefined,
        [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
        classNameForStruct(node),
        [],
        [
            extendsAbstract(),
            implementsInterface(node),
        ], // heritage
        [
            ...fields,
            annotations,
            fieldAnnotations,
            ctor,
            createStaticReadMethod(node),
            createStaticWriteMethod(node),
            createWriteMethod(node),
        ],
    )
}

export function createWriteMethod(node: InterfaceWithFields): ts.MethodDeclaration {
    return ts.createMethod(
        undefined,
        [
            ts.createToken(ts.SyntaxKind.PublicKeyword),
        ],
        undefined,
        COMMON_IDENTIFIERS.write,
        undefined,
        undefined,
        [ createOutputParameter() ],
        createVoidType(),
        ts.createBlock([
            ts.createReturn(
                ts.createCall(
                    ts.createPropertyAccess(
                        ts.createIdentifier(
                            codecNameForStruct(node),
                        ),
                        COMMON_IDENTIFIERS.encode,
                    ),
                    undefined,
                    [
                        COMMON_IDENTIFIERS.this,
                        COMMON_IDENTIFIERS.output,
                    ],
                ),
            ),
        ], true),
    )
}

export function createStaticWriteMethod(node: InterfaceWithFields): ts.MethodDeclaration {
    return ts.createMethod(
        undefined,
        [
            ts.createToken(ts.SyntaxKind.PublicKeyword),
            ts.createToken(ts.SyntaxKind.StaticKeyword),
        ],
        undefined,
        COMMON_IDENTIFIERS.write,
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
            createOutputParameter(),
        ],
        createVoidType(),
        ts.createBlock([
            ts.createReturn(
                ts.createCall(
                    ts.createPropertyAccess(
                        ts.createIdentifier(codecNameForStruct(node)),
                        COMMON_IDENTIFIERS.encode,
                    ),
                    undefined,
                    [
                        COMMON_IDENTIFIERS.args,
                        COMMON_IDENTIFIERS.output,
                    ],
                ),
            ),
        ], true),
    )
}

export function createStaticReadMethod(node: InterfaceWithFields): ts.MethodDeclaration {
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
        [ createInputParameter() ],
        ts.createTypeReferenceNode(
            ts.createIdentifier(
                classNameForStruct(node),
            ),
            undefined,
        ),
        ts.createBlock([
            ts.createReturn(
                ts.createNew(
                    ts.createIdentifier(
                        classNameForStruct(node),
                    ),
                    undefined,
                    [
                        ts.createCall(
                            ts.createPropertyAccess(
                                ts.createIdentifier(codecNameForStruct(node)),
                                COMMON_IDENTIFIERS.decode,
                            ),
                            undefined,
                            [
                                COMMON_IDENTIFIERS.input,
                            ],
                        ),
                    ],
                ),
            ),
        ], true),
    )
}

export function createOutputParameter(): ts.ParameterDeclaration {
    return createFunctionParameter(
        COMMON_IDENTIFIERS.output, // param name
        ts.createTypeReferenceNode(THRIFT_IDENTIFIERS.TProtocol, undefined), // param type
    )
}

export function createInputParameter(): ts.ParameterDeclaration {
    return createFunctionParameter(
        COMMON_IDENTIFIERS.input, // param name
        ts.createTypeReferenceNode(THRIFT_IDENTIFIERS.TProtocol, undefined), // param type
    )
}

export function createFieldsForStruct(node: InterfaceWithFields, identifiers: IIdentifierMap): Array<ts.PropertyDeclaration> {
    return node.fields.map((field: FieldDefinition) => {
        return renderFieldDeclarations(field, identifiers)
    })
}

/**
 * Render properties for struct class based on values thrift file
 *
 * EXAMPLE:
 *
 * // thrift
 * stuct MyStruct {
 *   1: required i32 id,
 *   2: optional bool field1,
 * }
 *
 * // typescript
 * export class MyStruct {
 *   public id: number = null;
 *   public field1?: boolean = null;
 *
 *   ...
 * }
 */
export function renderFieldDeclarations(field: FieldDefinition, identifiers: IIdentifierMap): ts.PropertyDeclaration {
    const defaultValue: ts.Expression | undefined = (
        (field.defaultValue !== null) ?
            renderValue(field.fieldType, field.defaultValue) :
            undefined
    )

    return ts.createProperty(
        undefined,
        [ ts.createToken(ts.SyntaxKind.PublicKeyword) ],
        ts.createIdentifier(field.name.value),
        (
            (field.requiredness === 'required') ?
                undefined :
                ts.createToken(ts.SyntaxKind.QuestionToken)
        ),
        typeNodeForFieldType(field.fieldType, identifiers),
        defaultValue,
    )
}

export function defaultAssignment(
    saveName: ts.Identifier,
    readName: ts.Identifier,
    fieldType: FieldType,
    identifiers: IIdentifierMap,
): ts.Statement {
    return createConstStatement(
        saveName,
        typeNodeForFieldType(fieldType, identifiers),
        coerceType(readName, fieldType),
    )
}

export function assignmentForField(field: FieldDefinition, identifiers: IIdentifierMap): Array<ts.Statement> {
    const valueName: ts.Identifier = ts.createUniqueName('value')
    return [
        ...assignmentForFieldType(
            field,
            field.fieldType,
            valueName,
            ts.createIdentifier(`args.${field.name.value}`),
            identifiers,
        ),
        ts.createStatement(ts.createAssignment(
            ts.createIdentifier(`this.${field.name.value}`),
            valueName,
        )),
    ]
}

export function assignmentForIdentifier(
    field: FieldDefinition,
    id: IResolvedIdentifier,
    fieldType: FieldType,
    saveName: ts.Identifier,
    readName: ts.Identifier,
    identifiers: IIdentifierMap,
): Array<ts.Statement> {
    switch (id.definition.type) {
        case SyntaxType.ConstDefinition:
            throw new TypeError(`Identifier ${id.definition.name.value} is a value being used as a type`)

        case SyntaxType.ServiceDefinition:
            throw new TypeError(`Service ${id.definition.name.value} is being used as a type`)

        case SyntaxType.StructDefinition:
        case SyntaxType.UnionDefinition:
        case SyntaxType.ExceptionDefinition:
            return [
                createConstStatement(
                    saveName,
                    typeNodeForFieldType(fieldType, identifiers),
                    ts.createNew(
                        ts.createIdentifier(
                            className(id.resolvedName),
                        ),
                        undefined,
                        [
                            readName,
                        ],
                    ),
                ),
            ]

        case SyntaxType.EnumDefinition:
            return [ defaultAssignment(saveName, readName, fieldType, identifiers) ]

        case SyntaxType.TypedefDefinition:
            return assignmentForFieldType(
                field,
                id.definition.definitionType,
                saveName,
                readName,
                identifiers,
            )

        default:
            const msg: never = id.definition
            throw new Error(`Non-exhaustive match for: ${msg}`)
    }
}

export function assignmentForFieldType(
    field: FieldDefinition,
    fieldType: FunctionType,
    saveName: ts.Identifier,
    readName: ts.Identifier,
    identifiers: IIdentifierMap,
): Array<ts.Statement> {
    switch (fieldType.type) {
        case SyntaxType.Identifier:
            return assignmentForIdentifier(
                field,
                identifiers[fieldType.value],
                fieldType,
                saveName,
                readName,
                identifiers,
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
            return [ defaultAssignment(saveName, readName, fieldType, identifiers) ]
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
                    typeNodeForFieldType(fieldType, identifiers),
                    ts.createNew(
                        COMMON_IDENTIFIERS.Map, // class name
                        [
                            typeNodeForFieldType(fieldType.keyType, identifiers),
                            typeNodeForFieldType(fieldType.valueType, identifiers),
                        ],
                        [],
                    ),
                ),
                ...loopOverContainer(field, fieldType, saveName, readName, identifiers),
            ]
        }

        case SyntaxType.ListType: {
            return [
                createConstStatement(
                    saveName,
                    typeNodeForFieldType(fieldType, identifiers),
                    ts.createNew(
                        COMMON_IDENTIFIERS.Array, // class name
                        [ typeNodeForFieldType(fieldType.valueType, identifiers) ],
                        [],
                    ),
                ),
                ...loopOverContainer(field, fieldType, saveName, readName, identifiers),
            ]
        }

        case SyntaxType.SetType: {
            return [
                createConstStatement(
                    saveName,
                    typeNodeForFieldType(fieldType, identifiers),
                    ts.createNew(
                        COMMON_IDENTIFIERS.Set, // class name
                        [ typeNodeForFieldType(fieldType.valueType, identifiers) ],
                        [],
                    ),
                ),
                ...loopOverContainer(field, fieldType, saveName, readName, identifiers),
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
    identifiers: IIdentifierMap,
): Array<ts.Statement> {
    switch (fieldType.type) {
        case SyntaxType.MapType: {
            const valueParam: ts.Identifier = ts.createUniqueName('value')
            const valueConst: ts.Identifier = ts.createUniqueName('value')
            const keyName: ts.Identifier = ts.createUniqueName('key')
            const keyConst: ts.Identifier = ts.createUniqueName('key')
            return [
                ts.createStatement(ts.createCall(
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
                                    typeNodeForFieldType(fieldType.valueType, identifiers, true), // param type
                                    undefined,
                                ),
                                createFunctionParameter(
                                    keyName, // param name
                                    typeNodeForFieldType(fieldType.keyType, identifiers, true), // param type
                                    undefined,
                                ),
                            ],
                            createVoidType(),
                            ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                            ts.createBlock([
                                ...assignmentForFieldType(field, fieldType.valueType, valueConst, valueParam, identifiers),
                                ...assignmentForFieldType(field, fieldType.keyType, keyConst, keyName, identifiers),
                                createMethodCallStatement(saveName, 'set', [ keyConst, valueConst ]),
                            ], true),
                        ),
                    ],
                )),
            ]
        }

        case SyntaxType.ListType: {
            const valueParam: ts.Identifier = ts.createUniqueName('value')
            const valueConst: ts.Identifier = ts.createUniqueName('value')
            return [
                ts.createStatement(ts.createCall(
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
                                    typeNodeForFieldType(fieldType.valueType, identifiers, true), // param type
                                    undefined,
                                ),
                            ],
                            createVoidType(),
                            ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                            ts.createBlock([
                                ...assignmentForFieldType(field, fieldType.valueType, valueConst, valueParam, identifiers),
                                createMethodCallStatement(saveName, 'push', [ valueConst ]),
                            ], true),
                        ),
                    ],
                )),
            ]
        }

        case SyntaxType.SetType: {
            const valueParam: ts.Identifier = ts.createUniqueName('value')
            const valueConst: ts.Identifier = ts.createUniqueName('value')
            return [
                ts.createStatement(ts.createCall(
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
                                    typeNodeForFieldType(fieldType.valueType, identifiers, true), // param type
                                    undefined,
                                ),
                            ],
                            createVoidType(),
                            ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                            ts.createBlock([
                                ...assignmentForFieldType(field, fieldType.valueType, valueConst, valueParam, identifiers),
                                createMethodCallStatement(saveName, 'add', [ valueConst ]),
                            ], true),
                        ),
                    ],
                )),
            ]
        }
    }
}

/**
 * Assign field if contained in args:
 *
 * if (args && args.<field.name> != null) {
 *   this.<field.name> = args.<field.name>
 * }
 *
 * If field is required throw an error:
 *
 * else {
 *   throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, 'Required field {{fieldName}} is unset!')
 * }
 */
export function createFieldAssignment(field: FieldDefinition, identifiers: IIdentifierMap): ts.IfStatement {
    const hasValue: ts.BinaryExpression = createNotNullCheck(ts.createPropertyAccess(
        COMMON_IDENTIFIERS.args,
        `${field.name.value}`,
    ))
    const thenAssign: Array<ts.Statement> = assignmentForField(field, identifiers)
    const elseThrow: ts.Statement | undefined = throwForField(field)

    return ts.createIf(
        hasValue,
        ts.createBlock([ ...thenAssign ], true),
        (elseThrow === undefined) ? undefined : ts.createBlock([ elseThrow ], true),
    )
}

function createDefaultInitializer(node: InterfaceWithFields): ts.Expression | undefined {
    if (hasRequiredField(node)) {
        return undefined
    } else {
        return ts.createObjectLiteral([])
    }
}

export function createArgsParameterForStruct(node: InterfaceWithFields, identifiers: IIdentifierMap): ts.ParameterDeclaration {
    return createFunctionParameter(
        COMMON_IDENTIFIERS.args, // param name
        createArgsTypeForStruct(node, identifiers), // param type
        createDefaultInitializer(node),
    )
}

function createArgsTypeForStruct(node: InterfaceWithFields, identifiers: IIdentifierMap): ts.TypeNode {
    // return ts.createTypeLiteralNode(
    //     node.fields.map((field: FieldDefinition): ts.TypeElement => {
    //         return ts.createPropertySignature(
    //             undefined,
    //             field.name.value,
    //             renderOptional(field.requiredness),
    //             typeNodeForFieldType(field.fieldType, identifiers, true),
    //             undefined,
    //         )
    //     })
    // )
    return ts.createTypeReferenceNode(
        ts.createIdentifier(looseNameForStruct(node)),
        undefined,
    )
}
