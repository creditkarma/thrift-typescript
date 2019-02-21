import * as path from 'path'
import * as ts from 'typescript'

import {
    IResolvedFile,
    IResolvedIdentifier,
    IResolvedIncludeMap,
} from '../../types'

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
    resolved: IResolvedIncludeMap,
): Array<ts.ImportDeclaration> {
    const imports: Array<ts.ImportDeclaration> = []

    for (const name of Object.keys(resolved)) {
        const resolvedIncludes: Array<IResolvedIdentifier> =
            resolved[name].identifiers
        const includeFile: IResolvedFile = resolved[name].file

        if (resolvedIncludes != null && includeFile != null) {
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

    return imports
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
