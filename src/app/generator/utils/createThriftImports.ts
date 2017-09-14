import * as ts from 'typescript'

/**
 * import { Thrift, TProtocol, TTransport, Int64 } from 'thrift';
 *
 * I would really like this to only import what is being used by the file we're
 * generating. We'll need to keep track of what each files uses.
 */
export function createThriftImports(): ts.ImportDeclaration {
  return ts.createImportDeclaration(
    undefined,
    undefined,
    ts.createImportClause(
      undefined,
      ts.createNamedImports(
        [
          ts.createImportSpecifier(
            undefined,
            ts.createIdentifier('Thrift'),
          ),
          ts.createImportSpecifier(
            undefined,
            ts.createIdentifier('TProtocol'),
          ),
          ts.createImportSpecifier(
            undefined,
            ts.createIdentifier('TTransport'),
          ),
          ts.createImportSpecifier(
            undefined,
            ts.createIdentifier('Int64'),
          ),
        ],
      ),
    ),
    ts.createLiteral('thrift'),
  )
}