export * from './types'

import * as path from 'path'

import {
    CompileTarget,
    IIncludeCache,
    IMakeOptions,
    IParsedFile,
    IRenderedCache,
    IRenderedFile,
    IThriftFile,
    IValidatedFile,
} from './types'

import { print } from './printer'

import { resolveFile } from './resolver'

import { validateFile } from './validator'

import { generateFiles, processStatements } from './generator'

import { rendererForTarget } from './render'

import { printErrors } from './debugger'

import { mergeWithDefaults } from './defaults'

import {
    collectInvalidFiles,
    collectSourceFiles,
    parseFile,
    parseSource,
    readThriftFile,
    saveFiles,
} from './utils'

import NamespaceGenerator from './generator/namespace'
import { DEFAULT_OPTIONS } from './options'
import ResolverNamespace from './resolver/namespace'
import ResolverSchema from './resolver/schema'

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
): string {
    const parsedFile: IParsedFile = parseSource(source)
    const schema = new ResolverSchema(DEFAULT_OPTIONS)

    const resolvedFile = resolveFile('', parsedFile, schema)

    validateFile(resolvedFile)

    const generator = new NamespaceGenerator(
        rendererForTarget(target),
        resolvedFile.namespace,
        '/example',
        DEFAULT_OPTIONS,
    )

    processStatements(resolvedFile.namespace, generator)

    return print(generator.renderStatements())
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
    const schema: ResolverSchema = new ResolverSchema(mergedOptions)
    const renderedCache: IRenderedCache = {}

    collectSourceFiles(sourceDir, mergedOptions).forEach((next: string) => {
        const thriftFile: IThriftFile = readThriftFile(next, [sourceDir])
        const parsedFile: IParsedFile = parseFile(
            sourceDir,
            thriftFile,
            includeCache,
        )
        resolveFile(outDir, parsedFile, schema)
    })

    const invalidFiles: Array<IValidatedFile> = collectInvalidFiles(schema)

    if (invalidFiles.length > 0) {
        printErrors(invalidFiles)
        process.exitCode = 1
    } else {
        const renderedFiles: Array<IRenderedFile> = []

        schema.namespaces.forEach((next: ResolverNamespace) => {
            renderedFiles.push(
                ...generateFiles(
                    rendererForTarget(mergedOptions.target),
                    outDir,
                    next,
                    renderedCache,
                    mergedOptions,
                ),
            )
        })

        saveFiles(renderedFiles)
    }
}
