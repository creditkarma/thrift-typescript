import * as fs from 'fs'
import * as path from 'path'
import * as ts from 'typescript'

import {
  parse,
  ThriftDocument,
} from '@creditkarma/thrift-parser'

import { render } from './render'

import { mkdir } from './fs'

export interface IMakeOptions {
  rootDir?: string
  outDir?: string
  removeComments?: boolean
  files?: Array<string>
}

export interface IIdentifierData {
  name: string
}

export interface IRenderedFile {
  name: string
  contents: string
  identifiers: Map<string, IIdentifierData>
  options: IMakeOptions
}

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

export function compile(options: IMakeOptions): void {
  mkdir(options.outDir)

  options.files.forEach((nextThrift: string): void => {
    const absFile: string = path.join(process.cwd(), options.rootDir, nextThrift)
    const contents: string = fs.readFileSync(absFile, 'utf-8')
    const codegen: string = make(contents)
    const basename: string = path.basename(absFile, '.thrift')
    const filename: string = `${basename}.ts`
    const outFile: string = path.join(process.cwd(), options.rootDir, options.outDir, filename)

    fs.writeFile(outFile, codegen, (err: Error) => {
      if (err != null) {
        console.error('err: ', err)
      }
    })
  })
}

export function make(raw: string, filename: string = 'thrift.ts'): string {
  const thriftAST: ThriftDocument = parse(raw)
  const statements: Array<ts.Statement> = [ importThrift(), ...render(thriftAST) ]
  const printer: ts.Printer = ts.createPrinter()
  const rawSourceFile: ts.SourceFile = ts.createSourceFile(filename, '', ts.ScriptTarget.ES2015, false, ts.ScriptKind.TS)
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
