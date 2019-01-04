import * as fs from 'fs'
import * as glob from 'glob'
import * as path from 'path'

import {
    IncludeDefinition,
    parse,
    SyntaxType,
    ThriftDocument,
    ThriftErrors,
    ThriftStatement,
} from '@creditkarma/thrift-parser'

import {
    IIncludeCache,
    IIncludeData,
    IMakeOptions,
    INamespaceFile,
    IParsedFile,
    IRenderedFile,
    IResolvedFile,
    IResolvedIncludeMap,
    IThriftFile,
} from './types'

import { print } from './printer'

import { mkdir } from './sys'

interface IFileCache {
    [path: string]: IThriftFile
}

const fileCache: IFileCache = {}

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
    options: IMakeOptions,
): Array<string> {
    if (options.files && options.files.length > 0) {
        return options.files
    } else {
        return glob.sync(`${sourceDir}/**/*.thrift`)
    }
}

export function parseThriftString(source: string): ThriftDocument {
    const thrift: ThriftDocument | ThriftErrors = parse(source)
    switch (thrift.type) {
        case SyntaxType.ThriftDocument:
            return thrift

        default:
            throw new Error('Unable to parse source')
    }
}

export function dedupResolvedFiles(
    files: Array<IResolvedFile>,
): Array<IResolvedFile> {
    return Array.from(
        files
            .reduce((acc: Map<string, IResolvedFile>, next: IResolvedFile) => {
                acc.set(`${next.path}/${next.name}`, next)
                return acc
            }, new Map())
            .values(),
    )
}

function collectNamespaces(
    files: Array<IResolvedFile>,
    cache: Map<string, INamespaceFile> = new Map(),
): Map<string, INamespaceFile> {
    if (files.length > 0) {
        const [head, ...tail] = files
        const namespace = cache.get(head.namespace.path)
        if (namespace !== undefined) {
            namespace.body = namespace.body.concat(head.body)
            for (const item in head.identifiers) {
                if (head.identifiers.hasOwnProperty(item)) {
                    namespace.identifiers[item] = head.identifiers[item]
                }
            }
            for (const item in head.includes) {
                if (head.includes.hasOwnProperty(item)) {
                    namespace.includes[item] = head.includes[item]
                }
            }
        } else {
            cache.set(head.namespace.path, {
                namespace: head.namespace,
                includes: head.includes,
                identifiers: head.identifiers,
                body: head.body,
            })
        }

        return collectNamespaces(tail, cache)
    } else {
        return cache
    }
}

export function organizeByNamespace(
    files: Array<IResolvedFile>,
): Array<INamespaceFile> {
    return Array.from(collectNamespaces(files).values())
}

/**
 * Once identifiers have been resolved it's easier to deal with files in a flattened state
 */
export function flattenResolvedFile(file: IResolvedFile): Array<IResolvedFile> {
    let result: Array<IResolvedFile> = [file]
    for (const key in file.includes) {
        if (file.includes.hasOwnProperty(key)) {
            const include = file.includes[key].file
            result = result.concat(flattenResolvedFile(include))
        }
    }
    return result
}

export function saveFiles(
    rootDir: string,
    outDir: string,
    files: Array<IRenderedFile>,
): void {
    files.forEach((next: IRenderedFile) => {
        mkdir(path.dirname(next.outPath))
        try {
            fs.writeFileSync(next.outPath, print(next.statements, true))
        } catch (err) {
            throw new Error(
                `Unable to save generated files to: ${next.outPath}`,
            )
        }
    })
}

export function readThriftFile(
    file: string,
    searchPaths: Array<string>,
): IThriftFile {
    for (const sourcePath of searchPaths) {
        const filePath: string = path.resolve(sourcePath, file)
        if (fileCache[filePath] !== undefined) {
            return fileCache[filePath]
        }

        if (fs.existsSync(filePath)) {
            fileCache[filePath] = {
                name: path.basename(filePath, '.thrift'),
                path: path.dirname(filePath),
                source: fs.readFileSync(filePath, 'utf-8'),
            }

            return fileCache[filePath]
        }
    }

    throw new Error(`Unable to find file ${file}`)
}

function collectIncludes(thrift: ThriftDocument): Array<IIncludeData> {
    const statements: Array<IncludeDefinition> = thrift.body.filter(
        (next: ThriftStatement): next is IncludeDefinition => {
            return next.type === SyntaxType.IncludeDefinition
        },
    )

    return statements.map(
        (next: IncludeDefinition): IIncludeData => ({
            path: next.path.value,
            base: path.basename(next.path.value).replace('.thrift', ''),
        }),
    )
}

function parseInclude(
    currentPath: string,
    sourceDir: string,
    include: IIncludeData,
    cache: IIncludeCache = {},
): IParsedFile {
    if (!cache[include.path]) {
        cache[include.path] = parseFile(
            sourceDir,
            readThriftFile(include.path, [currentPath, sourceDir]),
        )
    }

    return cache[include.path]
}

/**
 * interface IParsedFile {
 *   name: string
 *   path: string
 *   includes: Array<IParsedFile>
 *   ast: ThriftDocument
 * }
 *
 * @param sourceDir
 * @param file
 */
export function parseFile(
    sourceDir: string,
    file: IThriftFile,
    cache: IIncludeCache = {},
): IParsedFile {
    const ast: ThriftDocument = parseThriftString(file.source)
    const includes: Array<IParsedFile> = collectIncludes(ast).map(
        (next: IIncludeData): IParsedFile => {
            return parseInclude(file.path, sourceDir, next, cache)
        },
    )

    return {
        name: file.name,
        path: file.path,
        source: file.source,
        includes,
        ast,
    }
}

export function parseSource(source: string): IParsedFile {
    return {
        name: '',
        path: '',
        source,
        includes: [],
        ast: parseThriftString(source),
    }
}

function includeListForMap(
    includes: IResolvedIncludeMap,
): Array<IResolvedFile> {
    const includeList: Array<IResolvedFile> = []
    for (const name of Object.keys(includes)) {
        includeList.push(includes[name].file)
    }
    return includeList
}

export function collectInvalidFiles(
    resolvedFiles: Array<IResolvedFile>,
    errors: Array<IResolvedFile> = [],
): Array<IResolvedFile> {
    for (const file of resolvedFiles) {
        if (file.errors.length > 0) {
            errors.push(file)
            collectInvalidFiles(includeListForMap(file.includes), errors)
        }
    }

    return errors
}
