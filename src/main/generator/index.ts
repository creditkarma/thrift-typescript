import * as fs from 'fs'
import * as path from 'path'
import * as ts from 'typescript'

import {
  parse,
  ThriftDocument,
} from '@creditkarma/thrift-parser'

import { render } from '../render'
import { resolve } from '../resolver'
import { validate } from '../validator'

import {
  IIdentifierMap,
  IIncludeData,
  IIncludeMap,
  IMakeOptions,
  IRenderedFile,
  IResolvedFile,
} from '../types'

import {
  collectIncludes,
  createImportsForIncludes,
  createThriftImports,
  genPathForNamespace,
  getNamespace
} from './utils'

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
export function compile(options: IMakeOptions): Array<IRenderedFile> {
  const rootDir: string = path.resolve(process.cwd(), options.rootDir)
  const outDir: string = path.resolve(rootDir, options.outDir)
  const sourceDir: string = path.resolve(rootDir, options.sourceDir)

  function outPathForSourcePath(sourcePath: string, namespacePath: string): string {
    const basename: string = path.basename(sourcePath, '.thrift')
    const filename: string = `${basename}.ts`
    const outFile: string = path.resolve(
      outDir,
      namespacePath,
      filename,
    )

    return outFile
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
    const resolvedAST: IResolvedFile = resolve(thriftAST, includes)
    const validatedAST: IResolvedFile = validate(resolvedAST)
    const identifiers: IIdentifierMap = validatedAST.identifiers
    const resolvedNamespace: string = getNamespace(validatedAST.namespaces)
    const namespacePath: string = genPathForNamespace(resolvedNamespace)
    const outPath: string = outPathForSourcePath(sourcePath, namespacePath)
    const statements: Array<ts.Statement> = [
      createThriftImports(),
      ...createImportsForIncludes(outPath, includes, validatedAST.includes),
      ...render(validatedAST.body, identifiers),
    ]

    return {
      sourcePath,
      outPath,
      namespace: resolvedNamespace,
      statements,
      includes,
      identifiers,
    }
  }

  return options.files.map(compileFile)
}
