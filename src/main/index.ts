import * as path from 'path'

import {
    IGeneratedFile,
    IMakeOptions,
    INamespace,
    INamespaceMap,
    IParsedFile,
    IRenderState,
    ISourceFile,
    IThriftProject,
} from './types'

import { mergeWithDefaults } from './defaults'

import * as Debugger from './debugger'
import { generateProject, processStatements } from './generator'
import { print } from './printer'
import { readThriftFile } from './reader'
import { rendererForTarget } from './render'

import { ThriftStatement } from '@creditkarma/thrift-parser'
import { Parser } from './parser'
import { Resolver } from './resolver'
import * as Sys from './sys'
import * as Utils from './utils'
import * as Validator from './validator'

export * from './types'
export * from './resolver'
export * from './parser'
export { Utils }
export { Sys }

// Reexport thrift-parser so we can use all those types with the enhanced parser exported from
// this project.
export * from '@creditkarma/thrift-parser'

// Expose the file generator
export { generateProject }

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
    options: Partial<IMakeOptions> = {},
): string {
    const mergedOptions: IMakeOptions = mergeWithDefaults(options)

    const sourceFile: ISourceFile = {
        type: 'SourceFile',
        name: 'source.thrift',
        path: '',
        fullPath: '',
        source,
    }

    const thriftProject: IThriftProject = thriftProjectFromSourceFiles(
        [sourceFile],
        mergedOptions,
    )

    const currentNamespace: INamespace =
        thriftProject.namespaces['__ROOT_NAMESPACE__']

    const state: IRenderState = {
        options: mergedOptions,
        currentNamespace,
        currentDefinitions: currentNamespace.exports,
        project: {
            type: 'ThriftProject',
            rootDir: '',
            sourceDir: '',
            outDir: '',
            namespaces: {},
            options: mergedOptions,
        },
    }

    const statements: Array<ThriftStatement> = Object.keys(
        currentNamespace.exports,
    ).map((next: string) => {
        return currentNamespace.exports[next]
    })

    return print(
        processStatements(
            statements,
            state,
            rendererForTarget(mergedOptions.target),
        ),
    )
}

export async function readThriftFiles(options: {
    rootDir: string
    sourceDir: string
    files?: Array<string>
}): Promise<Array<ISourceFile>> {
    // Root at which we operate relative to
    const rootDir: string = path.resolve(process.cwd(), options.rootDir)

    // Where do we read source files
    const sourceDir: string = path.resolve(rootDir, options.sourceDir)

    const fileNames: Array<string> = Utils.collectSourceFiles(
        sourceDir,
        options.files,
    )

    const thriftFiles: Array<ISourceFile> = await Promise.all(
        fileNames.map((next: string) => {
            return readThriftFile(next, [sourceDir])
        }),
    )

    return thriftFiles
}

export function thriftProjectFromSourceFiles(
    sourceFiles: Array<ISourceFile>,
    options: Partial<IMakeOptions> = {},
): IThriftProject {
    const mergedOptions: IMakeOptions = mergeWithDefaults(options)

    // Root at which we operate relative to
    const rootDir: string = path.resolve(process.cwd(), mergedOptions.rootDir)

    // Where do we save generated files
    const outDir: string = path.resolve(rootDir, mergedOptions.outDir)

    // Where do we read source files
    const sourceDir: string = path.resolve(rootDir, mergedOptions.sourceDir)

    const parsedFiles: Array<IParsedFile> = sourceFiles.map(
        (next: ISourceFile) =>
            Parser.parseThriftFile(next, mergedOptions.fallbackNamespace),
    )

    const namespaces: INamespaceMap = Resolver.organizeByNamespace(
        parsedFiles,
        sourceDir,
        mergedOptions.fallbackNamespace,
    )

    const resolvedNamespaces: INamespaceMap = Object.keys(namespaces).reduce(
        (acc: INamespaceMap, next: string) => {
            const nextNamespace: INamespace = namespaces[next]
            acc[next] = Resolver.resolveNamespace(nextNamespace, namespaces)
            return acc
        },
        {},
    )

    const resolvedInvalidFiles: Array<INamespace> = Debugger.collectInvalidFiles(
        Utils.valuesForObject(resolvedNamespaces),
    )

    if (resolvedInvalidFiles.length > 0) {
        Debugger.printErrors(resolvedInvalidFiles)
        throw new Error(`Unable to parse Thrift files`)
    } else {
        const validatedNamespaces: INamespaceMap = Object.keys(
            resolvedNamespaces,
        ).reduce((acc: INamespaceMap, next: string) => {
            const nextNamespace: INamespace = namespaces[next]
            acc[next] = Validator.validateNamespace(nextNamespace, namespaces)
            return acc
        }, {})

        const validatedInvalidFiles: Array<INamespace> = Debugger.collectInvalidFiles(
            Utils.valuesForObject(validatedNamespaces),
        )

        if (validatedInvalidFiles.length > 0) {
            Debugger.printErrors(validatedInvalidFiles)
            throw new Error(`Unable to parse Thrift files`)
        } else {
            return {
                type: 'ThriftProject',
                rootDir,
                outDir,
                sourceDir,
                namespaces: resolvedNamespaces,
                options: mergedOptions,
            }
        }
    }
}

export async function processThriftProject(
    options: Partial<IMakeOptions> = {},
): Promise<IThriftProject> {
    const mergedOptions: IMakeOptions = mergeWithDefaults(options)

    // Root at which we operate relative to
    const rootDir: string = path.resolve(process.cwd(), mergedOptions.rootDir)

    // Where do we read source files
    const sourceDir: string = path.resolve(rootDir, mergedOptions.sourceDir)

    const sourceFiles: Array<ISourceFile> = await readThriftFiles({
        rootDir,
        sourceDir,
        files: mergedOptions.files,
    })

    return thriftProjectFromSourceFiles(sourceFiles, mergedOptions)
}

export async function generate(
    options: Partial<IMakeOptions> = {},
): Promise<void> {
    const thriftProject: IThriftProject = await processThriftProject(options)

    const generatedFiles: Array<IGeneratedFile> = generateProject(thriftProject)

    Sys.saveFiles(generatedFiles, thriftProject.outDir)
}
