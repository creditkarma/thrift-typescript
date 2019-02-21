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
    IRenderState,
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

import { mergeWithDefaults } from './defaults'

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

import { DEFAULT_OPTIONS } from './options'

/**
 * This function is mostly for testing purposes. It does not support includes.
 * Given a string of Thrift IDL it will return a string of TypeScript. If the
 * given Thrift IDL uses any identifiers not defined in that text an error will
 * be thrown when trying to build the TypeScript AST.
 *
 * @param source
 */
export function make(
    source: string,
    target: CompileTarget = 'thrift-server',
    strictUnions: boolean = false,
): string {
    const options: IMakeOptions = mergeWithDefaults({
        target,
        strictUnions,
    })
    const parsedFile: IParsedFile = parseSource(source)
    const resolvedAST: IResolvedFile = resolveFile(
        '',
        parsedFile,
        DEFAULT_OPTIONS,
    )
    const validAST: IResolvedFile = validateFile(resolvedAST)
    const state: IRenderState = {
        options,
        identifiers: validAST.identifiers,
    }
    return print(
        processStatements(validAST.body, state, rendererForTarget(target)),
    )
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
export function generate(options: Partial<IMakeOptions>): void {
    const mergedOptions: IMakeOptions = mergeWithDefaults(options)
    const rootDir: string = path.resolve(process.cwd(), mergedOptions.rootDir)
    const outDir: string = path.resolve(rootDir, mergedOptions.outDir)
    const sourceDir: string = path.resolve(rootDir, mergedOptions.sourceDir)
    const includeCache: IIncludeCache = {}
    const resolvedCache: IResolvedCache = {}
    const renderedCache: IRenderedCache = {}

    const validatedFiles: Array<IResolvedFile> = collectSourceFiles(
        sourceDir,
        mergedOptions,
    ).reduce((acc: Array<IResolvedFile>, next: string): Array<
        IResolvedFile
    > => {
        const thriftFile: IThriftFile = readThriftFile(next, [sourceDir])
        const parsedFile: IParsedFile = parseFile(
            sourceDir,
            thriftFile,
            includeCache,
        )
        const resolvedFile: IResolvedFile = resolveFile(
            outDir,
            parsedFile,
            mergedOptions,
            resolvedCache,
        )
        return acc.concat(flattenResolvedFile(resolvedFile).map(validateFile))
    }, [])

    const dedupedFiles: Array<IResolvedFile> = dedupResolvedFiles(
        validatedFiles,
    )

    const invalidFiles: Array<IResolvedFile> = collectInvalidFiles(dedupedFiles)

    if (invalidFiles.length > 0) {
        printErrors(invalidFiles)
        process.exitCode = 1
    } else {
        const namespaces: Array<INamespaceFile> = organizeByNamespace(
            dedupedFiles,
        )
        const renderedFiles: Array<IRenderedFile> = namespaces.map(
            (next: INamespaceFile): IRenderedFile => {
                return generateFile(
                    rendererForTarget(mergedOptions.target),
                    next,
                    mergedOptions,
                    renderedCache,
                )
            },
        )

        saveFiles(rootDir, outDir, renderedFiles)
    }
}
