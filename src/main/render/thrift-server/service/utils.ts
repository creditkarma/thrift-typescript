import {
    FieldDefinition,
    FunctionDefinition,
    ServiceDefinition,
    SyntaxType,
} from '@creditkarma/thrift-parser'

import { DefinitionType, IRenderState } from '../../../types'

import { resolveIdentifierDefinition } from '../../../resolver'

export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export function createStructArgsName(
    def: FunctionDefinition | FieldDefinition,
): string {
    return `${capitalize(def.name.value)}__Args`
}

export function createStructResultName(
    def: FunctionDefinition | FieldDefinition,
): string {
    return `${capitalize(def.name.value)}__Result`
}

export function collectAllMethods(
    service: ServiceDefinition,
    state: IRenderState,
): Array<FunctionDefinition> {
    if (service.extends === null) {
        return service.functions
    } else {
        const parentService: DefinitionType = resolveIdentifierDefinition(
            service.extends,
            state.currentNamespace,
            state.project.namespaces,
            state.project.sourceDir,
        ).definition

        switch (parentService.type) {
            case SyntaxType.ServiceDefinition:
                // This actually doesn't work for deeply extended services. This identifier map only
                // has the identifiers for the current namespace.
                return [
                    ...collectAllMethods(parentService, state),
                    ...service.functions,
                ]

            default:
                throw new TypeError(
                    `A service can only extend another service. Found: ${
                        parentService.type
                    }`,
                )
        }
    }
}
