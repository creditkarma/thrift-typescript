import { lstatSync } from 'fs'

import { DEFAULT_OPTIONS } from '../defaults'
import { IMakeOptions } from '../types'
import { deepCopy } from '../utils'

/**
 * --rootDir
 * --outDir
 * --removeComments
 */
export function resolveOptions(args: Array<string>): IMakeOptions {
    const len: number = args.length
    let index: number = 0
    const options = deepCopy(DEFAULT_OPTIONS)

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
                        throw new Error(`Provided root directory "${options.rootDir}" isn't a directory`)
                    }

                } catch (e) {
                    throw new Error(`Provided root directory "${options.rootDir}" doesn't exist`)
                }

            case '--sourceDir':
                options.sourceDir = args[index + 1]
                index += 2
                break

            case '--outDir':
                options.outDir = args[index + 1]
                index += 2
                break

            case '--target': {
                const option = args[index + 1]
                if (option === 'apache' || option === 'thrift-server') {
                    options.target = option
                } else {
                    throw new Error(`Unsupported target: ${option}`)
                }
                index += 2
                break
            }

            case '--i64Type': {
                const option = args[index + 1]
                if (option === 'string' || option === 'number' || option === 'Int64') {
                    options.i64Type = option
                } else {
                    throw new Error(`Unsupported i64Type: ${option}`)
                }
                index += 2
                break
            }

            default:
                if (next.startsWith('--')) {
                    throw new Error(`Unknown option provided to generator "${next}"`)

                } else if (next.trim() === '') {
                    index += 1

                } else {
                    // Assume option is a file to render
                    options.files.push(next)
                    index += 1
                }
        }
    }

    return options
}
