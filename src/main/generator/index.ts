import {
    IMakeOptions,
    IRenderedCache,
    IRenderedFile,
    IRenderer,
} from '../types'

import ResolverNamespace from '../resolver/namespace'
import { processStatements } from './iterator'
import NamespaceGenerator from './namespace'

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
export function generateFiles(
    renderer: IRenderer,
    outDir: string,
    namespace: ResolverNamespace,
    cache: IRenderedCache = {},
    options: IMakeOptions,
): Array<IRenderedFile> {
    const cacheKey: string = namespace.path

    if (cacheKey === '/' || cache[cacheKey] === undefined) {
        const namespaceGenerator = new NamespaceGenerator(
            renderer,
            namespace,
            outDir,
            options,
        )

        processStatements(namespace, namespaceGenerator)

        cache[cacheKey] = namespaceGenerator.renderFiles(options.filePerType)
    }

    return cache[cacheKey]
}
