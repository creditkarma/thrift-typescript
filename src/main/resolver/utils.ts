import {
    NamespaceDefinition,
    SyntaxType,
    ThriftDocument,
    ThriftStatement,
} from '@creditkarma/thrift-parser'
import * as path from 'path'

import { IMakeOptions, INamespace, INamespaceMap } from '../types'

function createPathForNamespace(outPath: string, ns: string): string {
    return path.resolve(outPath, ns.split('.').join('/'), 'index.ts')
}

function emptyNamespace(outPath: string = ''): INamespace {
    return {
        scope: '',
        name: '',
        path: createPathForNamespace(outPath, ''),
    }
}

/**
 * In Scrooge we are defaulting to use the Java namespace, so keeping that for now.
 * Probably want to update at somepoint to not fall back to that, or have the fallback
 * be configurable.
 *
 * @param namespaces
 */
function getNamespace(
    outPath: string,
    namespaces: INamespaceMap,
    options: IMakeOptions,
): INamespace {
    if (namespaces.js) {
        return namespaces.js
    } else if (
        options.fallbackNamespace !== 'none' &&
        namespaces[options.fallbackNamespace]
    ) {
        return namespaces[options.fallbackNamespace]
    } else {
        return emptyNamespace(outPath)
    }
}

/**
 * Find the namespace for use by this file.
 *
 * @param thrift
 */
export function resolveNamespace(
    outPath: string,
    thrift: ThriftDocument,
    options: IMakeOptions,
): INamespace {
    const statements: Array<NamespaceDefinition> = thrift.body.filter(
        (next: ThriftStatement): next is NamespaceDefinition => {
            return next.type === SyntaxType.NamespaceDefinition
        },
    )

    return getNamespace(
        outPath,
        statements.reduce(
            (acc: INamespaceMap, next: NamespaceDefinition) => {
                acc[next.scope.value] = {
                    scope: next.scope.value,
                    name: next.name.value,
                    path: createPathForNamespace(outPath, next.name.value),
                }
                return acc
            },
            {} as INamespaceMap,
        ),
        options,
    )
}
