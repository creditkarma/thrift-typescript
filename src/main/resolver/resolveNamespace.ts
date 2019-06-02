import {
    BaseType,
    ConstValue,
    EnumMember,
    FieldDefinition,
    FieldID,
    FieldType,
    FunctionDefinition,
    FunctionType,
    Identifier,
    IntConstant,
    SyntaxType,
} from '@creditkarma/thrift-parser'

import {
    DefinitionType,
    INamespace,
    INamespaceMap,
    INamespacePath,
} from '../types'

import { createValidationError, IThriftError, ValidationError } from '../errors'

import { emptyLocation } from '../utils'

import { resolveConstValue } from './resolveConstValue'
import { resolveIdentifierDefinition } from './resolveIdentifierDefinition'

/**
 * What do you mean, resolve file?
 *
 * There are a few things we need to do to resolve a file.
 *
 * 1. We need to resolve the value of all the identifiers in a given file.
 *
 * 2. We need to keep track of all the namespaces being used in this file.
 *
 * 3. We need to rewrite the paths for imported identifiers.
 *
 *      For example, if a identifier is being imported from another file such as "operation.Operation", we
 *      need to rewrite this so that the file path is replaced with the namespace path such as
 *      "com_test_operation.Operation"
 *
 * 4. We need to rewrite indetifiers that point to primitive constants with the primitive value.
 *
 * 5. We need to make sure every field has an ID
 *
 * 6. We need to rewrite all enum members with an initiaizer
 *
 *
 * @param parsedFile
 * @param files
 * @param sourceDir
 * @param options
 */
export function resolveNamespace(
    currentNamespace: INamespace,
    namespaceMap: INamespaceMap,
): INamespace {
    const statements: Array<DefinitionType> = Object.keys(
        currentNamespace.exports,
    ).map((next: string) => {
        return currentNamespace.exports[next]
    })

    const bodySize: number = statements.length
    let currentIndex: number = 0

    const errors: Array<IThriftError> = []

    function resolveStatements(): Array<DefinitionType> {
        const newBody: Array<DefinitionType> = []

        while (!isAtEnd()) {
            try {
                const statement = resolveStatement(statements[currentIndex])

                if (statement !== null) {
                    newBody.push(statement)
                }
            } catch (err) {
                errors.push(createValidationError(err.message, err.loc))
            }

            currentIndex += 1
        }

        return newBody
    }

    function isAtEnd(): boolean {
        return currentIndex >= bodySize
    }

    function resolveStatement(
        statement: DefinitionType,
    ): DefinitionType | null {
        switch (statement.type) {
            case SyntaxType.TypedefDefinition:
                return {
                    type: SyntaxType.TypedefDefinition,
                    name: statement.name,
                    definitionType: resolveFieldType(statement.definitionType),
                    annotations: statement.annotations,
                    comments: statement.comments,
                    loc: statement.loc,
                }

            case SyntaxType.ConstDefinition:
                return {
                    type: SyntaxType.ConstDefinition,
                    name: statement.name,
                    fieldType: resolveFieldType(statement.fieldType),
                    initializer: resolveValue(
                        statement.initializer,
                        statement.fieldType,
                    ),
                    comments: statement.comments,
                    annotations: statement.annotations,
                    loc: statement.loc,
                }

            case SyntaxType.EnumDefinition:
                return {
                    type: SyntaxType.EnumDefinition,
                    name: statement.name,
                    members: resolveEnumMembers(statement.members),
                    comments: statement.comments,
                    annotations: statement.annotations,
                    loc: statement.loc,
                }

            case SyntaxType.StructDefinition:
                return {
                    type: SyntaxType.StructDefinition,
                    name: statement.name,
                    fields: resolveFields(statement.fields),
                    comments: statement.comments,
                    annotations: statement.annotations,
                    loc: statement.loc,
                }

            case SyntaxType.UnionDefinition:
                return {
                    type: SyntaxType.UnionDefinition,
                    name: statement.name,
                    fields: resolveFields(statement.fields),
                    comments: statement.comments,
                    annotations: statement.annotations,
                    loc: statement.loc,
                }

            case SyntaxType.ExceptionDefinition:
                return {
                    type: SyntaxType.ExceptionDefinition,
                    name: statement.name,
                    fields: resolveFields(statement.fields),
                    comments: statement.comments,
                    annotations: statement.annotations,
                    loc: statement.loc,
                }

            case SyntaxType.ServiceDefinition:
                return {
                    type: SyntaxType.ServiceDefinition,
                    name: statement.name,
                    functions: resolveFunctions(statement.functions),
                    extends:
                        statement.extends === null
                            ? null
                            : resolveIdentifier(statement.extends),
                    comments: statement.comments,
                    annotations: statement.annotations,
                    loc: statement.loc,
                }

            default:
                const msg: never = statement
                throw new Error(`Non-exhaustive match for ${msg}`)
        }
    }

    function resolveIdentifier(id: Identifier): Identifier {
        return {
            type: SyntaxType.Identifier,
            value: resolveName(id.value),
            annotations: id.annotations,
            loc: id.loc,
        }
    }

    function resolveName(name: string): string {
        const [head, ...tail] = name.split('.')

        if (currentNamespace.exports[head] !== undefined) {
            return name
        } else if (currentNamespace.includedNamespaces[head] !== undefined) {
            const namespacePath: INamespacePath =
                currentNamespace.includedNamespaces[head]
            return [namespacePath.accessor, ...tail].join('.')
        } else if (currentNamespace.namespaceIncludes[head]) {
            const namespaceAccessor: string =
                currentNamespace.namespaceIncludes[head]
            return [namespaceAccessor, ...tail].join('.')
        } else {
            return name
        }
    }

    function resolveFunctionType(fieldType: FunctionType): FunctionType {
        switch (fieldType.type) {
            case SyntaxType.VoidKeyword:
                return fieldType

            default:
                return resolveFieldType(fieldType)
        }
    }

    function isBaseType(fieldType: FieldType): fieldType is BaseType {
        switch (fieldType.type) {
            case SyntaxType.I8Keyword:
            case SyntaxType.I16Keyword:
            case SyntaxType.I32Keyword:
            case SyntaxType.I64Keyword:
            case SyntaxType.StringKeyword:
            case SyntaxType.BinaryKeyword:
                return true
            default:
                return false
        }
    }

    function resolveFieldType(fieldType: FieldType): FieldType {
        switch (fieldType.type) {
            /**
             * An Identifier can refer to either a container type or an alias to another
             * type. Here we check for the typedef case and resolve to the base type in that
             * case.
             */
            case SyntaxType.Identifier:
                const definition = resolveIdentifierDefinition(fieldType, {
                    currentNamespace,
                    namespaceMap,
                })

                if (
                    definition.type === SyntaxType.TypedefDefinition &&
                    isBaseType(definition.definitionType)
                ) {
                    return definition.definitionType
                } else {
                    return resolveIdentifier(fieldType)
                }

            case SyntaxType.ListType:
                return {
                    type: SyntaxType.ListType,
                    valueType: resolveFieldType(fieldType.valueType),
                    annotations: fieldType.annotations,
                    loc: fieldType.loc,
                }

            case SyntaxType.SetType:
                return {
                    type: SyntaxType.SetType,
                    valueType: resolveFieldType(fieldType.valueType),
                    annotations: fieldType.annotations,
                    loc: fieldType.loc,
                }

            case SyntaxType.MapType:
                return {
                    type: SyntaxType.MapType,
                    valueType: resolveFieldType(fieldType.valueType),
                    keyType: resolveFieldType(fieldType.keyType),
                    annotations: fieldType.annotations,
                    loc: fieldType.loc,
                }

            default:
                return fieldType
        }
    }

    function resolveEnumMembers(
        enumMembers: Array<EnumMember>,
    ): Array<EnumMember> {
        let previousValue: number = -1

        return enumMembers.map(
            (next: EnumMember): EnumMember => {
                let initializer: IntConstant

                if (next.initializer !== null) {
                    previousValue = parseInt(next.initializer.value.value, 10)
                    initializer = next.initializer
                } else {
                    initializer = {
                        type: SyntaxType.IntConstant,
                        value: {
                            type: SyntaxType.IntegerLiteral,
                            value: `${++previousValue}`,
                            loc: emptyLocation(),
                        },
                        loc: emptyLocation(),
                    }
                }

                return {
                    type: SyntaxType.EnumMember,
                    name: next.name,
                    initializer,
                    comments: next.comments,
                    annotations: next.annotations,
                    loc: next.loc,
                }
            },
        )
    }

    function resolveValue(
        value: ConstValue,
        fieldType: FunctionType,
    ): ConstValue {
        const resolvedValue: ConstValue = resolveConstValue(value, fieldType, {
            currentNamespace,
            namespaceMap,
        })

        if (resolvedValue.type === SyntaxType.Identifier) {
            return resolveIdentifier(resolvedValue)
        } else {
            return resolvedValue
        }
    }

    function resolveFields(
        fields: Array<FieldDefinition>,
    ): Array<FieldDefinition> {
        let generatedFieldID: number = 0
        const usedFieldIDs: Array<number> = []

        function resolveFieldID(fieldID: FieldID | null): FieldID {
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
                    fieldID: resolveFieldID(field.fieldID),
                    fieldType: resolveFunctionType(field.fieldType),
                    requiredness: field.requiredness,
                    defaultValue:
                        field.defaultValue === null
                            ? null
                            : resolveValue(field.defaultValue, field.fieldType),
                    comments: field.comments,
                    annotations: field.annotations,
                    loc: field.loc,
                }
            },
        )
    }

    function resolveFunctions(
        funcs: Array<FunctionDefinition>,
    ): Array<FunctionDefinition> {
        return funcs.map(
            (func: FunctionDefinition): FunctionDefinition => {
                return {
                    type: SyntaxType.FunctionDefinition,
                    name: func.name,
                    oneway: func.oneway,
                    returnType: resolveFunctionType(func.returnType),
                    fields: resolveFields(
                        func.fields.map((next: FieldDefinition) => {
                            next.requiredness =
                                next.requiredness === 'optional'
                                    ? 'optional'
                                    : 'required'
                            return next
                        }),
                    ),
                    throws: resolveFields(
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

    const newNamespace: INamespace = {
        type: 'Namespace',
        namespace: currentNamespace.namespace,
        exports: {},
        includedNamespaces: currentNamespace.includedNamespaces,
        namespaceIncludes: currentNamespace.namespaceIncludes,
        errors: [],
        constants: [],
        enums: [],
        typedefs: [],
        structs: [],
        unions: [],
        exceptions: [],
        services: [],
    }

    resolveStatements().forEach((next: DefinitionType) => {
        newNamespace.exports[next.name.value] = next

        switch (next.type) {
            case SyntaxType.ConstDefinition:
                newNamespace.constants.push(next)
                break
            case SyntaxType.TypedefDefinition:
                newNamespace.typedefs.push(next)
                break
            case SyntaxType.EnumDefinition:
                newNamespace.enums.push(next)
                break
            case SyntaxType.StructDefinition:
                newNamespace.structs.push(next)
                break
            case SyntaxType.UnionDefinition:
                newNamespace.unions.push(next)
                break
            case SyntaxType.ExceptionDefinition:
                newNamespace.exceptions.push(next)
                break
            case SyntaxType.ServiceDefinition:
                newNamespace.services.push(next)
                break
        }
    })

    newNamespace.errors = errors

    return newNamespace
}
