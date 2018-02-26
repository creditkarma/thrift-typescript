import * as path from 'path'
import * as ts from 'typescript'

import {
    IIdentifierMap,
    IRenderedFileMap,
    IRenderedFile,
    IResolvedFile,
    IResolvedIncludeMap,
    IRenderer,
    IRenderedCache,
} from '../types'

import {
    processStatements
} from './iterator'

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
    resolvedFile: IResolvedFile,
    cache: IRenderedCache = {},
): IRenderedFile {
    const cacheKey: string = `${resolvedFile.path}/${resolvedFile.name}`

    if (cacheKey === '/' || !cache[cacheKey]) {
        function outPathForFile(): string {
            const filename: string = `${resolvedFile.name}.ts`
            const outFile: string = path.resolve(
                outDir,
                resolvedFile.namespace.path,
                filename,
            )

            return outFile
        }

        function createIncludes(currentPath: string, includes: IResolvedIncludeMap): IRenderedFileMap {
            return Object.keys(includes).reduce((acc: IRenderedFileMap, next: string): IRenderedFileMap => {
                const include: IResolvedFile = includes[next].file
                const renderedFile: IRenderedFile = generateFile(
                    renderer,
                    rootDir,
                    outDir,
                    sourceDir,
                    include,
                    cache
                )
                acc[next] = renderedFile
                return acc
            }, {})
        }

        const includes: IRenderedFileMap = createIncludes(resolvedFile.path, resolvedFile.includes)
        const identifiers: IIdentifierMap = resolvedFile.identifiers
        const outPath: string = outPathForFile()
        const statements: Array<ts.Statement> = [
            ...renderer.renderIncludes(outPath, includes, resolvedFile),
            ...processStatements(resolvedFile.body, identifiers, renderer),
        ]

        cache[cacheKey] = {
            name: resolvedFile.name,
            path: resolvedFile.path,
            outPath,
            namespace: resolvedFile.namespace,
            statements,
            includes,
            identifiers,
        }
    }

    return cache[cacheKey]
}
