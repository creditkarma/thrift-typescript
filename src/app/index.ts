import * as fs from 'fs'

import * as ts from 'typescript'

import {
  parse,
  ThriftDocument,
} from '@creditkarma/thrift-parser'

import { render } from './render'

// import { Thrift, TProtocol, TTransport } from 'thrift';
function importThrift(): ts.ImportDeclaration {
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
        ],
      ),
    ),
    ts.createLiteral('thrift'),
  )
}

export function makeFile(filename: string): string {
  const contents: string = fs.readFileSync(filename).toString('utf-8')
  return make(contents)
}

export function make(raw: string): string {
  const thriftAST: ThriftDocument = parse(raw)
  const statements: Array<ts.Statement> = [ importThrift(), ...render(thriftAST) ]
  const printer: ts.Printer = ts.createPrinter()
  const rawSourceFile: ts.SourceFile = ts.createSourceFile(`what.ts`, '', ts.ScriptTarget.ES2015, false, ts.ScriptKind.TS)
  const bodyFile: ts.SourceFile = ts.updateSourceFileNode(rawSourceFile, statements)

  return printer.printBundle(ts.createBundle([ bodyFile ]))
}

/**
 *
 *
 * Make renderer
 *
 *
 *
 * IdentifierData {
 *   name: string;
 *   namespace: string;
 * }
 *
 * ImportData {
 *   relativePath: string;
 *   namespace: string;
 * }
 *
 * Renderer {
 *   identifiers: Map<IdentifierData>;
 *   imports:
 * }
 *
 *
 *
 */
