import {
    ConstValue,
    createBooleanLiteral,
    FunctionType,
    Identifier,
    PropertyAssignment,
    SyntaxType,
    ThriftStatement,
} from '@creditkarma/thrift-parser'

import {
    DefinitionType,
    IFileExports,
    IIncludePath,
    INamespace,
    INamespaceMap,
    INamespacePath,
    IParsedFile,
    IProcessedFile,
    IProcessedFileMap,
    IRenderState,
    IResolvedFile,
    IResolvedIdentifier,
    ParsedFileMap,
    ResolvedFileMap,
} from '../types'

import { ValidationError } from '../errors'
import { emptyLocation, fileForInclude } from '../utils'

// Give some thrift statements this generates a map of the name of those statements to the
// definition of that statement
export function exportsForFile(body: Array<ThriftStatement>): IFileExports {
    return body.reduce((acc: IFileExports, next: ThriftStatement) => {
        switch (next.type) {
            case SyntaxType.TypedefDefinition:
            case SyntaxType.ConstDefinition:
            case SyntaxType.EnumDefinition:
            case SyntaxType.UnionDefinition:
            case SyntaxType.ExceptionDefinition:
            case SyntaxType.StructDefinition:
            case SyntaxType.ServiceDefinition:
                acc[next.name.value] = next
                break

            default:
                // Ignore
                break
        }

        return acc
    }, {})
}

function stubIdentifier(value: string): Identifier {
    return {
        type: SyntaxType.Identifier,
        value,
        annotations: undefined,
        loc: emptyLocation(),
    }
}

// Given an identifier and the parsed file where the identifier is being used find
// the definition of the identifier
function resolveIdentifierFromParsedFile(
    id: Identifier,
    currentFile: IParsedFile,
    files: ParsedFileMap,
    sourceDir: string,
): DefinitionType {
    const [head, ...tail] = id.value.split('.')
    if (currentFile.exports[head] !== undefined) {
        const definition: DefinitionType = currentFile.exports[head]
        if (definition.type === SyntaxType.TypedefDefinition) {
            if (definition.definitionType.type === SyntaxType.Identifier) {
                return resolveIdentifierFromParsedFile(
                    definition.definitionType,
                    currentFile,
                    files,
                    sourceDir,
                )
            } else {
                return definition
            }
        } else {
            return definition
        }
    } else if (currentFile.includes[head] !== undefined) {
        const include: IIncludePath | undefined = currentFile.includes[head]
        if (include !== undefined) {
            // The next file to look in for the definition of this constant
            const nextFile: IParsedFile = fileForInclude(
                include,
                files,
                sourceDir,
            )

            return resolveIdentifierFromParsedFile(
                stubIdentifier(tail.join('.')),
                nextFile,
                files,
                sourceDir,
            )
        }
    }

    throw new ValidationError(
        `Unable to resolve identifier[${id.value}] in parsed file[${
            currentFile.sourceFile.fullPath
        }]`,
        id.loc,
    )
}

// Given an identifier and the resolved file where the identifier is being used find
// the definition of the identifier
function resolveIdentifierFromResolvedFile(
    id: Identifier,
    currentFile: IResolvedFile,
    files: ResolvedFileMap,
    sourceDir: string,
): DefinitionType {
    // The head of the identifier can be one of two things. It can be an identifier defined in this file,
    // or it can be an include path.
    const [head, ...tail] = id.value.split('.')
    if (currentFile.exports[head] !== undefined) {
        const definition: DefinitionType = currentFile.exports[head]
        if (definition.type === SyntaxType.TypedefDefinition) {
            if (definition.definitionType.type === SyntaxType.Identifier) {
                return resolveIdentifierFromResolvedFile(
                    definition.definitionType,
                    currentFile,
                    files,
                    sourceDir,
                )
            } else {
                return definition
            }
        } else {
            return definition
        }
    } else if (currentFile.namespaceToInclude[head] !== undefined) {
        const includeName: string = currentFile.namespaceToInclude[head]
        const include: IIncludePath | undefined =
            currentFile.includes[includeName]
        if (include !== undefined) {
            // The next file to look in for the definition of this constant
            const nextFile: IResolvedFile = fileForInclude(
                include,
                files,
                sourceDir,
            )

            return resolveIdentifierFromResolvedFile(
                stubIdentifier(tail.join('.')),
                nextFile,
                files,
                sourceDir,
            )
        }
    }

    throw new ValidationError(
        `Unable to resolve identifier[${id.value}] in resolved file[${
            currentFile.sourceFile.fullPath
        }]`,
        id.loc,
    )
}

// Given an identifier and the namespace where the identifier is being used find
// the definition of the identifier
function resolveIdentifierFromNamespace(
    id: Identifier,
    currentNamespace: INamespace,
    namespaces: INamespaceMap,
    sourceDir: string,
): DefinitionType {
    if (currentNamespace.exports[id.value]) {
        const definition: DefinitionType = currentNamespace.exports[id.value]
        if (definition.type === SyntaxType.TypedefDefinition) {
            if (definition.definitionType.type === SyntaxType.Identifier) {
                return resolveIdentifierFromNamespace(
                    definition.definitionType,
                    currentNamespace,
                    namespaces,
                    sourceDir,
                )
            } else {
                return definition
            }
        } else {
            return definition
        }
    } else {
        const [head, ...tail] = id.value.split('.')
        const namespace: INamespacePath =
            currentNamespace.includedNamespaces[head]

        if (namespace !== undefined) {
            const nextNamespace: INamespace = namespaces[namespace.path]

            return resolveIdentifierFromNamespace(
                stubIdentifier(tail.join('.')),
                nextNamespace,
                namespaces,
                sourceDir,
            )
        }

        throw new ValidationError(
            `Unable to resolve identifier[${id.value}] in namespace[${
                currentNamespace.namespace.path
            }]`,
            id.loc,
        )
    }
}

export function resolveIdentifierDefinition(
    id: Identifier,
    currentFile: IParsedFile,
    files: ParsedFileMap,
    sourceDir: string,
): DefinitionType
export function resolveIdentifierDefinition(
    id: Identifier,
    currentFile: IResolvedFile,
    files: ResolvedFileMap,
    sourceDir: string,
): DefinitionType
export function resolveIdentifierDefinition(
    id: Identifier,
    currentNamespace: INamespace,
    namespaces: INamespaceMap,
    sourceDir: string,
): DefinitionType
export function resolveIdentifierDefinition(
    id: Identifier,
    currentFile: any,
    files: any,
    sourceDir: string,
): DefinitionType {
    if (currentFile.type === 'ParsedFile') {
        return resolveIdentifierFromParsedFile(
            id,
            currentFile,
            files,
            sourceDir,
        )
    } else if (currentFile.type === 'ResolvedFile') {
        return resolveIdentifierFromResolvedFile(
            id,
            currentFile,
            files,
            sourceDir,
        )
    } else {
        return resolveIdentifierFromNamespace(id, currentFile, files, sourceDir)
    }
}

// Given the name of an identifier and the state in which that file is being rendered return the name that
// should be used for the identifier in the given context.
export function resolveIdentifierName(
    name: string,
    state: IRenderState,
): IResolvedIdentifier {
    const currentNamespace: INamespace = state.currentNamespace
    const [pathName, base, ...tail] = name.split('.')
    let baseName: string = pathName

    if (base !== undefined) {
        baseName = [base, ...tail].join('.')
    }

    if (currentNamespace.exports[pathName]) {
        if (state.currentDefinitions[pathName]) {
            return {
                rawName: name,
                name: pathName,
                baseName,
                pathName: undefined,
                fullName: name,
            }
        } else {
            return {
                rawName: name,
                name: pathName,
                baseName,
                pathName: '__NAMESPACE__',
                fullName: `__NAMESPACE__.${name}`,
            }
        }
    }

    const namespace = currentNamespace.includedNamespaces[pathName]

    if (namespace !== undefined) {
        return {
            rawName: name,
            name: base,
            baseName,
            pathName,
            fullName: name,
        }
    }

    if (base === undefined) {
        return {
            rawName: name,
            name: pathName,
            baseName,
            pathName: undefined,
            fullName: name,
        }
    }

    throw new Error(`Unable to resolve identifier[${name}]`)
}

/**
 * It makes things easier to rewrite all const values to their literal values.
 * For example you can use the identifier of a constant as the initializer of another constant
 * or the default value of a field in a struct.
 *
 * const i32 VALUE = 32
 * cosnt list<i32> LIST = [ VALUE ]
 *
 * This can be safely rewritten to:
 *
 * const i32 VALUE = 32
 * const list<i32> LIST = [ 32 ]
 *
 * This is blunt, but it makes type-checking later very easy.
 */
export function resolveConstValue<T extends IProcessedFile>(
    value: ConstValue,
    fieldType: FunctionType,
    currentFile: T,
    files: IProcessedFileMap<T>,
    sourceDir: string,
): ConstValue {
    switch (value.type) {
        case SyntaxType.IntConstant:
            if (fieldType.type === SyntaxType.BoolKeyword) {
                if (value.value.value === '1' || value.value.value === '0') {
                    return createBooleanLiteral(
                        value.value.value === '1',
                        value.loc,
                    )
                } else {
                    throw new ValidationError(
                        `Can only assign booleans to the int values '1' or '0'`,
                        value.loc,
                    )
                }
            } else {
                return value
            }

        case SyntaxType.Identifier:
            const [head, ...tail] = value.value.split('.')
            if (currentFile.exports[head]) {
                const statement: ThriftStatement = currentFile.exports[head]
                if (statement.type === SyntaxType.ConstDefinition) {
                    return resolveConstValue(
                        statement.initializer,
                        fieldType,
                        currentFile,
                        files,
                        sourceDir,
                    )
                } else {
                    return value
                }
            } else {
                const include: IIncludePath | undefined =
                    currentFile.includes[head]
                if (include !== undefined) {
                    // The next file to look in for the definition of this constant
                    const nextFile: T = fileForInclude(
                        include,
                        files,
                        sourceDir,
                    )

                    return resolveConstValue(
                        stubIdentifier(tail.join('.')),
                        fieldType,
                        nextFile,
                        files,
                        sourceDir,
                    )
                }
            }
            throw new ValidationError(
                `Unable to resolve value of identifier[${value.value}]`,
                value.loc,
            )

        case SyntaxType.ConstMap:
            return {
                type: SyntaxType.ConstMap,
                properties: value.properties.map(
                    (next: PropertyAssignment): PropertyAssignment => {
                        return {
                            type: SyntaxType.PropertyAssignment,
                            name: resolveConstValue(
                                next.name,
                                fieldType,
                                currentFile,
                                files,
                                sourceDir,
                            ),
                            initializer: resolveConstValue(
                                next.initializer,
                                fieldType,
                                currentFile,
                                files,
                                sourceDir,
                            ),
                            loc: next.loc,
                        }
                    },
                ),
                loc: value.loc,
            }

        case SyntaxType.ConstList:
            return {
                type: SyntaxType.ConstList,
                elements: value.elements.map(
                    (next: ConstValue): ConstValue => {
                        return resolveConstValue(
                            next,
                            fieldType,
                            currentFile,
                            files,
                            sourceDir,
                        )
                    },
                ),
                loc: value.loc,
            }

        default:
            return value
    }
}
