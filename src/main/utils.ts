import {
    NamespaceDefinition,
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
    IParsedFile,
    IParsedFileMap,
    ISourceFile,
} from './types'

import { print } from './printer'
import { mkdir } from './sys'

export function valuesForObject<T>(obj: { [key: string]: T }): Array<T> {
    return Object.keys(obj).map((next: string) => {
        return obj[next]
    })
}

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
    fileBody: Array<ThriftStatement>,
    sourceFile: ISourceFile,
): IFileIncludes {
    return fileBody.reduce((acc: IFileIncludes, next: ThriftStatement) => {
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

function fileForInclude(
    includePath: IIncludePath,
    fileMap: IParsedFileMap,
    sourceDir: string,
): IParsedFile {
    // Relative to the file requesting the include
    const relativeToFile: string = path.resolve(
        includePath.importedFrom,
        includePath.path,
    )

    // Relative to the source directory
    const relativeToRoot: string = path.resolve(sourceDir, includePath.path)

    if (fileMap[relativeToFile]) {
        return fileMap[relativeToFile]
    } else if (fileMap[relativeToRoot]) {
        return fileMap[relativeToRoot]
    } else {
        throw new Error(`No file for include: ${includePath.path}`)
    }
}

export function namespaceForInclude(
    includePath: IIncludePath,
    fileMap: IParsedFileMap,
    sourceDir: string,
    fallbackNamespace: string,
): INamespacePath {
    const file: IParsedFile = fileForInclude(includePath, fileMap, sourceDir)
    const namespace: INamespacePath = namespaceForFile(
        file.body,
        fallbackNamespace,
    )

    return namespace
}

function createPathForNamespace(ns: string): string {
    return ns.split('.').join('/')
}

export function emptyNamespace(): INamespacePath {
    return {
        type: 'NamespacePath',
        scope: '',
        name: '__ROOT_NAMESPACE__',
        path: createPathForNamespace(''),
        accessor: '__ROOT_NAMESPACE__',
    }
}

export function emptyLocation(): TextLocation {
    return {
        start: { line: 0, column: 0, index: 0 },
        end: { line: 0, column: 0, index: 0 },
    }
}

function resolveNamespaceAccessor(namespaceName: string): string {
    return namespaceName
        .split('')
        .map((next: string) => {
            if (next === '.') {
                return '_'
            } else {
                return next
            }
        })
        .join('')
}

function collectNamespaces(
    fileBody: Array<ThriftStatement>,
): INamespacePathMap {
    return fileBody
        .filter(
            (next: ThriftStatement): next is NamespaceDefinition => {
                return next.type === SyntaxType.NamespaceDefinition
            },
        )
        .reduce((acc: INamespacePathMap, def: NamespaceDefinition) => {
            const includeAccessor: string = resolveNamespaceAccessor(
                def.name.value,
            )

            acc[def.scope.value] = {
                type: 'NamespacePath',
                scope: def.scope.value,
                name: def.name.value,
                path: createPathForNamespace(def.name.value),
                accessor: includeAccessor,
            }

            return acc
        }, {})
}

export function namespaceForFile(
    fileBody: Array<ThriftStatement>,
    fallbackNamespace: string,
): INamespacePath {
    const namespaceMap = collectNamespaces(fileBody)

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
    parsedFiles: Array<IParsedFile>,
    sourceDir: string,
    fallbackNamespace: string,
): INamespaceMap {
    const parsedFileMap: IParsedFileMap = parsedFiles.reduce(
        (acc: IParsedFileMap, next: IParsedFile) => {
            acc[next.sourceFile.fullPath] = next
            return acc
        },
        {},
    )

    return parsedFiles.reduce((acc: INamespaceMap, parsedFile: IParsedFile) => {
        const namespaceAccessor: string = parsedFile.namespace.accessor
        let namespace = acc[namespaceAccessor]
        if (namespace === undefined) {
            namespace = {
                type: 'Namespace',
                namespace: parsedFile.namespace,
                includedNamespaces: {},
                namespaceIncludes: {},
                errors: [],
                exports: {},
                constants: [],
                enums: [],
                typedefs: [],
                structs: [],
                unions: [],
                exceptions: [],
                services: [],
            }

            acc[namespaceAccessor] = namespace
        }

        Object.keys(parsedFile.includes).forEach(
            (includeName: string): void => {
                const includePath: IIncludePath =
                    parsedFile.includes[includeName]

                const namesapcePath: INamespacePath = namespaceForInclude(
                    includePath,
                    parsedFileMap,
                    sourceDir,
                    fallbackNamespace,
                )

                namespace.includedNamespaces[
                    namesapcePath.accessor
                ] = namesapcePath

                namespace.namespaceIncludes[includeName] =
                    namesapcePath.accessor
            },
        )

        parsedFile.body.forEach((statement: ThriftStatement) => {
            switch (statement.type) {
                case SyntaxType.ConstDefinition:
                    namespace.constants.push(statement)
                    namespace.exports[statement.name.value] = statement
                    break

                case SyntaxType.EnumDefinition:
                    namespace.enums.push(statement)
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
