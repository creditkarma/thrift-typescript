import * as ts from 'typescript'

import {
    IIdentifierMap,
    IMakeOptions,
    INamespaceFile,
    IRenderedCache,
    IRenderedFile,
    IRenderer,
} from '../types'

import { processStatements } from './iterator'

/**
 * Export this directly is useful for generating code without generating files
 */
export { processStatements } from './iterator'

/**
 * The generator is the primary interface for generating TypeScript code from
 * Thrift IDL. It takes a hash of options that inform it on how to resolve files
 * and where to save generated code.
 *
 * When a Thrift file includes another Thrift file the first place we search for
 * the include is local to the including file. If no matching file is found we
 * search relative to the sourceDir defined in the options.
 *
 * @param options
 */
export function generateFile(
    renderer: IRenderer,
    rootDir: string,
    outDir: string,
    sourceDir: string,
    resolvedFile: INamespaceFile,
    cache: IRenderedCache = {},
    options: IMakeOptions,
): IRenderedFile {
    const cacheKey: string = resolvedFile.namespace.path

    if (cacheKey === '/' || cache[cacheKey] === undefined) {
        const identifiers: IIdentifierMap = resolvedFile.identifiers
        const statements: Array<ts.Statement> = [
            ...renderer.renderIncludes(
                outDir,
                resolvedFile.namespace.path,
                resolvedFile,
                options,
            ),
            ...processStatements(resolvedFile.body, identifiers, renderer),
        ]

        cache[cacheKey] = {
            outPath: resolvedFile.namespace.path,
            namespace: resolvedFile.namespace,
            statements,
            identifiers,
        }
    }

    return cache[cacheKey]
}
