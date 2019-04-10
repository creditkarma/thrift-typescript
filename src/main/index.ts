import * as path from 'path'

import { parseFromSource, parseThriftFile } from './parser'

import {
    CompileTarget,
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
import { exportsForFile } from './resolver/utils'
import { validateFile } from './validator'

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
    const parsedFile: IParsedFile = parseFromSource(source, options)
    const resolvedFile: IResolvedFile = resolveFile(parsedFile, {}, '', options)
    const validatedFile: IResolvedFile = validateFile(resolvedFile, {}, '')

    if (validatedFile.errors.length > 0) {
        throw new Error(`Shit broke`)
    }

    const fileExports: IFileExports = exportsForFile(resolvedFile.body)
    const state: IRenderState = {
        options,
        currentNamespace: {
            type: 'Namespace',
            namespace: emptyNamespace(),
            files: {
                [resolvedFile.sourceFile.fullPath]: resolvedFile,
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
            options,
        },
    }

    return print(
        processStatements(resolvedFile.body, state, rendererForTarget(target)),
    )
}

export async function generate(options: Partial<IMakeOptions>): Promise<void> {
    const mergedOptions: IMakeOptions = mergeWithDefaults(options)

    // Root at which we operate relative to
    const rootDir: string = path.resolve(process.cwd(), mergedOptions.rootDir)

    // Where do we save generated files
    const outDir: string = path.resolve(rootDir, mergedOptions.outDir)

    // Where do we read source files
    const sourceDir: string = path.resolve(rootDir, mergedOptions.sourceDir)

    const fileNames: Array<string> = collectSourceFiles(
        sourceDir,
        mergedOptions,
    )

    const thriftFiles: Array<ISourceFile> = await Promise.all(
        fileNames.map((next: string) => {
            return readThriftFile(next, [sourceDir])
        }),
    )

    const parsedFiles: Array<IParsedFile> = thriftFiles.map(
        (next: ISourceFile) => {
            const parsed = parseThriftFile(next, mergedOptions)
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
            return resolveFile(next, parsedFileMap, sourceDir, mergedOptions)
        },
    )

    const resolvedInvalidFiles: Array<IResolvedFile> = collectInvalidFiles(
        resolvedFiles,
    )

    if (resolvedInvalidFiles.length > 0) {
        printErrors(resolvedInvalidFiles)
        process.exitCode = 1
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
                return validateFile(next, resolvedFileMap, sourceDir)
            },
        )

        const validatedInvalidFiles: Array<IResolvedFile> = collectInvalidFiles(
            validatedFiles,
        )

        if (validatedInvalidFiles.length > 0) {
            printErrors(validatedInvalidFiles)
            process.exitCode = 1
        } else {
            const namespaces: INamespaceMap = organizeByNamespace(resolvedFiles)

            const thriftProject: IThriftProject = {
                type: 'ThriftProject',
                rootDir,
                outDir,
                sourceDir,
                namespaces,
                options: mergedOptions,
            }

            const generatedFiles: Array<IGeneratedFile> = generateProject(
                thriftProject,
            )

            saveFiles(generatedFiles, outDir)
        }
    }
}
