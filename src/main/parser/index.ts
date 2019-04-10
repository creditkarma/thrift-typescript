import {
    parse,
    SyntaxType,
    ThriftDocument,
    ThriftErrors,
} from '@creditkarma/thrift-parser'
import { exportsForFile } from '../resolver/utils'
import {
    IFileExports,
    IFileIncludes,
    IMakeOptions,
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
    options: IMakeOptions,
): IParsedFile {
    const sourceFile: ISourceFile = {
        type: 'SourceFile',
        name: '',
        path: '',
        fullPath: '',
        source,
    }

    return parseThriftFile(sourceFile, options)
}

export function parseThriftFile(
    file: ISourceFile,
    options: IMakeOptions,
): IParsedFile {
    const thriftDoc: ThriftDocument = parseThriftString(file.source)
    const exports: IFileExports = exportsForFile(thriftDoc.body)
    const namespace: INamespacePath = namespaceForFile(thriftDoc.body, options)
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
