import * as ts from 'typescript'

import {
    FieldDefinition,
    FunctionDefinition,
    ServiceDefinition,
    SyntaxType,
} from '@creditkarma/thrift-parser'

import { COMMON_IDENTIFIERS } from '../identifiers'

import { createAnyType, createPromiseType, TypeMapping } from '../types'

import { Resolver } from '../../../resolver'
import {
    DefinitionType,
    INamespace,
    INamespacePath,
    IRenderState,
    IResolveContext,
} from '../../../types'
import { createFunctionParameter } from '../utils'

function funcToMethodReducer(
    acc: Array<ts.MethodSignature>,
    func: FunctionDefinition,
    typeMapping: TypeMapping,
    state: IRenderState,
): Array<ts.MethodSignature> {
    return acc.concat([
        ts.createMethodSignature(
            undefined,
            [
                ...func.fields.map((field: FieldDefinition) => {
                    return createFunctionParameter(
                        field.name.value,
                        typeMapping(field.fieldType, state),
                        undefined,
                        field.requiredness === 'optional',
                    )
                }),
                createFunctionParameter(
                    COMMON_IDENTIFIERS.context,
                    ts.createTypeReferenceNode(
                        COMMON_IDENTIFIERS.Context,
                        undefined,
                    ),
                    undefined,
                    true,
                ),
            ],
            ts.createUnionTypeNode([
                typeMapping(func.returnType, state, true),
                createPromiseType(typeMapping(func.returnType, state, true)),
            ]),
            func.name.value,
            undefined,
        ),
    ])
}

/**
 * // thrift
 * service MyService {
 *   i32 add(1: i32 a, 2: i32 b)
 * }
 *
 * // typescript
 * interface IMyServiceHandler<Context> {
 *   add(a: number, b: number): number
 *   add(a: number, b: number, context: Context): number
 * }
 */
export function renderHandlerInterface(
    service: ServiceDefinition,
    typeMapping: TypeMapping,
    state: IRenderState,
): Array<ts.Statement> {
    const signatures: Array<ts.MethodSignature> = service.functions.reduce(
        (acc: Array<ts.MethodSignature>, next: FunctionDefinition) => {
            return funcToMethodReducer(acc, next, typeMapping, state)
        },
        [],
    )

    if (service.extends !== null) {
        return [
            ts.createInterfaceDeclaration(
                undefined,
                [ts.createToken(ts.SyntaxKind.ExportKeyword)],
                COMMON_IDENTIFIERS.ILocalHandler,
                [
                    ts.createTypeParameterDeclaration(
                        COMMON_IDENTIFIERS.Context,
                        undefined,
                        createAnyType(),
                    ),
                ],
                [],
                signatures,
            ),
            ts.createTypeAliasDeclaration(
                undefined,
                [ts.createToken(ts.SyntaxKind.ExportKeyword)],
                COMMON_IDENTIFIERS.IHandler,
                [
                    ts.createTypeParameterDeclaration(
                        COMMON_IDENTIFIERS.Context,
                        undefined,
                        createAnyType(),
                    ),
                ],
                ts.createIntersectionTypeNode([
                    ts.createTypeReferenceNode(
                        COMMON_IDENTIFIERS.ILocalHandler,
                        [
                            ts.createTypeReferenceNode(
                                COMMON_IDENTIFIERS.Context,
                                undefined,
                            ),
                        ],
                    ),
                    ts.createTypeReferenceNode(
                        ts.createIdentifier(
                            `${
                                Resolver.resolveIdentifierName(
                                    service.extends.value,
                                    {
                                        currentNamespace:
                                            state.currentNamespace,
                                        currentDefinitions:
                                            state.currentDefinitions,
                                        namespaceMap: state.project.namespaces,
                                    },
                                ).fullName
                            }.IHandler`,
                        ),
                        [
                            ts.createTypeReferenceNode(
                                COMMON_IDENTIFIERS.Context,
                                undefined,
                            ),
                        ],
                    ),
                ]),
            ),
        ]
    } else {
        return [
            ts.createInterfaceDeclaration(
                undefined,
                [ts.createToken(ts.SyntaxKind.ExportKeyword)],
                COMMON_IDENTIFIERS.IHandler,
                [
                    ts.createTypeParameterDeclaration(
                        COMMON_IDENTIFIERS.Context,
                        undefined,
                        createAnyType(),
                    ),
                ],
                [],
                signatures,
            ),
        ]
    }
}

export function serviceInheritanceChain(
    service: ServiceDefinition,
    context: IResolveContext,
): Array<ServiceDefinition> {
    if (service.extends !== null) {
        if (context.currentNamespace.exports[service.extends.value]) {
            const parentService: DefinitionType =
                context.currentNamespace.exports[service.extends.value]

            if (parentService.type === SyntaxType.ServiceDefinition) {
                return [
                    parentService,
                    ...serviceInheritanceChain(parentService, context),
                ]
            } else {
                throw new Error(
                    `Services can only extends other services but found[${
                        parentService.type
                    }]`,
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
                            parentService,
                            ...serviceInheritanceChain(parentService, {
                                currentNamespace: nextNamespace,
                                namespaceMap: context.namespaceMap,
                            }),
                        ]
                    } else {
                        throw new Error(
                            `Services can only extends other services but found[${
                                parentService.type
                            }]`,
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
): Array<FunctionDefinition> {
    return serviceInheritanceChain(service, context).reduce(
        (acc: Array<FunctionDefinition>, next: ServiceDefinition) => {
            return [...acc, ...next.functions]
        },
        [],
    )
}

export function collectAllMethods(
    service: ServiceDefinition,
    state: IRenderState,
): Array<FunctionDefinition> {
    return [
        ...collectInheritedMethods(service, {
            currentNamespace: state.currentNamespace,
            namespaceMap: state.project.namespaces,
        }),
        ...service.functions,
    ]
}
