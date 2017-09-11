import { lstatSync } from 'fs'

import {
  IMakeOptions
} from '../index'

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
    outDir: './thrift',
    removeComments: false,
    files: []
  }

  while (index < len) {
    const next: string = args[index]

    switch (next) {
      case '--rootDir':
        options.rootDir = args[(index + 1)]
        try {
          if (lstatSync(options.rootDir).isDirectory()) {
            index += 2
            break
          } else {
            throw new Error(`Provided root directory "${options.rootDir}" isn't a directory`)
          }
        } catch(e) {
          throw new Error(`Provided root directory "${options.rootDir}" doesn't exist`)
        }

      case '--outDir':
        options.outDir = args[(index + 1)]
        index += 2
        break

      case '--removeComments':
        options.removeComments = (args[(index + 1)] === 'true')
        index += 2
        break

      // Assume option is a file to render
      default:
        options.files.push(next)
        index += 1
    }
  }

  return options
}