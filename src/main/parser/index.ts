import {
    parse,
    SyntaxType,
    ThriftDocument,
    ThriftErrors,
} from '@creditkarma/thrift-parser'

import {
    IFileExports,
    IFileIncludes,
    INamespacePath,
    IParsedFile,
    ISourceFile,
} from '../types'

import { Resolver } from '../resolver'

function parseThriftString(source: string): ThriftDocument {
    const thrift: ThriftDocument | ThriftErrors = parse(source)
    switch (thrift.type) {
        case SyntaxType.ThriftDocument:
            return thrift

        default:
            throw new Error('Unable to parse source: ')
    }
}

function parseFromSource(
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

function parseThriftFile(
    file: ISourceFile,
    fallbackNamespace: string,
): IParsedFile {
    const thriftDoc: ThriftDocument = parseThriftString(file.source)

    const exports: IFileExports = Resolver.exportsForFile(thriftDoc.body)

    const namespace: INamespacePath = Resolver.namespaceForFile(
        thriftDoc.body,
        fallbackNamespace,
    )

    const includes: IFileIncludes = Resolver.includesForFile(
        thriftDoc.body,
        file,
    )

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

export const Parser = {
    parseFromSource,
    parseThriftString,
    parseThriftFile,
}
