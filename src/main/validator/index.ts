import {
    ConstValue,
    EnumDefinition,
    FieldDefinition,
    FunctionType,
    Identifier,
    PropertyAssignment,
    SyntaxType,
    TextLocation,
    ThriftStatement,
} from '@creditkarma/thrift-parser'

import { createValidationError, IThriftError, ValidationError } from '../errors'
import { resolveConstValue, resolveIdentifierDefinition } from '../resolver'
import { DefinitionType, IResolvedFile, ResolvedFileMap } from '../types'
import { constToTypeString, fieldTypeToString } from './utils'

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
 * The main purpose of the validator is to type-check our Thrift file to make sure it is valid.
 *
 * @param resolvedFile
 * @param files
 * @param sourceDir
 */
export function validateFile(
    resolvedFile: IResolvedFile,
    files: ResolvedFileMap,
    sourceDir: string,
): IResolvedFile {
    const body = resolvedFile.body
    const bodySize: number = body.length
    let currentIndex: number = 0

    const errors: Array<IThriftError> = []

    function validateStatements(): void {
        while (!isAtEnd()) {
            try {
                validateStatement(body[currentIndex])
            } catch (e) {
                errors.push(createValidationError(e.message, e.loc))
            }

            currentIndex += 1
        }
    }

    function isAtEnd(): boolean {
        return currentIndex >= bodySize
    }

    function validateStatement(statement: ThriftStatement): void {
        switch (statement.type) {
            case SyntaxType.NamespaceDefinition:
            case SyntaxType.IncludeDefinition:
            case SyntaxType.CppIncludeDefinition:
            case SyntaxType.EnumDefinition:
            case SyntaxType.TypedefDefinition:
                break

            case SyntaxType.ConstDefinition:
                validateValue(statement.fieldType, statement.initializer)
                break

            case SyntaxType.StructDefinition:
            case SyntaxType.UnionDefinition:
            case SyntaxType.ExceptionDefinition:
                validateFields(statement.fields)
                break

            case SyntaxType.ServiceDefinition:
                validateExtends(statement.extends)
                break

            default:
                const msg: never = statement
                throw new Error(`Non-exhaustive match for ${msg}`)
        }
    }

    function validateExtends(id: Identifier | null): void {
        if (id !== null) {
            const resolvedIdentifier: DefinitionType = resolveIdentifierDefinition(
                id,
                resolvedFile,
                files,
                sourceDir,
            )

            if (resolvedIdentifier.type !== SyntaxType.ServiceDefinition) {
                throw new ValidationError(
                    `Service type expected but found type ${
                        resolvedIdentifier.type
                    }`,
                    id.loc,
                )
            }
        }
    }

    function validateFields(fields: Array<FieldDefinition>): void {
        fields.forEach(
            (field: FieldDefinition): void => {
                if (field.defaultValue !== null) {
                    validateValue(field.fieldType, field.defaultValue)
                }
            },
        )
    }

    function validateEnum(
        enumDef: EnumDefinition,
        constValue: ConstValue,
    ): void {
        if (
            constValue.type !== SyntaxType.Identifier &&
            constValue.type !== SyntaxType.IntConstant
        ) {
            throw new ValidationError(
                `Value of type ${constToTypeString(
                    constValue,
                )} cannot be assigned to type ${enumDef.name.value}`,
                constValue.loc,
            )
        }
    }

    function validateTypeForIdentifier(
        id: Identifier,
        resolvedValue: ConstValue,
        rawValue: ConstValue,
    ): void {
        const definition: DefinitionType = resolveIdentifierDefinition(
            id,
            resolvedFile,
            files,
            sourceDir,
        )
        switch (definition.type) {
            case SyntaxType.ServiceDefinition:
                throw new ValidationError(
                    `Service ${definition.name.value} is being used as a value`,
                    rawValue.loc,
                )

            case SyntaxType.EnumDefinition:
                validateEnum(definition, resolvedValue)
                break

            case SyntaxType.TypedefDefinition:
                validateValue(definition.definitionType, resolvedValue)
                break

            case SyntaxType.ConstDefinition:
                validateValue(definition.fieldType, resolvedValue)
                break

            case SyntaxType.StructDefinition:
            case SyntaxType.UnionDefinition:
            case SyntaxType.ExceptionDefinition:
                throw new ValidationError(
                    `Cannot assign value to type ${definition.name.value}`,
                    rawValue.loc,
                )

            default:
                const msg: never = definition
                throw new Error(`Non-exhaustive match for ${msg}`)
        }
    }

    function validateValue(
        expectedType: FunctionType,
        value: ConstValue,
        rawValue: ConstValue = value,
    ): void {
        const resolvedValue: ConstValue = resolveConstValue(
            value,
            expectedType,
            resolvedFile,
            files,
            sourceDir,
        )

        switch (expectedType.type) {
            case SyntaxType.VoidKeyword:
                throw new ValidationError(
                    `Cannot assign value to type void`,
                    rawValue.loc,
                )

            case SyntaxType.Identifier:
                validateTypeForIdentifier(expectedType, resolvedValue, rawValue)
                break

            case SyntaxType.StringKeyword:
                if (resolvedValue.type !== SyntaxType.StringLiteral) {
                    throw typeMismatch(expectedType, rawValue, rawValue.loc)
                }
                break

            case SyntaxType.BoolKeyword:
                if (resolvedValue.type !== SyntaxType.BooleanLiteral) {
                    throw typeMismatch(expectedType, rawValue, rawValue.loc)
                }
                break

            case SyntaxType.DoubleKeyword:
                if (
                    resolvedValue.type !== SyntaxType.DoubleConstant &&
                    resolvedValue.type !== SyntaxType.IntConstant
                ) {
                    throw typeMismatch(expectedType, rawValue, rawValue.loc)
                }
                break

            case SyntaxType.BinaryKeyword:
                if (resolvedValue.type !== SyntaxType.StringLiteral) {
                    throw typeMismatch(expectedType, rawValue, rawValue.loc)
                }
                break

            case SyntaxType.ByteKeyword:
            case SyntaxType.I8Keyword:
            case SyntaxType.I16Keyword:
            case SyntaxType.I32Keyword:
                if (resolvedValue.type !== SyntaxType.IntConstant) {
                    throw typeMismatch(expectedType, rawValue, rawValue.loc)
                }
                break

            case SyntaxType.I64Keyword:
                if (resolvedValue.type !== SyntaxType.IntConstant) {
                    throw typeMismatch(expectedType, rawValue, rawValue.loc)
                }
                break

            case SyntaxType.SetType:
                if (resolvedValue.type === SyntaxType.ConstList) {
                    resolvedValue.elements.forEach(
                        (next: ConstValue): void => {
                            validateValue(expectedType.valueType, next)
                        },
                    )
                } else {
                    throw typeMismatch(expectedType, rawValue, rawValue.loc)
                }
                break

            case SyntaxType.ListType:
                if (resolvedValue.type === SyntaxType.ConstList) {
                    resolvedValue.elements.forEach(
                        (next: ConstValue): void => {
                            validateValue(expectedType.valueType, next)
                        },
                    )
                } else {
                    throw typeMismatch(expectedType, rawValue, rawValue.loc)
                }
                break

            case SyntaxType.MapType:
                if (resolvedValue.type === SyntaxType.ConstMap) {
                    resolvedValue.properties.forEach(
                        (next: PropertyAssignment): void => {
                            validateValue(expectedType.keyType, next.name)

                            validateValue(
                                expectedType.valueType,
                                next.initializer,
                            )
                        },
                    )
                } else {
                    throw typeMismatch(expectedType, rawValue, rawValue.loc)
                }
                break

            default:
                const msg: never = expectedType
                throw new Error(`Non-exhaustive match for ${msg}`)
        }
    }

    validateStatements()

    return {
        type: 'ResolvedFile',
        sourceFile: resolvedFile.sourceFile,
        namespace: resolvedFile.namespace,
        includedNamespaces: resolvedFile.includedNamespaces,
        namespaceToInclude: resolvedFile.namespaceToInclude,
        includes: resolvedFile.includes,
        exports: resolvedFile.exports,
        body: resolvedFile.body,
        errors,
    }
}
