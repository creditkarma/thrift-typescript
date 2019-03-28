import * as path from 'path'
import * as ts from 'typescript'

import ResolverFile from '../../resolver/file'
import ResolverNamespace from '../../resolver/namespace'
import { COMMON_IDENTIFIERS } from '../shared/identifiers'

const DEFAULT_THRIFT_LIB: string = 'thrift'

/**
 * import { Thrift, TProtocol, TTransport, Int64 } from 'thrift';
 *
 * I would really like this to only import what is being used by the file we're
 * generating. We'll need to keep track of what each files uses.
 */
export function renderThriftImports(
    thriftLib: string = DEFAULT_THRIFT_LIB,
): ts.ImportDeclaration {
    return renderImport(COMMON_IDENTIFIERS.thrift.text, thriftLib)
}

/**
 * Given a hash of included files this will return a list of import statements.
 *
 * @param currentPath The path of the file performing imports. Import paths are
 *                    resolved relative to this.
 * @param includes A hash of all included files
 * @param resolved A hash of include name to a list of ids used from this include
 */
export function renderIncludes(
    namespace: ResolverNamespace,
    files: Array<ResolverFile>,
    namespaceImport?: string,
): Array<ts.ImportDeclaration> {
    const includedFiles: Set<ResolverFile> = new Set()

    files.forEach((file) => {
        file.includes.forEach((include) => {
            includedFiles.add(include)
        })
    })

    const imports: Array<ts.ImportDeclaration> = []
    for (const file of includedFiles) {
        imports.push(
            renderImport(
                path.basename(file.fileName, '.thrift'),
                `./${path.join(
                    path.relative(
                        path.dirname(namespace.path),
                        path.dirname(file.namespace.path),
                    ),
                )}`,
            ),
        )
    }

    if (namespaceImport) {
        imports.push(renderImport(namespaceImport, './.'))
    }

    return imports
}

export function renderImport(name: string, includePath: string) {
    return ts.createImportDeclaration(
        undefined,
        undefined,
        ts.createImportClause(
            undefined,
            ts.createNamespaceImport(ts.createIdentifier(name)),
        ),
        ts.createLiteral(includePath),
    )
}

/**
 * import Int64 = require('node-int64');
 *
 * Creates an import for Int64 type if it is being used by the file we're
 * generating. We'll need to keep track of what each files uses.
 */
export function renderInt64Import(): ts.ImportEqualsDeclaration {
    return ts.createImportEqualsDeclaration(
        undefined,
        undefined,
        COMMON_IDENTIFIERS.Node_Int64,
        ts.createExternalModuleReference(ts.createLiteral('node-int64')),
    )
}
