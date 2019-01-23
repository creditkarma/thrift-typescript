import { IMakeOptions } from './types'

export const DEFAULT_OPTIONS: IMakeOptions = Object.freeze({
    rootDir: '.',
    outDir: './codegen',
    sourceDir: './thrift',
    target: 'apache',
    files: (Object.freeze([]) as unknown) as Array<string>,
    fallbackNamespace: 'java',
    library: '',
} as IMakeOptions)
