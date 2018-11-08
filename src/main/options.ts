import { IMakeOptions } from './types'

export const DEFAULT_OPTIONS: IMakeOptions = Object.freeze({
    rootDir: '.',
    outDir: './codegen',
    sourceDir: './thrift',
    target: 'apache',
    files: [],
    fallbackNamespace: 'java',
} as IMakeOptions)
