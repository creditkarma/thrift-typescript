import * as ts from 'typescript'

export function print(statements: Array<ts.Statement>): string {
  const printer: ts.Printer = ts.createPrinter()
  const rawSourceFile: ts.SourceFile = ts.createSourceFile('thrift.ts', '', ts.ScriptTarget.ES2015, false, ts.ScriptKind.TS)
  const bodyFile: ts.SourceFile = ts.updateSourceFileNode(rawSourceFile, statements)
  return printer.printBundle(ts.createBundle([ bodyFile ]))
}