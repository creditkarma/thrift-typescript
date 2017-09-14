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

import { render } from '../render'

import { resolveIdentifiers } from '../resolver'

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
} from '../types'

import {
  mkdir,
  print,
  collectIncludes,
  collectAllFiles,
  createImportsForIncludes,
  createThriftImports,
  genPathForNamespace,
  getNamespace
} from './utils'

export interface IThriftGenerator {
  compile(): Array<IRenderedFile>
  makeFiles(): void
}

/**
 * This function is mostly for testing purposes. It does not support includes.
 * Given a string of Thrift IDL it will return a string of TypeScript. If the
 * given Thrift IDL uses any identifiers not defined in that text an error will
 * be thrown when trying to build the TypeScript AST.
 *
 * @param source
 */
export function make(source: string): string {
  const thriftAST: ThriftDocument = parse(source)
  const resolvedAST: IResolvedFile = resolveIdentifiers(thriftAST, {})
  return print(render(thriftAST.body, resolvedAST.identifiers))
}

/**
 * The generator is the primary interface for generating TypeScript code from
 * Thrift IDL. It takes a hash of options that inform it on how to resolve files
 * and where to save generated code.
 *
 * When a Thrift file includes another Thrift file the first place we search for
 * the include is local to the including file. If no matching file is found we
 * search relative to the sourceDir defined in the options.
 *
 * @param options
 */
export function createGenerator(options: IMakeOptions): IThriftGenerator {
  const rootDir: string = path.resolve(process.cwd(), options.rootDir)
  const outDir: string = path.resolve(rootDir, options.outDir)
  const sourceDir: string = path.resolve(rootDir, options.sourceDir)

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

  function createRenderedFile(sourcePath: string, sourceContents: string): IRenderedFile {
    const thriftAST: ThriftDocument = parse(sourceContents)
    const includes: IIncludeMap = compileIncludes(sourcePath, collectIncludes(thriftAST))
    const resolvedAST: IResolvedFile = resolveIdentifiers(thriftAST, includes)
    const identifiers: IIdentifierMap = resolvedAST.identifiers
    const resolvedNamespace: string = getNamespace(resolvedAST.namespaces)
    const namespacePath: string = genPathForNamespace(resolvedNamespace)
    const outPath: string = outPathForSourcePath(sourcePath, namespacePath)
    const statements: Array<ts.Statement> = [
      createThriftImports(),
      ...createImportsForIncludes(outPath, includes, resolvedAST.includes),
      ...render(resolvedAST.body, identifiers),
    ]
    const contents: string = print(statements)

    return {
      sourcePath,
      outPath,
      namespace: resolvedNamespace,
      contents,
      includes,
      identifiers,
    }
  }

  return {
    compile,
    makeFiles,
  }
}
