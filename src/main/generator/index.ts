import * as path from 'path'
import * as ts from 'typescript'

import { render } from '../render'
import { resolve } from '../resolver'
import { validate } from '../validator'

import {
  IIdentifierMap,
  IIncludeMap,
  IRenderedFile,
  IResolvedFile,
  IParsedFile,
} from '../types'

import {
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
export function compile(rootDir: string, outDir: string, sourceDir: string, files: Array<IParsedFile>): Array<IRenderedFile> {
  function outPathForSourcePath(fileName: string, namespacePath: string): string {
    const basename: string = path.basename(fileName, '.thrift')
    const filename: string = `${basename}.ts`
    const outFile: string = path.resolve(
      outDir,
      namespacePath,
      filename,
    )

    return outFile
  }

  function createIncludes(currentPath: string, includes: Array<IParsedFile>): IIncludeMap {
    return includes.reduce((acc: IIncludeMap, next: IParsedFile): IIncludeMap => {
      const renderedFile: IRenderedFile = createRenderedFile(next)
      const includeName: string = next.name.replace('.thrift', '')
      acc[includeName] = renderedFile
      return acc
    }, {})
  }

  function createRenderedFile(parsedFile: IParsedFile): IRenderedFile {
    const includes: IIncludeMap = createIncludes(parsedFile.path, parsedFile.includes)
    const resolvedAST: IResolvedFile = resolve(parsedFile.ast, includes)
    const validatedAST: IResolvedFile = validate(resolvedAST)
    const identifiers: IIdentifierMap = validatedAST.identifiers
    const resolvedNamespace: string = getNamespace(validatedAST.namespaces)
    const namespacePath: string = genPathForNamespace(resolvedNamespace)
    const outPath: string = outPathForSourcePath(parsedFile.name, namespacePath)
    const statements: Array<ts.Statement> = [
      createThriftImports(),
      ...createImportsForIncludes(outPath, includes, validatedAST.includes),
      ...render(validatedAST.body, identifiers),
    ]

    return {
      sourcePath: parsedFile.path,
      outPath,
      namespace: resolvedNamespace,
      statements,
      includes,
      identifiers,
    }
  }

  return files.map((next: IParsedFile): IRenderedFile => {
    return createRenderedFile(next)
  })
}
