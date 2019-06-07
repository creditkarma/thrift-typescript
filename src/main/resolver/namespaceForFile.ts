import {
    NamespaceDefinition,
    SyntaxType,
    ThriftStatement,
} from '@creditkarma/thrift-parser'
import { INamespacePath, INamespacePathMap } from '../types'

function emptyNamespace(): INamespacePath {
    return {
        type: 'NamespacePath',
        scope: '',
        name: '__ROOT_NAMESPACE__',
        path: createPathForNamespace(''),
        accessor: '__ROOT_NAMESPACE__',
    }
}

function createPathForNamespace(ns: string): string {
    return ns.split('.').join('/')
}

function resolveNamespaceAccessor(namespaceName: string): string {
    return namespaceName
        .split('')
        .map((next: string) => {
            if (next === '.') {
                return '_'
            } else {
                return next
            }
        })
        .join('')
}

function collectNamespaces(
    fileBody: Array<ThriftStatement>,
): INamespacePathMap {
    return fileBody
        .filter((next: ThriftStatement): next is NamespaceDefinition => {
            return next.type === SyntaxType.NamespaceDefinition
        })
        .reduce((acc: INamespacePathMap, def: NamespaceDefinition) => {
            const includeAccessor: string = resolveNamespaceAccessor(
                def.name.value,
            )

            acc[def.scope.value] = {
                type: 'NamespacePath',
                scope: def.scope.value,
                name: def.name.value,
                path: createPathForNamespace(def.name.value),
                accessor: includeAccessor,
            }

            return acc
        }, {})
}

export function namespaceForFile(
    fileBody: Array<ThriftStatement>,
    fallbackNamespace: string,
): INamespacePath {
    const namespaceMap = collectNamespaces(fileBody)

    if (namespaceMap.js) {
        return namespaceMap.js
    } else if (
        fallbackNamespace !== 'none' &&
        namespaceMap[fallbackNamespace]
    ) {
        return namespaceMap[fallbackNamespace]
    } else {
        return emptyNamespace()
    }
}
