import * as ts from 'typescript'

/**
 * import * as thrift from '<thrift-library>';
 *
 * I would really like this to only import what is being used by the file we're
 * generating. We'll need to keep track of what each files uses.
 */
export function renderThriftImports(thriftLibraryName: string): ts.ImportDeclaration {
    return ts.createImportDeclaration(
        undefined,
        undefined,
        ts.createImportClause(
            undefined,
            ts.createNamespaceImport(ts.createIdentifier('thrift'))
        ),
        ts.createLiteral(thriftLibraryName)
    );
}
