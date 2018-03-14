import { ThriftDocument, ThriftStatement, NamespaceDefinition, SyntaxType } from '@creditkarma/thrift-parser'

import { IResolvedNamespace, IResolvedNamespaceMap } from '../types'

function createPathForNamespace(ns: string): string {
    return ns.split('.').join('/')
}

function emptyNamespace(): IResolvedNamespace {
    return {
        scope: '',
        name: '',
        path: ''
    }
}

/**
 * In Scrooge we are defaulting to use the Java namespace, so keeping that for now.
 * Probably want to update at somepoint to not fall back to that, or have the fallback
 * be configurable.
 *
 * @param namespaces
 */
function getNamesapce(namespaces: IResolvedNamespaceMap): IResolvedNamespace {
    return namespaces.js != null
        ? namespaces.js
        : namespaces.java != null ? namespaces.java : emptyNamespace()
}

/**
 * Find the namespace for use by this file.
 *
 * @param thrift
 */
export function resolveNamespace(thrift: ThriftDocument): IResolvedNamespace {
    const statements: Array<NamespaceDefinition> = thrift.body.filter(
        (next: ThriftStatement): next is NamespaceDefinition => {
            return next.type === SyntaxType.NamespaceDefinition
        }
    )

    return getNamesapce(
        statements.reduce(
            (acc: IResolvedNamespaceMap, next: NamespaceDefinition) => {
                acc[next.scope.value] = {
                    scope: next.scope.value,
                    name: next.name.value,
                    path: createPathForNamespace(next.name.value)
                }
                return acc
            },
            {} as IResolvedNamespaceMap
        )
    )
}
