import { SyntaxType, ThriftStatement } from '@creditkarma/thrift-parser'

import {
    IIncludePath,
    INamespaceMap,
    INamespacePath,
    IParsedFile,
    IParsedFileMap,
} from '../types'

import { namespaceForInclude } from './namespaceForInclude'

export function organizeByNamespace(
    parsedFiles: Array<IParsedFile>,
    sourceDir: string,
    fallbackNamespace: string,
): INamespaceMap {
    const parsedFileMap: IParsedFileMap = parsedFiles.reduce(
        (acc: IParsedFileMap, next: IParsedFile) => {
            acc[next.sourceFile.fullPath] = next
            return acc
        },
        {},
    )

    return parsedFiles.reduce((acc: INamespaceMap, parsedFile: IParsedFile) => {
        const namespaceAccessor: string = parsedFile.namespace.accessor
        let namespace = acc[namespaceAccessor]
        if (namespace === undefined) {
            namespace = {
                type: 'Namespace',
                namespace: parsedFile.namespace,
                includedNamespaces: {},
                namespaceIncludes: {},
                errors: [],
                exports: {},
                constants: [],
                enums: [],
                typedefs: [],
                structs: [],
                unions: [],
                exceptions: [],
                services: [],
            }

            acc[namespaceAccessor] = namespace
        }

        Object.keys(parsedFile.includes).forEach(
            (includeName: string): void => {
                const includePath: IIncludePath =
                    parsedFile.includes[includeName]

                const namespacePath: INamespacePath = namespaceForInclude(
                    includePath,
                    parsedFileMap,
                    sourceDir,
                    fallbackNamespace,
                )

                namespace.includedNamespaces[
                    namespacePath.accessor
                ] = namespacePath

                namespace.namespaceIncludes[includeName] =
                    namespacePath.accessor
            },
        )

        parsedFile.body.forEach((statement: ThriftStatement) => {
            switch (statement.type) {
                case SyntaxType.ConstDefinition:
                    namespace.constants.push(statement)
                    namespace.exports[statement.name.value] = statement
                    break

                case SyntaxType.EnumDefinition:
                    namespace.enums.push(statement)
                    namespace.exports[statement.name.value] = statement
                    break

                case SyntaxType.TypedefDefinition:
                    namespace.typedefs.push(statement)
                    namespace.exports[statement.name.value] = statement
                    break

                case SyntaxType.StructDefinition:
                    namespace.structs.push(statement)
                    namespace.exports[statement.name.value] = statement
                    break

                case SyntaxType.UnionDefinition:
                    namespace.unions.push(statement)
                    namespace.exports[statement.name.value] = statement
                    break

                case SyntaxType.ExceptionDefinition:
                    namespace.exceptions.push(statement)
                    namespace.exports[statement.name.value] = statement
                    break

                case SyntaxType.ServiceDefinition:
                    namespace.services.push(statement)
                    namespace.exports[statement.name.value] = statement
                    break
            }
        })

        return acc
    }, {})
}
