import * as path from 'path'

import { parseFromSource, parseThriftFile } from './parser'

import {
    IFileExports,
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
import * as Parser from './parser'
import * as Resolver from './resolver'
import { resolveNamespace } from './resolver/resolveNamespace'
import * as Utils from './utils'
import { validateNamespace } from './validator'
// import * as Validator from './validator'
// import { ThriftStatement, SyntaxType } from '@creditkarma/thrift-parser';

export { Resolver }
export { Parser }
// export { Validator }
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
    const parsedFile: IParsedFile = parseThriftSource(source, options)

    const fileExports: IFileExports = Resolver.exportsForFile(parsedFile.body)

    const namespace: INamespace = {
        type: 'Namespace',
        namespace: Utils.emptyNamespace(),
        exports: fileExports,
        includedNamespaces: {},
        namespaceIncludes: {},
        errors: [],
        constants: [],
        enums: [],
        typedefs: [],
        structs: [],
        unions: [],
        exceptions: [],
        services: [],
    }

    const resolvedNamespace: INamespace = resolveNamespace(namespace, {})

    const state: IRenderState = {
        options: mergedOptions,
        currentNamespace: resolvedNamespace,
        currentDefinitions: resolvedNamespace.exports,
        project: {
            type: 'ThriftProject',
            rootDir: '',
            sourceDir: '',
            outDir: '',
            namespaces: {},
            options: mergedOptions,
        },
    }

    const resolvedBody: Array<ThriftStatement> = Object.keys(
        resolvedNamespace.exports,
    ).map((next: string) => {
        return resolvedNamespace.exports[next]
    })

    return print(
        processStatements(
            resolvedBody,
            state,
            rendererForTarget(mergedOptions.target),
        ),
    )
}

export function parseThriftSource(
    source: string,
    options: Partial<IMakeOptions> = {},
): IParsedFile {
    const mergedOptions: IMakeOptions = mergeWithDefaults(options)

    const parsedFile: IParsedFile = parseFromSource(
        source,
        mergedOptions.fallbackNamespace,
    )

    if (parsedFile.errors.length > 0) {
        throw new Error(`Unable to validate thrift source`)
    }

    return parsedFile
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

    const parsedFiles: Array<IParsedFile> = thriftFiles.map(
        (next: ISourceFile) =>
            parseThriftFile(next, mergedOptions.fallbackNamespace),
    )

    const namespaces: INamespaceMap = Utils.organizeByNamespace(
        parsedFiles,
        sourceDir,
        mergedOptions.fallbackNamespace,
    )

    const resolvedNamespaces: INamespaceMap = Object.keys(namespaces).reduce(
        (acc: INamespaceMap, next: string) => {
            const nextNamespace: INamespace = namespaces[next]
            acc[next] = resolveNamespace(nextNamespace, namespaces)
            return acc
        },
        {},
    )

    const resolvedInvalidFiles: Array<INamespace> = Utils.collectInvalidFiles(
        Utils.valuesForObject(resolvedNamespaces),
    )

    if (resolvedInvalidFiles.length > 0) {
        Debugger.printErrors(resolvedInvalidFiles)
        throw new Error(`Unable to parse Thrift files`)
    }

    const validatedNamespaces: INamespaceMap = Object.keys(
        resolvedNamespaces,
    ).reduce((acc: INamespaceMap, next: string) => {
        const nextNamespace: INamespace = namespaces[next]
        acc[next] = validateNamespace(nextNamespace, namespaces)
        return acc
    }, {})

    const validatedInvalidFiles: Array<INamespace> = Utils.collectInvalidFiles(
        Utils.valuesForObject(validatedNamespaces),
    )

    if (validatedInvalidFiles.length > 0) {
        Debugger.printErrors(validatedInvalidFiles)
        throw new Error(`Unable to parse Thrift files`)
    }

    const thriftProject: IThriftProject = {
        type: 'ThriftProject',
        rootDir,
        outDir,
        sourceDir,
        namespaces: resolvedNamespaces,
        options: mergedOptions,
    }

    const generatedFiles: Array<IGeneratedFile> = generateProject(thriftProject)

    Utils.saveFiles(generatedFiles, outDir)
}
