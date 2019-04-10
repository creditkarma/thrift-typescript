import * as fs from 'fs'
import * as path from 'path'
import { ISourceFile } from '../types'

export function readThriftFile(
    file: string,
    searchPaths: Array<string>,
): ISourceFile {
    for (const sourcePath of searchPaths) {
        const filePath: string = path.resolve(sourcePath, file)
        if (fs.existsSync(filePath)) {
            return {
                type: 'SourceFile',
                name: path.basename(filePath, '.thrift'),
                path: path.dirname(filePath),
                fullPath: filePath,
                source: fs.readFileSync(filePath, 'utf-8'),
            }
        }
    }

    throw new Error(`Unable to find file ${file}`)
}
