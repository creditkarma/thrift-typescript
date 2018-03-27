import { lstatSync } from 'fs'

import { IMakeOptions } from '../types'

/**
 * --rootDir
 * --outDir
 * --removeComments
 */
export function resolveOptions(args: Array<string>): IMakeOptions {
    const len: number = args.length
    let index: number = 0
    const options: IMakeOptions = {
        rootDir: '.',
        outDir: './codegen',
        sourceDir: './thrift',
        target: 'apache',
        strict: true,
        files: []
    }

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

            case '--strict':
                options.strict = args[index + 1] !== 'false'
                index += 2
                break;

            case '--target':
                const option = args[index + 1]
                if (option === 'apache' || option === 'thrift-server') {
                    options.target = option
                } else {
                    throw new Error(`Unsupported target: ${option}`)
                }
                index += 2
                break

            default:
                if (next.startsWith('--')) {
                    throw new Error(`Unknown option provided to generator "${next}"`)
                } else {
                    // Assume option is a file to render
                    options.files.push(next)
                    index += 1
                }
        }
    }

    return options
}
