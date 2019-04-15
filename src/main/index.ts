import * as path from 'path'

import { parseFromSource, parseThriftFile } from './parser'

import {
    IFileExports,
    IGeneratedFile,
    IMakeOptions,
    INamespaceMap,
    IParsedFile,
    IRenderState,
    IResolvedFile,
    ISourceFile,
    IThriftProject,
    ParsedFileMap,
    ResolvedFileMap,
} from './types'

import { mergeWithDefaults } from './defaults'
import {
    collectInvalidFiles,
    collectSourceFiles,
    emptyNamespace,
    organizeByNamespace,
    saveFiles,
} from './utils'

import { printErrors } from './debugger'
import { generateProject, processStatements } from './generator'
import { print } from './printer'
import { readThriftFile } from './reader'
import { rendererForTarget } from './render'
import { resolveFile } from './resolver'
import { exportsForFile } from './resolver'
import { validateFile } from './validator'

import * as Parser from './parser'
import * as Resolver from './resolver'
import * as Validator from './validator'
import * as Utils from './utils'

export { Resolver }
export { Parser }
export { Validator }
export { Utils }

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
    const validatedFile: IResolvedFile = parseThriftSource(source, options)

    const fileExports: IFileExports = exportsForFile(validatedFile.body)
    const state: IRenderState = {
        options: mergedOptions,
        currentNamespace: {
            type: 'Namespace',
            namespace: emptyNamespace(),
            files: {
                [validatedFile.sourceFile.fullPath]: validatedFile,
            },
            exports: fileExports,
            includedNamespaces: {},
            constants: [],
            typedefs: [],
            structs: [],
            unions: [],
            exceptions: [],
            services: [],
        },
        currentDefinitions: fileExports,
        project: {
            type: 'ThriftProject',
            rootDir: '',
            sourceDir: '',
            outDir: '',
            namespaces: {},
            options: mergedOptions,
        },
    }

    return print(
        processStatements(
            validatedFile.body,
            state,
            rendererForTarget(mergedOptions.target),
        ),
    )
}

export function parseThriftSource(
    source: string,
    options: Partial<IMakeOptions> = {},
): IResolvedFile {
    const mergedOptions: IMakeOptions = mergeWithDefaults(options)
    const parsedFile: IParsedFile = parseFromSource(
        source,
        mergedOptions.fallbackNamespace,
    )
    const resolvedFile: IResolvedFile = resolveFile(
        parsedFile,
        {},
        '',
        mergedOptions.fallbackNamespace,
    )
    const validatedFile: IResolvedFile = validateFile(resolvedFile, {}, '')

    if (validatedFile.errors.length > 0) {
        throw new Error(`Unable to validate thrift source`)
    }

    return validatedFile
}

export async function parseThriftFiles(
    thriftFiles: Array<ISourceFile>,
    options: {
        sourceDir: string
        fallbackNamespace: string
    },
): Promise<Array<IResolvedFile>> {
    const parsedFiles: Array<IParsedFile> = thriftFiles.map(
        (next: ISourceFile) => {
            const parsed = parseThriftFile(next, options.fallbackNamespace)
            return parsed
        },
    )

    const parsedFileMap: ParsedFileMap = parsedFiles.reduce(
        (acc: ParsedFileMap, next: IParsedFile) => {
            acc[next.sourceFile.fullPath] = next
            return acc
        },
        {},
    )

    const resolvedFiles: Array<IResolvedFile> = parsedFiles.map(
        (next: IParsedFile) => {
            return resolveFile(
                next,
                parsedFileMap,
                options.sourceDir,
                options.fallbackNamespace,
            )
        },
    )

    const resolvedInvalidFiles: Array<IResolvedFile> = collectInvalidFiles(
        resolvedFiles,
    )

    if (resolvedInvalidFiles.length > 0) {
        printErrors(resolvedInvalidFiles)
        throw new Error(`Unable to parse Thrift files`)
    } else {
        const resolvedFileMap: ResolvedFileMap = resolvedFiles.reduce(
            (acc: ResolvedFileMap, next: IResolvedFile) => {
                acc[next.sourceFile.fullPath] = next
                return acc
            },
            {},
        )
        const validatedFiles: Array<IResolvedFile> = resolvedFiles.map(
            (next: IResolvedFile) => {
                return validateFile(next, resolvedFileMap, options.sourceDir)
            },
        )

        const validatedInvalidFiles: Array<IResolvedFile> = collectInvalidFiles(
            validatedFiles,
        )

        if (validatedInvalidFiles.length > 0) {
            printErrors(validatedInvalidFiles)
            throw new Error(`Unable to parse Thrift files`)
        } else {
            return validatedFiles
        }
    }
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

    const fileNames: Array<string> = collectSourceFiles(
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

export async function generate(options: Partial<IMakeOptions>): Promise<void> {
    const mergedOptions: IMakeOptions = mergeWithDefaults(options)

    // Root at which we operate relative to
    const rootDir: string = path.resolve(process.cwd(), mergedOptions.rootDir)

    // Where do we save generated files
    const outDir: string = path.resolve(rootDir, mergedOptions.outDir)

    // Where do we read source files
    const sourceDir: string = path.resolve(rootDir, mergedOptions.sourceDir)

    const thriftFiles: Array<ISourceFile> = await readThriftFiles({
        rootDir,
        sourceDir,
        files: mergedOptions.files,
    })

    const validatedFiles: Array<IResolvedFile> = await parseThriftFiles(
        thriftFiles,
        {
            sourceDir,
            fallbackNamespace: mergedOptions.fallbackNamespace,
        },
    )

    const namespaces: INamespaceMap = organizeByNamespace(validatedFiles)

    const thriftProject: IThriftProject = {
        type: 'ThriftProject',
        rootDir,
        outDir,
        sourceDir,
        namespaces,
        options: mergedOptions,
    }

    const generatedFiles: Array<IGeneratedFile> = generateProject(thriftProject)

    saveFiles(generatedFiles, outDir)
}
