export * from './types'

import * as fs from 'fs'
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
  IThriftFile,
} from './types'

import {
  print,
} from './printer'

import {
  resolveFile,
} from './resolver'

import {
  validateFile,
} from './validator'

import {
  generateFile,
  processStatements,
} from './generator'

import {
  mkdir,
} from './sys'

import {
  renderer,
} from './render'

/**
 * This function is mostly for testing purposes. It does not support includes.
 * Given a string of Thrift IDL it will return a string of TypeScript. If the
 * given Thrift IDL uses any identifiers not defined in that text an error will
 * be thrown when trying to build the TypeScript AST.
 *
 * @param source
 */
export function make(source: string): string {
  const parsedFile: IParsedFile = parseSource(source)
  const resolvedAST: IResolvedFile = resolveFile(parsedFile)
  return print(processStatements(resolvedAST.body, resolvedAST.identifiers, renderer))
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

function saveFiles(rootDir: string, outDir: string, files: Array<IRenderedFile>): void {
  collectAllFiles(files).forEach((next: IRenderedFile) => {
    mkdir(path.dirname(next.outPath))
    fs.writeFile(next.outPath, print(next.statements), (err: Error) => {
      if (err != null) {
        throw new Error(`Unable to save generated files to: ${next.outPath}`)
      }
    })
  })
}

function readThriftFile(file: string, searchPaths: Array<string>): IThriftFile {
  for (const sourcePath of searchPaths) {
    const filePath: string = path.resolve(sourcePath, file)
    if (fs.existsSync(filePath)) {
      return {
        name: path.basename(filePath, '.thrift'),
        path: path.dirname(filePath),
        contents: fs.readFileSync(filePath, 'utf-8'),
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
function parseFile(sourceDir: string, file: IThriftFile): IParsedFile {
  const ast: ThriftDocument = parseThriftString(file.contents)
  const includes: Array<IParsedFile> = collectIncludes(ast).map((next: IIncludeData): IParsedFile => {
    return parseInclude(file.path, sourceDir, next)
  })

  return {
    name: file.name,
    path: file.path,
    includes,
    ast,
  }
}

function parseSource(source: string): IParsedFile {
  return {
    name: 'source',
    path: '',
    includes: [],
    ast: parseThriftString(source),
  }
}

function parseThriftString(source: string): ThriftDocument {
  const thrift: ThriftDocument | ThriftErrors = parse(source)
  switch (thrift.type) {
    case SyntaxType.ThriftDocument:
      return thrift

    default:
      throw new Error('Unable to parse source')
  }
}

/**
 * Generate TypeScript files from Thrift IDL files. The generated TS files will be saved
 * based on the options passed in.
 *
 * rootDir: All file operations are relative to this
 * sourceDir: Where to look for Thrift IDL source files
 * outDir: Where to save generated TS files
 * files: Array of Thrift IDL files to generate from
 *
 * @param options
 */
export function generate(options: IMakeOptions): void {
  const rootDir: string = path.resolve(process.cwd(), options.rootDir)
  const outDir: string = path.resolve(rootDir, options.outDir)
  const sourceDir: string = path.resolve(rootDir, options.sourceDir)

  const renderedFiles: Array<IRenderedFile> = options.files.map((next: string): IRenderedFile => {
    const thriftFile: IThriftFile = readThriftFile(next, [ sourceDir ])
    const parsedFile: IParsedFile = parseFile(sourceDir, thriftFile)
    const resolvedFile: IResolvedFile = resolveFile(parsedFile)
    const validatedFile: IResolvedFile = validateFile(resolvedFile)
    const renderedFile: IRenderedFile = generateFile(renderer, rootDir, outDir, sourceDir, validatedFile)
    return renderedFile
  })

  saveFiles(rootDir, outDir, renderedFiles)
}
