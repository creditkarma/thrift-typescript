import { IMakeOptions } from './types'
import { deepMerge } from './utils'

export const DEFAULT_APACHE_LIB = 'thrift'

export const DEFAULT_THRIFT_SERVER_LIB = '@creditkarma/thrift-server-core'

export const DEFAULT_OPTIONS: IMakeOptions = {
    rootDir: '.',
    outDir: './codegen',
    sourceDir: './thrift',
    target: 'apache',
    library: DEFAULT_APACHE_LIB,
    files: [],
    strictUnions: false,
    strictUnionsComplexNames: false,
    fallbackNamespace: 'java',
    withNameField: false,
}

export function defaultLibrary(options: Partial<IMakeOptions>): string {
    if (
        options.target === 'thrift-server' &&
        (!options.library || options.library === DEFAULT_APACHE_LIB)
    ) {
        return DEFAULT_THRIFT_SERVER_LIB
    } else if (options.library) {
        return options.library
    } else {
        return DEFAULT_APACHE_LIB
    }
}

export function mergeWithDefaults(
    options: Partial<IMakeOptions>,
): IMakeOptions {
    options.library = defaultLibrary(options)
    return deepMerge(DEFAULT_OPTIONS, options)
}
