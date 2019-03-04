import * as path from 'path'
import * as ts from 'typescript'

import {
    IIdentifierMap,
    INamespaceFile,
    IResolvedFile,
    IResolvedIdentifier,
} from '../../types'
import { COMMON_IDENTIFIERS } from '../shared/identifiers'

const DEFAULT_THRIFT_LIB: string = '@creditkarma/thrift-server-core'

/**
 * import * as thrift from 'thrift';
 *
 * I would really like this to only import what is being used by the file we're
 * generating. We'll need to keep track of what each files uses.
 */
export function renderThriftImports(
    thriftLib: string = DEFAULT_THRIFT_LIB,
): ts.ImportDeclaration {
    return ts.createImportDeclaration(
        undefined,
        undefined,
        ts.createImportClause(
            undefined,
            ts.createNamespaceImport(COMMON_IDENTIFIERS.thrift),
        ),
        ts.createLiteral(thriftLib),
    )
}

function existInIdentifiers(
    name: string,
    identifiers: IIdentifierMap,
): boolean {
    for (const next in identifiers) {
        if (identifiers.hasOwnProperty(next)) {
            const identifier = identifiers[next]
            if (identifier.pathName === name) {
                return true
            }
        }
    }

    return false
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
    currentPath: string,
    resolvedFile: INamespaceFile,
): Array<ts.ImportDeclaration> {
    const imports: Array<ts.ImportDeclaration> = []
    for (const name of Object.keys(resolvedFile.includes)) {
        if (existInIdentifiers(name, resolvedFile.identifiers)) {
            const resolvedIncludes: Array<IResolvedIdentifier> =
                resolvedFile.includes[name].identifiers
            const includeFile: IResolvedFile = resolvedFile.includes[name].file

            if (resolvedIncludes != null && resolvedFile != null) {
                const includePath: string = includeFile.namespace.path
                imports.push(
                    ts.createImportDeclaration(
                        undefined,
                        undefined,
                        ts.createImportClause(
                            undefined,
                            ts.createNamespaceImport(ts.createIdentifier(name)),
                        ),
                        ts.createLiteral(
                            `./${path.join(
                                path.relative(
                                    path.dirname(currentPath),
                                    path.dirname(includePath),
                                ),
                            )}`,
                        ),
                    ),
                )
            }
        }
    }
    return imports
}
