import { IMakeOptions } from './types'
import { deepMerge } from './utils'

export const DEFAULT_APACHE_LIB = 'thrift'

export const DEFAULT_THRIFT_SERVER_LIB = '@creditkarma/thrift-server-core'

export const DEFAULT_OPTIONS: IMakeOptions = {
    rootDir: '.',
    outDir: './codegen',
    sourceDir: './thrift',
    target: 'apache',
    files: [],
    library: DEFAULT_APACHE_LIB,
    strictUnions: false,
    fallbackNamespace: 'java',
}

export function mergeWithDefaults(
    options: Partial<IMakeOptions>,
): IMakeOptions {
    if (
        options.target &&
        (options.library === undefined || options.library.trim() === '')
    ) {
        options.library =
            options.target === 'apache'
                ? DEFAULT_APACHE_LIB
                : DEFAULT_THRIFT_SERVER_LIB
    }

    return deepMerge(DEFAULT_OPTIONS, options)
}
