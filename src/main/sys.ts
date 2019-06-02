import * as fs from 'fs-extra'
import * as path from 'path'

import { print } from './printer'
import { IGeneratedFile } from './types'

export function saveFiles(files: Array<IGeneratedFile>, outDir: string): void {
    files.forEach((next: IGeneratedFile) => {
        const outPath: string = path.resolve(
            outDir,
            next.path,
            `${next.name}.${next.ext}`,
        )

        try {
            fs.outputFileSync(outPath, print(next.body, true))
        } catch (err) {
            throw new Error(`Unable to save generated files to: ${outPath}`)
        }
    })
}
