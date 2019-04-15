import {
    parse,
    SyntaxType,
    ThriftDocument,
    ThriftErrors,
} from '@creditkarma/thrift-parser'
import { exportsForFile } from '../resolver'
import {
    IFileExports,
    IFileIncludes,
    INamespacePath,
    IParsedFile,
    ISourceFile,
} from '../types'
import { includesForFile, namespaceForFile } from '../utils'

export function parseThriftString(source: string): ThriftDocument {
    const thrift: ThriftDocument | ThriftErrors = parse(source)
    switch (thrift.type) {
        case SyntaxType.ThriftDocument:
            return thrift

        default:
            throw new Error('Unable to parse source: ')
    }
}

export function parseFromSource(
    source: string,
    fallbackNamespace: string,
): IParsedFile {
    const sourceFile: ISourceFile = {
        type: 'SourceFile',
        name: '',
        path: '',
        fullPath: '',
        source,
    }

    return parseThriftFile(sourceFile, fallbackNamespace)
}

export function parseThriftFile(
    file: ISourceFile,
    fallbackNamespace: string,
): IParsedFile {
    const thriftDoc: ThriftDocument = parseThriftString(file.source)
    const exports: IFileExports = exportsForFile(thriftDoc.body)
    const namespace: INamespacePath = namespaceForFile(
        thriftDoc.body,
        fallbackNamespace,
    )
    const includes: IFileIncludes = includesForFile(thriftDoc.body, file)

    return {
        type: 'ParsedFile',
        sourceFile: file,
        namespace,
        includes,
        exports,
        body: thriftDoc.body,
        errors: [],
    }
}
