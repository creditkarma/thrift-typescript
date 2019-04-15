import {
    ConstValue,
    FieldDefinition,
    FunctionDefinition,
    FunctionType,
    NamespaceDefinition,
    PropertyAssignment,
    SyntaxType,
    TextLocation,
    ThriftStatement,
} from '@creditkarma/thrift-parser'

import * as fs from 'fs'
import * as glob from 'glob'
import * as path from 'path'

import {
    IFileIncludes,
    IGeneratedFile,
    IIncludePath,
    INamespaceMap,
    INamespacePath,
    INamespacePathMap,
    IProcessedFile,
    IProcessedFileMap,
    IResolvedFile,
    ISourceFile,
} from './types'

import { print } from './printer'
import { mkdir } from './sys'

export function deepCopy<T extends object>(obj: T): T {
    const newObj: any = Array.isArray(obj) ? [] : {}
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value: any = obj[key]
            if (typeof value === 'object') {
                if (value === null) {
                    newObj[key] = null
                } else {
                    newObj[key] = deepCopy(value)
                }
            } else {
                newObj[key] = value
            }
        }
    }

    return newObj
}

function isObject(obj: any): boolean {
    return obj !== null && typeof obj === 'object'
}

export function deepMerge<Base, Update>(
    base: Base,
    update: Update,
): Base & Update {
    const newObj: any = Array.isArray(base) ? [] : {}
    const baseKeys: Array<string> = Object.keys(base)
    const updateKeys: Array<string> = Object.keys(update)

    for (const key of updateKeys) {
        if (baseKeys.indexOf(key) === -1) {
            baseKeys.push(key)
        }
    }

    for (const key of baseKeys) {
        if (base.hasOwnProperty(key) || update.hasOwnProperty(key)) {
            const baseValue: any = (base as any)[key]
            const updateValue: any = (update as any)[key]

            if (isObject(baseValue) && isObject(updateValue)) {
                newObj[key] = deepMerge(baseValue, updateValue)
            } else if (updateValue !== undefined) {
                newObj[key] = updateValue
            } else {
                newObj[key] = baseValue
            }
        }
    }

    return newObj as Base & Update
}

export function collectSourceFiles(
    sourceDir: string,
    files?: Array<string>,
): Array<string> {
    if (files && files.length > 0) {
        return files
    } else {
        return glob.sync(`${sourceDir}/**/*.thrift`)
    }
}

export function nameForInclude(fullInclude: string): string {
    const body = fullInclude.replace('.thrift', '')
    const parts = body.split('/')
    return parts[parts.length - 1]
}

export function includesForFile(
    body: Array<ThriftStatement>,
    sourceFile: ISourceFile,
): IFileIncludes {
    return body.reduce((acc: IFileIncludes, next: ThriftStatement) => {
        if (next.type === SyntaxType.IncludeDefinition) {
            const includeName = nameForInclude(next.path.value)

            acc[includeName] = {
                type: 'IncludePath',
                path: next.path.value,
                importedFrom: sourceFile.path,
            }
        }

        return acc
    }, {})
}

export function namespaceForInclude<T extends IProcessedFile>(
    include: IIncludePath,
    files: IProcessedFileMap<T>,
    sourceDir: string,
    fallbackNamespace: string,
): INamespacePath {
    const file: T = fileForInclude(include, files, sourceDir)
    const namespace: INamespacePath = namespaceForFile(
        file.body,
        fallbackNamespace,
    )
    return namespace
}

export function fileForInclude<T extends IProcessedFile>(
    include: IIncludePath,
    files: IProcessedFileMap<T>,
    sourceDir: string,
): T {
    // Relative to the file requesting the include
    const optionOne: string = path.resolve(include.importedFrom, include.path)

    // Relative to the source directory
    const optionTwo: string = path.resolve(sourceDir, include.path)

    if (files[optionOne]) {
        return files[optionOne]
    } else if (files[optionTwo]) {
        return files[optionTwo]
    } else {
        throw new Error(`No file for include: ${include.path}`)
    }
}

function createPathForNamespace(ns: string): string {
    return ns.split('.').join('/')
}

export function emptyNamespace(): INamespacePath {
    return {
        type: 'NamespacePath',
        scope: '',
        name: '',
        path: createPathForNamespace(''),
    }
}

export function emptyLocation(): TextLocation {
    return {
        start: { line: 0, column: 0, index: 0 },
        end: { line: 0, column: 0, index: 0 },
    }
}

function collectNamespaces(body: Array<ThriftStatement>): INamespacePathMap {
    return body
        .filter(
            (next: ThriftStatement): next is NamespaceDefinition => {
                return next.type === SyntaxType.NamespaceDefinition
            },
        )
        .reduce((acc: INamespacePathMap, next: NamespaceDefinition) => {
            acc[next.scope.value] = {
                type: 'NamespacePath',
                scope: next.scope.value,
                name: next.name.value,
                path: createPathForNamespace(next.name.value),
            }
            return acc
        }, {})
}

export function namespaceForFile(
    body: Array<ThriftStatement>,
    fallbackNamespace: string,
): INamespacePath {
    const namespaceMap = collectNamespaces(body)
    if (namespaceMap.js) {
        return namespaceMap.js
    } else if (
        fallbackNamespace !== 'none' &&
        namespaceMap[fallbackNamespace]
    ) {
        return namespaceMap[fallbackNamespace]
    } else {
        return emptyNamespace()
    }
}

export function organizeByNamespace(
    files: Array<IResolvedFile>,
): INamespaceMap {
    return files.reduce((acc: INamespaceMap, next: IResolvedFile) => {
        const namespacePath: string = next.namespace.path
        let namespace = acc[namespacePath]
        if (namespace === undefined) {
            namespace = {
                type: 'Namespace',
                namespace: next.namespace,
                includedNamespaces: {},
                files: {},
                exports: {},
                constants: [],
                typedefs: [],
                structs: [],
                unions: [],
                exceptions: [],
                services: [],
            }

            acc[namespacePath] = namespace
        }

        namespace.files[next.sourceFile.fullPath] = next
        namespace.includedNamespaces = {
            ...namespace.includedNamespaces,
            ...next.includedNamespaces,
        }

        next.body.forEach((statement: ThriftStatement) => {
            switch (statement.type) {
                case SyntaxType.ConstDefinition:
                case SyntaxType.EnumDefinition:
                    namespace.constants.push(statement)
                    namespace.exports[statement.name.value] = statement
                    break

                case SyntaxType.TypedefDefinition:
                    namespace.typedefs.push(statement)
                    namespace.exports[statement.name.value] = statement
                    break

                case SyntaxType.StructDefinition:
                    namespace.structs.push(statement)
                    namespace.exports[statement.name.value] = statement
                    break

                case SyntaxType.UnionDefinition:
                    namespace.unions.push(statement)
                    namespace.exports[statement.name.value] = statement
                    break

                case SyntaxType.ExceptionDefinition:
                    namespace.exceptions.push(statement)
                    namespace.exports[statement.name.value] = statement
                    break

                case SyntaxType.ServiceDefinition:
                    namespace.services.push(statement)
                    namespace.exports[statement.name.value] = statement
                    break
            }
        })

        return acc
    }, {})
}

export function collectInvalidFiles<T extends IProcessedFile>(
    resolvedFiles: Array<T>,
    errors: Array<T> = [],
): Array<T> {
    for (const file of resolvedFiles) {
        if (file.errors.length > 0) {
            errors.push(file)
        }
    }

    return errors
}

export function saveFiles(files: Array<IGeneratedFile>, outDir: string): void {
    files.forEach((next: IGeneratedFile) => {
        const outPath: string = path.resolve(
            outDir,
            next.path,
            `${next.name}.ts`,
        )

        mkdir(path.dirname(outPath))

        try {
            fs.writeFileSync(outPath, print(next.body, true))
        } catch (err) {
            throw new Error(`Unable to save generated files to: ${outPath}`)
        }
    })
}

function identifiersForFieldType(
    fieldType: FunctionType,
    results: Set<string>,
): void {
    switch (fieldType.type) {
        case SyntaxType.Identifier:
            results.add(fieldType.value)
            break

        case SyntaxType.MapType:
            identifiersForFieldType(fieldType.keyType, results)
            identifiersForFieldType(fieldType.valueType, results)
            break

        case SyntaxType.SetType:
        case SyntaxType.ListType:
            identifiersForFieldType(fieldType.valueType, results)
            break
    }
}

function identifiersForConstValue(
    constValue: ConstValue | null,
    results: Set<string>,
): void {
    if (constValue !== null) {
        switch (constValue.type) {
            case SyntaxType.Identifier:
                results.add(constValue.value)
                break

            case SyntaxType.ConstList:
                constValue.elements.forEach((next: ConstValue) => {
                    identifiersForConstValue(next, results)
                })
                break

            case SyntaxType.ConstMap:
                constValue.properties.forEach((next: PropertyAssignment) => {
                    identifiersForConstValue(next.name, results)
                    identifiersForConstValue(next.initializer, results)
                })
        }
    }
}

export function identifiersForStatements(
    statements: Array<ThriftStatement>,
): Array<string> {
    const results: Set<string> = new Set()

    statements.forEach((next: ThriftStatement) => {
        switch (next.type) {
            case SyntaxType.IncludeDefinition:
            case SyntaxType.CppIncludeDefinition:
            case SyntaxType.NamespaceDefinition:
            case SyntaxType.EnumDefinition:
                // Ignore
                break

            case SyntaxType.ConstDefinition:
                identifiersForFieldType(next.fieldType, results)
                identifiersForConstValue(next.initializer, results)
                break

            case SyntaxType.TypedefDefinition:
                identifiersForFieldType(next.definitionType, results)
                break

            case SyntaxType.StructDefinition:
            case SyntaxType.UnionDefinition:
            case SyntaxType.ExceptionDefinition:
                next.fields.forEach((field: FieldDefinition) => {
                    identifiersForFieldType(field.fieldType, results)
                    identifiersForConstValue(field.defaultValue, results)
                })
                break

            case SyntaxType.ServiceDefinition:
                if (next.extends) {
                    results.add(next.extends.value)
                }

                next.functions.forEach((func: FunctionDefinition) => {
                    func.fields.forEach((field: FieldDefinition) => {
                        identifiersForFieldType(field.fieldType, results)
                        identifiersForConstValue(field.defaultValue, results)
                    })

                    func.throws.forEach((field: FieldDefinition) => {
                        identifiersForFieldType(field.fieldType, results)
                        identifiersForConstValue(field.defaultValue, results)
                    })

                    identifiersForFieldType(func.returnType, results)
                })

                break

            default:
                const _exhaustiveCheck: never = next
                throw new Error(`Non-exhaustive match for ${_exhaustiveCheck}`)
        }
    })

    return Array.from(results)
}
