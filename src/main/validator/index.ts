import {
    ConstValue,
    createBooleanLiteral,
    EnumDefinition,
    EnumMember,
    FieldDefinition,
    FieldID,
    FieldType,
    FunctionDefinition,
    FunctionType,
    Identifier,
    PropertyAssignment,
    SyntaxType,
    TextLocation,
    ThriftStatement,
} from '@creditkarma/thrift-parser'

import {
    ErrorType,
    IResolvedFile,
    IResolvedIdentifier,
    IThriftError,
} from '../types'

import { constToTypeString, fieldTypeToString } from './utils'

/**
 * Internal class that we will transform into an IThriftError object before passing to the reporter.
 * We create this error class so that we can throw the error to unwind the call stack before
 * handling the error gracefully.
 */
class ValidationError extends Error {
    public message: string
    public loc: TextLocation
    constructor(msg: string, loc: TextLocation) {
        super(msg)
        this.message = msg
        this.loc = loc
    }
}

function createValidationError(
    message: string,
    loc: TextLocation,
): IThriftError {
    return {
        type: ErrorType.ValidationError,
        message,
        loc,
    }
}

function emptyLocation(): TextLocation {
    return {
        start: { line: 0, column: 0, index: 0 },
        end: { line: 0, column: 0, index: 0 },
    }
}

function typeMismatch(
    expected: FunctionType,
    actual: ConstValue,
    loc: TextLocation,
): ValidationError {
    const expectedType: string = fieldTypeToString(expected)
    const actualType: string = constToTypeString(actual)
    return new ValidationError(
        `Expected type ${expectedType} but found type ${actualType}`,
        loc,
    )
}

/**
 * VALIDATOR
 *
 * The job of the validator is to perform checks against the AST that the parser may have allowed pass. Somethings,
 * like type checking, are not part of the language spec, but are still things we can validate through static
 * analysis before allowing the AST to move on to the code generation phase.
 *
 * During this process we are going to be doing three main things.
 *
 * 1. Validate types during field assignemnts. There is no need for us to move on to code generation if the Thrift
 *    file is doing things like this:
 *
 * ```
 * const i32 test = "not valid"
 *
 * // or...
 *
 * struct TestStruct {
 *   1: required string field1 = [ 'one', 'two', 'three' ]
 * }
 * ```
 *
 * 2. Validate field IDs. Check for duplicate IDs. Each structure containing field IDs should have unique IDs.
 *    We also generate field IDs for any fields with null IDs.
 *
 * This should fail:
 *
 * ```
 * struct TestStruct {
 *   1: required string field1
 *   1: i32 field2
 * }
 * ```
 *
 * The AST for this should be rewritten to include field IDs
 *
 * ```
 * struct TestStruct {
 *   required string field1
 *   i32 field2
 * }
 * ```
 *
 * 3. Validate that all identifiers are defined.
 *
 * If "location" is not being included this should fail:
 *
 * ```
 * struct TestStruct {
 *   1: required location.Location loc
 * }
 * ```
 *
 * @param resolvedFile
 */
export function validateFile(resolvedFile: IResolvedFile): IResolvedFile {
    const bodySize: number = resolvedFile.body.length
    let currentIndex: number = 0

    const errors: Array<IThriftError> = []

    function validateStatements(): Array<ThriftStatement> {
        const newBody: Array<ThriftStatement> = []
        while (!isAtEnd()) {
            try {
                const statement = validateStatement(
                    resolvedFile.body[currentIndex],
                )
                newBody.push(statement)
            } catch (e) {
                errors.push(createValidationError(e.message, e.loc))
            }

            currentIndex += 1
        }

        return newBody
    }

    function isAtEnd(): boolean {
        return currentIndex >= bodySize
    }

    function resolveValue(value: ConstValue): ConstValue {
        if (
            value.type === SyntaxType.Identifier &&
            resolvedFile.identifiers[value.value]
        ) {
            const resolvedIdentifier = resolvedFile.identifiers[value.value]
            if (
                resolvedIdentifier.definition.type ===
                SyntaxType.ConstDefinition
            ) {
                if (
                    resolvedIdentifier.definition.initializer.type ===
                    SyntaxType.Identifier
                ) {
                    return resolveValue(
                        resolvedIdentifier.definition.initializer,
                    )
                } else {
                    return resolvedIdentifier.definition.initializer
                }
            } else {
                return value
            }
        } else {
            return value
        }
    }

    function requireIdentifier(
        loc: TextLocation,
        ...names: Array<string>
    ): IResolvedIdentifier {
        for (const name of names) {
            if (resolvedFile.identifiers[name]) {
                return resolvedFile.identifiers[name]
            }
        }

        throw new ValidationError(
            `Unable to resolve type of Identifier ${names[0]}`,
            loc,
        )
    }

    /**
     * The driver behind validating the AST is to loop through the statements of the body and find the pieces
     * that need validation.
     *
     * These are:
     * 1. fieldTypes
     * 2. returnTypes
     * 3. defaultValues
     * 4. initializers
     */
    function validateStatement(statement: ThriftStatement): ThriftStatement {
        switch (statement.type) {
            case SyntaxType.NamespaceDefinition:
            case SyntaxType.IncludeDefinition:
            case SyntaxType.CppIncludeDefinition:
            case SyntaxType.EnumDefinition:
            case SyntaxType.TypedefDefinition:
                return statement

            case SyntaxType.ConstDefinition:
                return {
                    type: SyntaxType.ConstDefinition,
                    name: statement.name,
                    fieldType: statement.fieldType,
                    initializer: validateValue(
                        statement.fieldType,
                        statement.initializer,
                    ),
                    comments: statement.comments,
                    annotations: statement.annotations,
                    loc: statement.loc,
                }

            case SyntaxType.StructDefinition:
                return {
                    type: SyntaxType.StructDefinition,
                    name: statement.name,
                    fields: validateFields(statement.fields),
                    comments: statement.comments,
                    annotations: statement.annotations,
                    loc: statement.loc,
                }

            case SyntaxType.UnionDefinition:
                return {
                    type: SyntaxType.UnionDefinition,
                    name: statement.name,
                    fields: validateFields(statement.fields),
                    comments: statement.comments,
                    annotations: statement.annotations,
                    loc: statement.loc,
                }

            case SyntaxType.ExceptionDefinition:
                return {
                    type: SyntaxType.ExceptionDefinition,
                    name: statement.name,
                    fields: validateFields(statement.fields),
                    comments: statement.comments,
                    annotations: statement.annotations,
                    loc: statement.loc,
                }

            case SyntaxType.ServiceDefinition:
                return {
                    type: SyntaxType.ServiceDefinition,
                    name: statement.name,
                    functions: validateFunctions(statement.functions),
                    extends:
                        statement.extends !== null
                            ? validateExtends(statement.extends)
                            : null,
                    comments: statement.comments,
                    annotations: statement.annotations,
                    loc: statement.loc,
                }

            default:
                const msg: never = statement
                throw new Error(`Non-exhaustive match for ${msg}`)
        }
    }

    function validateExtends(id: Identifier): Identifier {
        const resolvedID: IResolvedIdentifier = requireIdentifier(
            id.loc,
            id.value,
        )
        if (resolvedID.definition.type === SyntaxType.ServiceDefinition) {
            return id
        } else {
            throw new ValidationError(
                `Service type expected but found type ${
                    resolvedID.definition.type
                }`,
                id.loc,
            )
        }
    }

    function valuesForEnum(enumDef: EnumDefinition): Array<number> {
        let previousValue: number = -1
        const values: Array<number | null> = enumDef.members.reduce(
            (
                acc: Array<number | null>,
                next: EnumMember,
            ): Array<number | null> => {
                if (next.initializer !== null) {
                    return [...acc, parseInt(next.initializer.value.value, 10)]
                } else {
                    return [...acc, null]
                }
            },
            [],
        )

        return values.map(
            (next: number | null): number => {
                if (next !== null) {
                    previousValue = next
                    return next
                } else {
                    return ++previousValue
                }
            },
        )
    }

    function enumMembers(enumDef: EnumDefinition): Array<string> {
        return enumDef.members.map(
            (next: EnumMember): string => {
                return next.name.value
            },
        )
    }

    function validateEnum(
        enumName: string,
        enumDef: EnumDefinition,
        constValue: ConstValue,
    ): ConstValue {
        switch (constValue.type) {
            /**
             * If we're dealing with object access (Status.SUCCESS), we just want the base of the identifier (Status)
             */
            case SyntaxType.Identifier:
                const parts = constValue.value.split('.')
                const baseName =
                    parts.length > 2 ? `${parts[0]}.${parts[1]}` : parts[0]
                const accessName = parts[parts.length - 1]
                const resolvedConst: IResolvedIdentifier = requireIdentifier(
                    constValue.loc,
                    baseName,
                    constValue.value,
                )
                if (resolvedConst.resolvedName === enumName) {
                    if (enumMembers(enumDef).indexOf(accessName) > -1) {
                        return constValue
                    } else {
                        throw new ValidationError(
                            `The value ${accessName} is not a member of enum ${
                                enumDef.name.value
                            }`,
                            constValue.loc,
                        )
                    }
                } else {
                    throw new ValidationError(
                        `The value ${
                            resolvedConst.name
                        } is not assignable to type ${enumDef.name.value}`,
                        constValue.loc,
                    )
                }

            /**
             * Thrift does allow us to assign an i32 to a field whose type is that of an enum. However, we need to
             * validate that the assigned value is in the range of the enum.
             */
            case SyntaxType.IntConstant:
                const acceptedValues: Array<number> = valuesForEnum(enumDef)
                const intValue: number = parseInt(constValue.value.value, 10)
                if (acceptedValues.indexOf(intValue) > -1) {
                    return constValue
                } else {
                    throw new ValidationError(
                        `The value ${
                            constValue.value.value
                        } is not assignable to type ${enumDef.name.value}`,
                        constValue.loc,
                    )
                }

            default:
                throw new ValidationError(
                    `Value of type ${constToTypeString(
                        constValue,
                    )} cannot be assigned to type ${enumDef.name.value}`,
                    constValue.loc,
                )
        }
    }

    function validateTypeForIdentifier(
        id: IResolvedIdentifier,
        value: ConstValue,
    ): ConstValue {
        switch (id.definition.type) {
            case SyntaxType.ServiceDefinition:
                throw new ValidationError(
                    `Service ${
                        id.definition.name.value
                    } is being used as a value`,
                    value.loc,
                )

            case SyntaxType.EnumDefinition:
                return validateEnum(id.resolvedName, id.definition, value)

            case SyntaxType.TypedefDefinition:
                return validateValue(id.definition.definitionType, value)

            case SyntaxType.ConstDefinition:
                return validateValue(id.definition.fieldType, value)

            case SyntaxType.StructDefinition:
            case SyntaxType.UnionDefinition:
            case SyntaxType.ExceptionDefinition:
                throw new ValidationError(
                    `Cannot assign value to type ${id.definition.name.value}`,
                    value.loc,
                )

            default:
                const msg: never = id.definition
                throw new Error(`Non-exhaustive match for ${msg}`)
        }
    }

    function validateValue(
        expectedType: FunctionType,
        value: ConstValue,
    ): ConstValue {
        const resolvedValue: ConstValue = resolveValue(value)
        switch (expectedType.type) {
            case SyntaxType.VoidKeyword:
                throw new ValidationError(
                    `Cannot assign value to type void`,
                    resolvedValue.loc,
                )

            case SyntaxType.Identifier:
                return validateTypeForIdentifier(
                    requireIdentifier(expectedType.loc, expectedType.value),
                    resolvedValue,
                )

            case SyntaxType.StringKeyword:
                if (resolvedValue.type === SyntaxType.StringLiteral) {
                    return value
                } else {
                    throw typeMismatch(
                        expectedType,
                        resolvedValue,
                        resolvedValue.loc,
                    )
                }

            case SyntaxType.BoolKeyword:
                if (resolvedValue.type === SyntaxType.BooleanLiteral) {
                    return resolvedValue

                    // Handle the case where the literal values 1 or 0 can be used to represent booleans
                } else if (
                    resolvedValue.type === SyntaxType.IntConstant &&
                    (resolvedValue.value.value === '0' ||
                        resolvedValue.value.value === '1')
                ) {
                    return createBooleanLiteral(
                        resolvedValue.value.value === '1',
                        resolvedValue.loc,
                    )
                } else {
                    throw typeMismatch(
                        expectedType,
                        resolvedValue,
                        resolvedValue.loc,
                    )
                }

            case SyntaxType.DoubleKeyword:
                if (
                    resolvedValue.type === SyntaxType.DoubleConstant ||
                    resolvedValue.type === SyntaxType.IntConstant
                ) {
                    return resolvedValue
                } else {
                    throw typeMismatch(expectedType, value, value.loc)
                }

            case SyntaxType.BinaryKeyword:
                if (resolvedValue.type === SyntaxType.StringLiteral) {
                    return value
                } else {
                    throw typeMismatch(
                        expectedType,
                        resolvedValue,
                        resolvedValue.loc,
                    )
                }

            case SyntaxType.ByteKeyword:
            case SyntaxType.I8Keyword:
            case SyntaxType.I16Keyword:
            case SyntaxType.I32Keyword:
                if (resolvedValue.type === SyntaxType.IntConstant) {
                    return resolvedValue
                } else {
                    throw typeMismatch(
                        expectedType,
                        resolvedValue,
                        resolvedValue.loc,
                    )
                }

            case SyntaxType.I64Keyword:
                if (resolvedValue.type === SyntaxType.IntConstant) {
                    return resolvedValue
                } else {
                    throw typeMismatch(
                        expectedType,
                        resolvedValue,
                        resolvedValue.loc,
                    )
                }

            case SyntaxType.SetType:
                if (resolvedValue.type === SyntaxType.ConstList) {
                    return {
                        type: SyntaxType.ConstList,
                        elements: resolvedValue.elements.map(
                            (next: ConstValue): ConstValue => {
                                return validateValue(
                                    expectedType.valueType,
                                    next,
                                )
                            },
                        ),
                        loc: resolvedValue.loc,
                    }
                } else {
                    throw typeMismatch(
                        expectedType,
                        resolvedValue,
                        resolvedValue.loc,
                    )
                }

            case SyntaxType.ListType:
                if (resolvedValue.type === SyntaxType.ConstList) {
                    return {
                        type: SyntaxType.ConstList,
                        elements: resolvedValue.elements.map(
                            (next: ConstValue): ConstValue => {
                                return validateValue(
                                    expectedType.valueType,
                                    next,
                                )
                            },
                        ),
                        loc: resolvedValue.loc,
                    }
                } else {
                    throw typeMismatch(
                        expectedType,
                        resolvedValue,
                        resolvedValue.loc,
                    )
                }

            case SyntaxType.MapType:
                if (resolvedValue.type === SyntaxType.ConstMap) {
                    return {
                        type: SyntaxType.ConstMap,
                        properties: resolvedValue.properties.map(
                            (next: PropertyAssignment): PropertyAssignment => {
                                return {
                                    type: SyntaxType.PropertyAssignment,
                                    name: validateValue(
                                        expectedType.keyType,
                                        next.name,
                                    ),
                                    initializer: validateValue(
                                        expectedType.valueType,
                                        next.initializer,
                                    ),
                                    loc: next.loc,
                                }
                            },
                        ),
                        loc: value.loc,
                    }
                } else {
                    throw typeMismatch(expectedType, value, value.loc)
                }

            default:
                const msg: never = expectedType
                throw new Error(`Non-exhaustive match for ${msg}`)
        }
    }

    function validateFunctionType(functionType: FunctionType): FunctionType {
        switch (functionType.type) {
            case SyntaxType.VoidKeyword:
                return functionType

            default:
                return validateFieldType(functionType)
        }
    }

    function validateFieldType(fieldType: FieldType): FieldType {
        switch (fieldType.type) {
            case SyntaxType.Identifier:
                if (requireIdentifier(fieldType.loc, fieldType.value) != null) {
                    return fieldType
                } else {
                    throw new ValidationError(
                        `Unable to resolve type of identifier ${
                            fieldType.value
                        }`,
                        fieldType.loc,
                    )
                }

            case SyntaxType.MapType:
                return {
                    type: SyntaxType.MapType,
                    keyType: validateFieldType(fieldType.keyType),
                    valueType: validateFieldType(fieldType.valueType),
                    loc: fieldType.loc,
                }

            case SyntaxType.ListType:
                return {
                    type: SyntaxType.ListType,
                    valueType: validateFieldType(fieldType.valueType),
                    loc: fieldType.loc,
                }

            case SyntaxType.SetType:
                return {
                    type: SyntaxType.SetType,
                    valueType: validateFieldType(fieldType.valueType),
                    loc: fieldType.loc,
                }

            default:
                return fieldType
        }
    }

    function validateFields(
        fields: Array<FieldDefinition>,
    ): Array<FieldDefinition> {
        let generatedFieldID: number = 0
        const usedFieldIDs: Array<number> = []

        function validateFieldID(fieldID: FieldID | null): FieldID {
            if (fieldID === null) {
                return {
                    type: SyntaxType.FieldID,
                    value: --generatedFieldID,
                    loc: emptyLocation(),
                }
            } else if (fieldID.value < 0) {
                throw new ValidationError(
                    `Field IDs should be positive integers, found ${
                        fieldID.value
                    }`,
                    fieldID.loc,
                )
            } else if (usedFieldIDs.indexOf(fieldID.value) > -1) {
                throw new ValidationError(
                    `Found duplicate usage of fieldID: ${fieldID.value}`,
                    fieldID.loc,
                )
            } else {
                usedFieldIDs.push(fieldID.value)
                return fieldID
            }
        }

        return fields.map(
            (field: FieldDefinition): FieldDefinition => {
                return {
                    type: SyntaxType.FieldDefinition,
                    name: field.name,
                    fieldID: validateFieldID(field.fieldID),
                    fieldType: validateFunctionType(field.fieldType),
                    requiredness: field.requiredness,
                    defaultValue:
                        field.defaultValue !== null
                            ? validateValue(field.fieldType, field.defaultValue)
                            : null,
                    comments: field.comments,
                    annotations: field.annotations,
                    loc: field.loc,
                }
            },
        )
    }

    function validateFunctions(
        funcs: Array<FunctionDefinition>,
    ): Array<FunctionDefinition> {
        return funcs.map(
            (func: FunctionDefinition): FunctionDefinition => {
                if (
                    func.oneway &&
                    func.returnType.type !== SyntaxType.VoidKeyword
                ) {
                    throw new ValidationError(
                        `Oneway function must have return type of void, instead found ${fieldTypeToString(
                            func.returnType,
                        )}`,
                        func.loc,
                    )
                }

                return {
                    type: SyntaxType.FunctionDefinition,
                    name: func.name,
                    oneway: func.oneway,
                    returnType: validateFunctionType(func.returnType),
                    fields: validateFields(
                        func.fields.map((next: FieldDefinition) => {
                            next.requiredness =
                                next.requiredness === 'optional'
                                    ? 'optional'
                                    : 'required'
                            return next
                        }),
                    ),
                    throws: validateFields(
                        func.throws.map((next: FieldDefinition) => {
                            next.requiredness =
                                next.requiredness === 'optional'
                                    ? 'optional'
                                    : 'required'
                            return next
                        }),
                    ),
                    modifiers: func.modifiers,
                    comments: func.comments,
                    annotations: func.annotations,
                    loc: func.loc,
                }
            },
        )
    }

    return {
        name: resolvedFile.name,
        path: resolvedFile.path,
        source: resolvedFile.source,
        namespace: resolvedFile.namespace,
        includes: resolvedFile.includes,
        identifiers: resolvedFile.identifiers,
        body: validateStatements(),
        errors,
    }
}
