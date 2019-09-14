import { Identifier, SyntaxType } from '@creditkarma/thrift-parser'
import { INamespace, INamespacePath } from '../types'

export function resolveIdentifier(
    id: Identifier,
    currentNamespace: INamespace,
): Identifier {
    return {
        type: SyntaxType.Identifier,
        value: resolveName(id.value, currentNamespace),
        annotations: id.annotations,
        loc: id.loc,
    }
}

export function resolveName(
    name: string,
    currentNamespace: INamespace,
): string {
    const [head, ...tail] = name.split('.')

    if (currentNamespace.exports[head] !== undefined) {
        return name
    } else if (currentNamespace.includedNamespaces[head] !== undefined) {
        const namespacePath: INamespacePath =
            currentNamespace.includedNamespaces[head]
        return [namespacePath.accessor, ...tail].join('.')
    } else if (currentNamespace.namespaceIncludes[head]) {
        const namespaceAccessor: string =
            currentNamespace.namespaceIncludes[head]
        return [namespaceAccessor, ...tail].join('.')
    } else {
        return name
    }
}
