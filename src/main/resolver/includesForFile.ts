import { SyntaxType, ThriftStatement } from '@creditkarma/thrift-parser'
import { IFileIncludes, ISourceFile } from '../types'

function nameForInclude(fullInclude: string): string {
    const body = fullInclude.replace('.thrift', '')
    const parts = body.split('/')

    return parts[parts.length - 1]
}

export function includesForFile(
    fileBody: Array<ThriftStatement>,
    sourceFile: ISourceFile,
): IFileIncludes {
    return fileBody.reduce((acc: IFileIncludes, next: ThriftStatement) => {
        if (next.type === SyntaxType.IncludeDefinition) {
            const includeName = nameForInclude(next.path.value)

            acc[includeName] = {
                type: 'IncludePath',
                path: next.path.value,
                importedFrom: sourceFile.path,
            }
        }

        return acc
    }, {})
}
