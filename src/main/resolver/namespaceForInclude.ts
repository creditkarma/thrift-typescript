import * as path from 'path'

import {
    IIncludePath,
    INamespacePath,
    IParsedFile,
    IParsedFileMap,
} from '../types'
import { namespaceForFile } from './namespaceForFile'

function fileForInclude(
    includePath: IIncludePath,
    fileMap: IParsedFileMap,
    sourceDir: string,
): IParsedFile {
    // Relative to the file requesting the include
    const relativeToFile: string = path.resolve(
        includePath.importedFrom,
        includePath.path,
    )

    // Relative to the source directory
    const relativeToRoot: string = path.resolve(sourceDir, includePath.path)

    if (fileMap[relativeToFile]) {
        return fileMap[relativeToFile]
    } else if (fileMap[relativeToRoot]) {
        return fileMap[relativeToRoot]
    } else {
        throw new Error(`No file for include: ${includePath.path}`)
    }
}

export function namespaceForInclude(
    includePath: IIncludePath,
    fileMap: IParsedFileMap,
    sourceDir: string,
    fallbackNamespace: string,
): INamespacePath {
    const file: IParsedFile = fileForInclude(includePath, fileMap, sourceDir)
    const namespace: INamespacePath = namespaceForFile(
        file.body,
        fallbackNamespace,
    )

    return namespace
}
