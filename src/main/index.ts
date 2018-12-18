export * from './types'

import * as path from 'path'

import {
    CompileTarget,
    IIncludeCache,
    IMakeOptions,
    INamespaceFile,
    IParsedFile,
    IRenderedCache,
    IRenderedFile,
    IResolvedCache,
    IResolvedFile,
    IThriftFile,
} from './types'

import { print } from './printer'

import { resolveFile } from './resolver'

import { validateFile } from './validator'

import { generateFile, processStatements } from './generator'

import { rendererForTarget } from './render'

import { printErrors } from './debugger'

import {
    collectInvalidFiles,
    collectSourceFiles,
    dedupResolvedFiles,
    flattenResolvedFile,
    organizeByNamespace,
    parseFile,
    parseSource,
    readThriftFile,
    saveFiles,
} from './utils'

/**
 * This function is mostly for testing purposes. It does not support includes.
 * Given a string of Thrift IDL it will return a string of TypeScript. If the
 * given Thrift IDL uses any identifiers not defined in that text an error will
 * be thrown when trying to build the TypeScript AST.
 *
 * @param source
 */
export function make(source: string, target: CompileTarget = 'thrift-server'): string {
    const parsedFile: IParsedFile = parseSource(source)
    const resolvedAST: IResolvedFile = resolveFile('', parsedFile)
    const validAST: IResolvedFile = validateFile(resolvedAST)
    return print(processStatements(validAST.body, validAST.identifiers, rendererForTarget(target)))
}

/**
 * Generate TypeScript files from Thrift IDL files. The generated TS files will be saved
 * based on the options passed in.
 *
 * rootDir: All file operations are relative to this
 * sourceDir: Where to look for Thrift IDL source files
 * outDir: Where to save generated TS files
 * files: Array of Thrift IDL files to generate from
 *
 * @param options
 */
export function generate(options: IMakeOptions): void {
    const rootDir: string = path.resolve(process.cwd(), options.rootDir)
    const outDir: string = path.resolve(rootDir, options.outDir)
    const sourceDir: string = path.resolve(rootDir, options.sourceDir)
    const includeCache: IIncludeCache = {}
    const resolvedCache: IResolvedCache = {}
    const renderedCache: IRenderedCache = {}

    const validatedFiles: Array<IResolvedFile> = collectSourceFiles(sourceDir, options).reduce(
        (acc: Array<IResolvedFile>, next: string): Array<IResolvedFile> => {
            const thriftFile: IThriftFile = readThriftFile(next, [sourceDir])
            const parsedFile: IParsedFile = parseFile(sourceDir, thriftFile, includeCache)
            const resolvedFile: IResolvedFile = resolveFile(outDir, parsedFile, resolvedCache)
            return acc.concat(flattenResolvedFile(resolvedFile).map(validateFile))
        },
        [],
    )

    const dedupedFiles: Array<IResolvedFile> = dedupResolvedFiles(validatedFiles)
    const invalidFiles: Array<IResolvedFile> = collectInvalidFiles(dedupedFiles)

    if (invalidFiles.length > 0) {
        printErrors(invalidFiles)
        process.exitCode = 1

    } else {
        const namespaces: Array<INamespaceFile> = organizeByNamespace(dedupedFiles)
        const renderedFiles: Array<IRenderedFile> = namespaces.map(
            (next: INamespaceFile): IRenderedFile => {
                return generateFile(
                    rendererForTarget(options.target),
                    rootDir,
                    outDir,
                    sourceDir,
                    next,
                    renderedCache,
                    options,
                )
            },
        )

        saveFiles(rootDir, outDir, renderedFiles)
    }
}
