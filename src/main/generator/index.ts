import * as path from 'path'
import * as ts from 'typescript'

import { render } from '../render'

import {
  IIdentifierMap,
  IRenderedFileMap,
  IRenderedFile,
  IResolvedFile,
  IResolvedIncludeMap,
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
export function generateFile(rootDir: string, outDir: string, sourceDir: string, files: Array<IResolvedFile>): Array<IRenderedFile> {
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

  function createIncludes(currentPath: string, includes: IResolvedIncludeMap): IRenderedFileMap {
    return Object.keys(includes).reduce((acc: IRenderedFileMap, next: string): IRenderedFileMap => {
      const include: IResolvedFile = includes[next].file
      const renderedFile: IRenderedFile = createRenderedFile(include)
      acc[next] = renderedFile
      return acc
    }, {})
  }

  function createRenderedFile(resolvedFile: IResolvedFile): IRenderedFile {
    const includes: IRenderedFileMap = createIncludes(resolvedFile.path, resolvedFile.includes)
    const identifiers: IIdentifierMap = resolvedFile.identifiers
    const resolvedNamespace: string = getNamespace(resolvedFile.namespaces)
    const namespacePath: string = genPathForNamespace(resolvedNamespace)
    const outPath: string = outPathForSourcePath(resolvedFile.name, namespacePath)
    const statements: Array<ts.Statement> = [
      createThriftImports(),
      ...createImportsForIncludes(outPath, includes, resolvedFile.includes),
      ...render(resolvedFile.body, identifiers),
    ]

    return {
      name: resolvedFile.name,
      path: resolvedFile.path,
      outPath,
      namespace: resolvedNamespace,
      statements,
      includes,
      identifiers,
    }
  }

  return files.map((next: IResolvedFile): IRenderedFile => {
    return createRenderedFile(next)
  })
}
