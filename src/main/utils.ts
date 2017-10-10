import * as fs from 'fs'
import * as glob from 'glob'
import * as path from 'path'

import {
  IncludeDefinition,
  parse,
  SyntaxType,
  ThriftDocument,
  ThriftErrors,
  ThriftStatement,
} from '@creditkarma/thrift-parser'

import {
  IIncludeData,
  IMakeOptions,
  IParsedFile,
  IRenderedFile,
  IResolvedFile,
  IResolvedIncludeMap,
  IThriftFile,
} from './types'

import {
  print,
} from './printer'

import {
  mkdir,
} from './sys'

export function collectSourceFiles(sourceDir: string, options: IMakeOptions): Array<string> {
  if (options.files && options.files.length > 0) {
    return options.files
  } else {
    return glob.sync(`${sourceDir}/**/*.thrift`)
  }
}

export function parseThriftString(source: string): ThriftDocument {
  const thrift: ThriftDocument | ThriftErrors = parse(source)
  switch (thrift.type) {
    case SyntaxType.ThriftDocument:
      return thrift

    default:
      throw new Error('Unable to parse source')
  }
}

/**
 * This utility flattens files and their includes to make them easier to iterate through while
 * generating files.
 *
 * @param files
 */
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

export function saveFiles(rootDir: string, outDir: string, files: Array<IRenderedFile>): void {
  collectAllFiles(files).forEach((next: IRenderedFile) => {
    mkdir(path.dirname(next.outPath))
    try {
      fs.writeFileSync(next.outPath, print(next.statements, true))
    } catch (err) {
      throw new Error(`Unable to save generated files to: ${next.outPath}`)
    }
  })
}

export function readThriftFile(file: string, searchPaths: Array<string>): IThriftFile {
  for (const sourcePath of searchPaths) {
    const filePath: string = path.resolve(sourcePath, file)
    if (fs.existsSync(filePath)) {
      return {
        name: path.basename(filePath, '.thrift'),
        path: path.dirname(filePath),
        source: fs.readFileSync(filePath, 'utf-8'),
      }
    }
  }

  throw new Error(`Unable to find file ${file}`)
}

function collectIncludes(thrift: ThriftDocument): Array<IIncludeData> {
  const statements: Array<ThriftStatement> = thrift.body.filter((next: ThriftStatement): boolean => {
    return next.type === SyntaxType.IncludeDefinition
  })

  return statements.map((next: IncludeDefinition): IIncludeData => ({
    path: next.path.value,
    base: path.basename(next.path.value).replace('.thrift', ''),
  }))
}

function parseInclude(currentPath: string, sourceDir: string, include: IIncludeData): IParsedFile {
  return parseFile(sourceDir, readThriftFile(include.path, [ currentPath, sourceDir ]))
}

/**
 * interface IParsedFile {
 *   name: string
 *   path: string
 *   includes: Array<IParsedFile>
 *   ast: ThriftDocument
 * }
 *
 * @param sourceDir
 * @param file
 */
export function parseFile(sourceDir: string, file: IThriftFile): IParsedFile {
  const ast: ThriftDocument = parseThriftString(file.source)
  const includes: Array<IParsedFile> = collectIncludes(ast).map((next: IIncludeData): IParsedFile => {
    return parseInclude(file.path, sourceDir, next)
  })

  return {
    name: file.name,
    path: file.path,
    source: file.source,
    includes,
    ast,
  }
}

export function parseSource(source: string): IParsedFile {
  return {
    name: 'source',
    path: '',
    source,
    includes: [],
    ast: parseThriftString(source),
  }
}

function includeListForMap(includes: IResolvedIncludeMap): Array<IResolvedFile> {
  const includeList: Array<IResolvedFile> = []
  for (const name of Object.keys(includes)) {
    includeList.push(includes[name].file)
  }
  return includeList
}

export function collectInvalidFiles(
  resolvedFiles: Array<IResolvedFile>,
  errors: Array<IResolvedFile> = [],
): Array<IResolvedFile> {
  for (const file of resolvedFiles) {
    if (file.errors.length > 0) {
      errors.push(file)
      collectInvalidFiles(includeListForMap(file.includes), errors)
    }
  }

  return errors
}
