import { IMakeOptions } from './types'

export const DEFAULT_OPTIONS: IMakeOptions = {
    rootDir: '.',
    outDir: './codegen',
    sourceDir: './thrift',
    target: 'apache',
    files: [],
    i64Type: 'number',
}
