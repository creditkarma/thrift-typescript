import {
    FunctionDefinition,
    ServiceDefinition,
    SyntaxType,
} from '@creditkarma/thrift-parser'

import {
    DefinitionType,
    INamespace,
    INamespacePath,
    IRenderState,
    IResolveContext,
} from '../../../types'

export interface IServiceResolution {
    namespace: INamespace
    definition: ServiceDefinition
}

export function serviceInheritanceChain(
    service: ServiceDefinition,
    context: IResolveContext,
): Array<IServiceResolution> {
    if (service.extends !== null) {
        if (context.currentNamespace.exports[service.extends.value]) {
            const parentService: DefinitionType =
                context.currentNamespace.exports[service.extends.value]

            if (parentService.type === SyntaxType.ServiceDefinition) {
                return [
                    {
                        definition: parentService,
                        namespace: context.currentNamespace,
                    },
                    ...serviceInheritanceChain(parentService, context),
                ]
            } else {
                throw new Error(
                    `Services can only extends other services but found[${parentService.type}]`,
                )
            }
        } else {
            const [path, ...tail] = service.extends.value.split('.')
            const nextPath: string = tail.join('.')
            const nextNamespacePath: INamespacePath =
                context.currentNamespace.includedNamespaces[path]

            if (nextNamespacePath && nextPath) {
                const nextNamespace: INamespace =
                    context.namespaceMap[nextNamespacePath.accessor]

                if (nextNamespace) {
                    const parentService = nextNamespace.exports[nextPath]

                    if (parentService.type === SyntaxType.ServiceDefinition) {
                        return [
                            {
                                definition: parentService,
                                namespace: nextNamespace,
                            },
                            ...serviceInheritanceChain(parentService, {
                                currentNamespace: nextNamespace,
                                namespaceMap: context.namespaceMap,
                            }),
                        ]
                    } else {
                        throw new Error(
                            `Services can only extends other services but found[${parentService.type}]`,
                        )
                    }
                }
            }

            throw new Error(
                `Unable to resolve parent service: ${service.extends.value}`,
            )
        }
    } else {
        return []
    }
}

export function collectInheritedMethods(
    service: ServiceDefinition,
    context: IResolveContext,
): Array<IFunctionResolution> {
    return serviceInheritanceChain(service, context).reduce(
        (
            acc: Array<IFunctionResolution>,
            serviceResolution: IServiceResolution,
        ) => {
            return [
                ...acc,
                ...serviceResolution.definition.functions.map(
                    (funcDef: FunctionDefinition): IFunctionResolution => {
                        return {
                            namespace: serviceResolution.namespace,
                            service: serviceResolution.definition,
                            definition: funcDef,
                        }
                    },
                ),
            ]
        },
        [],
    )
}

export interface IFunctionResolution {
    namespace: INamespace
    service: ServiceDefinition
    definition: FunctionDefinition
}

export function collectAllMethods(
    service: ServiceDefinition,
    state: IRenderState,
): Array<IFunctionResolution> {
    return [
        ...collectInheritedMethods(service, {
            currentNamespace: state.currentNamespace,
            namespaceMap: state.project.namespaces,
        }),
        ...service.functions.map(
            (funcDef: FunctionDefinition): IFunctionResolution => {
                return {
                    namespace: state.currentNamespace,
                    service,
                    definition: funcDef,
                }
            },
        ),
    ]
}
