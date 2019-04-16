import { lstatSync } from 'fs'

import { DEFAULT_OPTIONS, defaultLibrary } from '../defaults'
import { IMakeOptions } from '../types'
import { deepCopy, deepMerge } from '../utils'

/**
 * Options:
 *
 * --rootDir
 * --outDir
 * --removeComments
 * --strictUnions
 * --fallbackNamespace
 * --library
 */
export function resolveOptions(args: Array<string>): IMakeOptions {
    const len: number = args.length
    let index: number = 0
    const options: IMakeOptions = deepCopy(DEFAULT_OPTIONS)

    while (index < len) {
        const next: string = args[index]

        switch (next) {
            case '--rootDir':
                options.rootDir = args[index + 1]
                try {
                    if (lstatSync(options.rootDir).isDirectory()) {
                        index += 2
                        break
                    } else {
                        throw new Error(
                            `Provided root directory "${
                                options.rootDir
                            }" isn't a directory`,
                        )
                    }
                } catch (e) {
                    throw new Error(
                        `Provided root directory "${
                            options.rootDir
                        }" doesn't exist`,
                    )
                }

            case '--sourceDir':
                options.sourceDir = args[index + 1]
                index += 2
                break

            case '--outDir':
                options.outDir = args[index + 1]
                index += 2
                break

            case '--target':
                const option = args[index + 1]
                if (option === 'apache' || option === 'thrift-server') {
                    options.target = option
                } else {
                    throw new Error(`Unsupported target: ${option}`)
                }
                index += 2
                break

            case '--library':
                options.library = args[index + 1]
                index += 2

            case '--fallbackNamespace':
                options.fallbackNamespace = args[index + 1]
                index += 2
                break

            case '--strictUnions':
                options.strictUnions = true
                index += 1
                break

            case '--strictUnionsComplexNames':
                options.strictUnionsComplexNames = true
                index += 1
                break

            case '--withNameField':
                options.withNameField = true
                index += 1
                break

            default:
                if (next.startsWith('--')) {
                    throw new Error(
                        `Unknown option provided to generator "${next}"`,
                    )
                } else {
                    // Assume option is a file to render
                    options.files.push(next)
                    index += 1
                }
        }
    }

    return deepMerge(options, {
        library: defaultLibrary(options),
    })
}
