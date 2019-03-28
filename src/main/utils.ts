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
    IParsedFile,
    IRenderedFile,
    IThriftFile,
    IValidatedFile,
} from './types'

import { print } from './printer'

import ResolverSchema from './resolver/schema'
import { mkdir } from './sys'
import { validateFile } from './validator'

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

export function saveFiles(files: Array<IRenderedFile>): void {
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

export function collectInvalidFiles(
    schema: ResolverSchema,
): Array<IValidatedFile> {
    return [...schema.files.values()]
        .map((file) => validateFile(file))
        .filter((validatedFile) => validatedFile.errors.length > 0)
}
