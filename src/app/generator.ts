import * as fs from 'fs'
import * as path from 'path'
import * as ts from 'typescript'

import {
  IncludeDefinition,
  parse,
  SyntaxType,
  ThriftDocument,
  ThriftStatement,
} from '@creditkarma/thrift-parser'

import { render } from './render'

import { mkdir } from './fs'

import { resolveIdentifiers } from './resolver'

import {
  IIdentifierMap,
  IIncludeData,
  IIncludeMap,
  IMakeOptions,
  IRenderedFile,
  IResolvedFile,
  IResolvedIdentifier,
  IResolvedIncludeMap,
  IResolvedNamespaceMap,
} from './types'

export interface IThriftGenerator {
  compile(): Array<IRenderedFile>
  makeFiles(): void
}

export function print(statements: Array<ts.Statement>): string {
  const printer: ts.Printer = ts.createPrinter()
  const rawSourceFile: ts.SourceFile = ts.createSourceFile('thrift.ts', '', ts.ScriptTarget.ES2015, false, ts.ScriptKind.TS)
  const bodyFile: ts.SourceFile = ts.updateSourceFileNode(rawSourceFile, statements)
  return printer.printBundle(ts.createBundle([ bodyFile ]))
}

export function make(source: string): string {
  const thriftAST: ThriftDocument = parse(source)
  const resolvedAST: IResolvedFile = resolveIdentifiers(thriftAST, {})
  return print(render(thriftAST.body, resolvedAST.identifiers))
}

export function createGenerator(options: IMakeOptions): IThriftGenerator {
  const rootDir: string = path.resolve(process.cwd(), options.rootDir)
  const outDir: string = path.resolve(rootDir, options.outDir)
  const sourceDir: string = path.resolve(rootDir, options.sourceDir)

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

  function genPathForNamespace(ns: string): string {
    return ns.split('.').join('/')
  }

  function getNamespace(namespaces: IResolvedNamespaceMap): string {
    return (
      (namespaces.js != null) ?
        namespaces.js.name :
        (namespaces.java != null) ?
          namespaces.java.name :
          ''
    )
  }

  function outPathForSourcePath(sourcePath: string, namespacePath: string): string {
    const basename: string = path.basename(sourcePath, '.thrift')
    const filename: string = `${basename}.ts`
    const outFile: string = path.resolve(
      options.rootDir,
      options.outDir,
      namespacePath,
      filename,
    )

    return outFile
  }

  function importIncludes(
    currentPath: string,
    includes: IIncludeMap,
    resolved: IResolvedIncludeMap,
  ): Array<ts.ImportDeclaration> {
    const imports: Array<ts.ImportDeclaration> = []
    for (const name of Object.keys(resolved)) {
      const resolvedIncludes: Array<IResolvedIdentifier> = resolved[name]
      const includeFile: IRenderedFile = includes[name]

      if (resolvedIncludes != null && includeFile != null) {
        imports.push(ts.createImportDeclaration(
          undefined,
          undefined,
          ts.createImportClause(
            undefined,
            ts.createNamedImports(
              resolvedIncludes.map((next: IResolvedIdentifier) => {
                return ts.createImportSpecifier(
                  ts.createIdentifier(next.name),
                  ts.createIdentifier(next.resolvedName),
                )
              }),
            ),
          ),
          ts.createLiteral(
            `./${path.join(
              path.relative(
                path.dirname(currentPath),
                path.dirname(includeFile.outPath),
              ),
              path.basename(includeFile.outPath, '.ts'),
            )}`,
          ),
        ))
      }
    }
    return imports
  }

  function collectAllFiles(files: Array<IRenderedFile>): Array<IRenderedFile> {
    return files.reduce((acc: Array<IRenderedFile>, next: IRenderedFile) => {
      const includes: Array<IRenderedFile> = []
      for (const name of Object.keys(next.includes)) {
        includes.push(next.includes[name])
      }

      return [
        ...acc,
        next,
        ...collectAllFiles(includes),
      ]
    }, [])
  }

  function makeFiles(): void {
    mkdir(options.outDir)
    collectAllFiles(compile()).forEach((next: IRenderedFile) => {
      mkdir(path.relative(
        rootDir,
        path.join(outDir, genPathForNamespace(next.namespace)),
      ))

      fs.writeFile(next.outPath, next.contents, (err: Error) => {
        if (err != null) {
          throw new Error(`Unable to save generated files to: ${next.outPath}`)
        }
      })
    })
  }

  function compile(): Array<IRenderedFile> {
    return options.files.map(compileFile)
  }

  function compileFile(file: string): IRenderedFile {
    const sourcePath: string = path.resolve(sourceDir, file)
    const contents: string = fs.readFileSync(sourcePath, 'utf-8')
    const codegen: IRenderedFile = createRenderedFile(sourcePath, contents)
    return codegen
  }

  function compileIncludes(currentPath: string, includes: Array<IIncludeData>): IIncludeMap {
    const includeMap: IIncludeMap = {}
    for (const include of includes) {
      const localPath: string = path.resolve(
        path.dirname(currentPath),
        include.path,
      )

      if (fs.existsSync(localPath)) {
        const renderedFile: IRenderedFile = compileFile(localPath)
        includeMap[include.base] = renderedFile
      } else {
        const rootPath: string = path.resolve(sourceDir, include.path)
        if (fs.existsSync(rootPath)) {
          const renderedFile: IRenderedFile = compileFile(rootPath)
          includeMap[include.base] = renderedFile
        } else {
          throw new Error(`Unable to locate file for include ${include.path}`)
        }
      }
    }

    return includeMap
  }

  function findIncludes(thrift: ThriftDocument): Array<IIncludeData> {
    const statements: Array<ThriftStatement> = thrift.body.filter((next: ThriftStatement): boolean => {
      return next.type === SyntaxType.IncludeDefinition
    })

    return statements.map((next: IncludeDefinition) => {
      const basename: string = path.posix.basename(next.path.value).replace('.thrift', '')
      return {
        path: next.path.value,
        base: basename,
      }
    })
  }

  function createRenderedFile(sourcePath: string, contents: string): IRenderedFile {
    const thriftAST: ThriftDocument = parse(contents)
    const includes: IIncludeMap = compileIncludes(sourcePath, findIncludes(thriftAST))
    const resolvedAST: IResolvedFile = resolveIdentifiers(thriftAST, includes)
    const identifiers: IIdentifierMap = resolvedAST.identifiers
    const resolvedNamespace: string = getNamespace(resolvedAST.namespaces)
    const namespacePath: string = genPathForNamespace(resolvedNamespace)
    const outPath: string = outPathForSourcePath(sourcePath, namespacePath)
    const statements: Array<ts.Statement> = [
      importThrift(),
      ...importIncludes(outPath, includes, resolvedAST.includes),
      ...render(resolvedAST.body, identifiers),
    ]
    const generated: string = print(statements)

    return {
      sourcePath,
      outPath,
      namespace: resolvedNamespace,
      contents: generated,
      includes,
      identifiers,
    }
  }

  return {
    compile,
    makeFiles,
  }
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
