import { parse, ThriftDocument } from '@creditkarma/thrift-parser'
import * as fs from 'fs'
import {
  createBundle,
  createPrinter,
  createSourceFile,
  Printer,
  ScriptKind,
  ScriptTarget,
  SourceFile,
  Statement,
  updateSourceFileNode,
} from 'typescript'
import { render } from './render'

export function makeFile(filename: string): string {
  const contents: string = fs.readFileSync(filename).toString('utf-8')
  return make(contents)
}

export function make(raw: string): string {
  const thriftAST: ThriftDocument = parse(raw)
  const statements: Array<Statement> = render(thriftAST)
  const printer: Printer = createPrinter()
  const rawSourceFile: SourceFile = createSourceFile(`what.ts`, '', ScriptTarget.ES2015, false, ScriptKind.TS)
  const bodyFile: SourceFile = updateSourceFileNode(rawSourceFile, statements)

  return printer.printBundle(createBundle([ bodyFile ]))
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
