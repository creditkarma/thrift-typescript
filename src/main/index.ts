export * from './types'

import * as fs from 'fs'
import * as path from 'path'

import {
  parse,
  ThriftDocument,
} from '@creditkarma/thrift-parser'

import {
  resolve,
} from './resolver'

import {
  IMakeOptions,
  IRenderedFile,
  IResolvedFile,
} from './types'

import {
  print,
} from './printer'

import {
  render,
} from './render'

import {
  compile,
} from './generator'

import {
  mkdir,
} from './sys'

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
  const resolvedAST: IResolvedFile = resolve(thriftAST, {})
  return print(render(thriftAST.body, resolvedAST.identifiers))
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
  mkdir(outDir)
  collectAllFiles(files).forEach((next: IRenderedFile) => {
    mkdir(path.dirname(next.outPath))
    fs.writeFile(next.outPath, print(next.statements), (err: Error) => {
      if (err != null) {
        throw new Error(`Unable to save generated files to: ${next.outPath}`)
      }
    })
  })
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
  const renderedFiles: Array<IRenderedFile> = compile(options)
  saveFiles(rootDir, outDir, renderedFiles)
}
