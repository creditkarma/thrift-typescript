import { Identifier, SyntaxType } from '@creditkarma/thrift-parser'

import { ValidationError } from '../errors'

import {
    DefinitionType,
    INamespace,
    INamespacePath,
    IResolveContext,
} from '../types'

import { stubIdentifier } from '../utils'

export function resolveIdentifierDefinition(
    id: Identifier,
    context: IResolveContext,
): DefinitionType {
    if (context.currentNamespace.exports[id.value]) {
        const definition: DefinitionType =
            context.currentNamespace.exports[id.value]

        if (definition.type === SyntaxType.TypedefDefinition) {
            if (definition.definitionType.type === SyntaxType.Identifier) {
                return resolveIdentifierDefinition(
                    definition.definitionType,
                    context,
                )
            } else {
                return definition
            }
        } else {
            return definition
        }
    } else {
        const [head, ...tail] = id.value.split('.')
        const namespace: INamespacePath =
            context.currentNamespace.includedNamespaces[head]

        if (context.currentNamespace.includedNamespaces[head]) {
            const nextNamespace: INamespace =
                context.namespaceMap[namespace.accessor]

            return resolveIdentifierDefinition(stubIdentifier(tail.join('.')), {
                currentNamespace: nextNamespace,
                namespaceMap: context.namespaceMap,
            })
        } else if (context.currentNamespace.namespaceIncludes[head]) {
            const accessor: string =
                context.currentNamespace.namespaceIncludes[head]

            const nextNamespace: INamespace = context.namespaceMap[accessor]

            return resolveIdentifierDefinition(stubIdentifier(tail.join('.')), {
                currentNamespace: nextNamespace,
                namespaceMap: context.namespaceMap,
            })
        } else {
            throw new ValidationError(
                `Unable to resolve identifier[${id.value}] in namespace[${
                    context.currentNamespace.namespace.path
                }]`,
                id.loc,
            )
        }
    }
}
