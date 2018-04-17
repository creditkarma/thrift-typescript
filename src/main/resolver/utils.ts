import * as path from 'path'
import { ThriftDocument, ThriftStatement, NamespaceDefinition, SyntaxType } from '@creditkarma/thrift-parser'

import { INamespace, INamespaceMap } from '../types'

function createPathForNamespace(outPath: string, ns: string): string {
    return path.resolve(outPath, ns.split('.').join('/'), 'index.ts')
}

function emptyNamespace(): INamespace {
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
function getNamesapce(namespaces: INamespaceMap): INamespace {
    return namespaces.js != null
        ? namespaces.js
        : namespaces.java != null ? namespaces.java : emptyNamespace()
}

/**
 * Find the namespace for use by this file.
 *
 * @param thrift
 */
export function resolveNamespace(outPath: string, thrift: ThriftDocument): INamespace {
    const statements: Array<NamespaceDefinition> = thrift.body.filter(
        (next: ThriftStatement): next is NamespaceDefinition => {
            return next.type === SyntaxType.NamespaceDefinition
        }
    )

    return getNamesapce(
        statements.reduce(
            (acc: INamespaceMap, next: NamespaceDefinition) => {
                acc[next.scope.value] = {
                    scope: next.scope.value,
                    name: next.name.value,
                    path: createPathForNamespace(outPath, next.name.value)
                }
                return acc
            },
            {} as INamespaceMap
        )
    )
}
