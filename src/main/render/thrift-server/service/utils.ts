import * as ts from 'typescript'

import {
    Annotation,
    Annotations,
    FieldDefinition,
    FunctionDefinition,
    ServiceDefinition,
    SyntaxType,
} from '@creditkarma/thrift-parser'

import { DefinitionType, IRenderState } from '../../../types'

import { COMMON_IDENTIFIERS } from '../identifiers'

import { resolveIdentifierDefinition } from '../../../resolver'
import { createStringType } from '../../shared/types'

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

export function renderServiceName(
    service: ServiceDefinition,
): ts.VariableStatement {
    return ts.createVariableStatement(
        [ts.createToken(ts.SyntaxKind.ExportKeyword)],
        ts.createVariableDeclarationList(
            [
                ts.createVariableDeclaration(
                    COMMON_IDENTIFIERS.serviceName,
                    createStringType(),
                    ts.createLiteral(service.name.value),
                ),
            ],
            ts.NodeFlags.Const,
        ),
    )
}

export function renderServiceNameProperty(): ts.PropertyDeclaration {
    return ts.createProperty(
        undefined,
        [
            ts.createToken(ts.SyntaxKind.PublicKeyword),
            ts.createToken(ts.SyntaxKind.ReadonlyKeyword),
        ],
        COMMON_IDENTIFIERS._serviceName,
        undefined,
        createStringType(),
        COMMON_IDENTIFIERS.serviceName,
    )
}

export function renderServiceNameStaticProperty(): ts.PropertyDeclaration {
    return ts.createProperty(
        undefined,
        [
            ts.createToken(ts.SyntaxKind.PublicKeyword),
            ts.createToken(ts.SyntaxKind.StaticKeyword),
            ts.createToken(ts.SyntaxKind.ReadonlyKeyword),
        ],
        COMMON_IDENTIFIERS.serviceName,
        undefined,
        createStringType(),
        COMMON_IDENTIFIERS.serviceName,
    )
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
        )
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

export function renderMethodNames(
    service: ServiceDefinition,
    state: IRenderState,
): ts.VariableStatement {
    return ts.createVariableStatement(
        [ts.createToken(ts.SyntaxKind.ExportKeyword)],
        ts.createVariableDeclarationList(
            [
                ts.createVariableDeclaration(
                    COMMON_IDENTIFIERS.methodNames,
                    ts.createTypeReferenceNode('Array<string>', undefined),
                    ts.createArrayLiteral([
                        ...collectAllMethods(service, state).map(
                            (next: FunctionDefinition) => {
                                return ts.createLiteral(next.name.value)
                            },
                        ),
                    ]),
                ),
            ],
            ts.NodeFlags.Const,
        ),
    )
}

export function renderMethodNamesProperty(): ts.PropertyDeclaration {
    return ts.createProperty(
        undefined,
        [
            ts.createToken(ts.SyntaxKind.PublicKeyword),
            ts.createToken(ts.SyntaxKind.ReadonlyKeyword),
        ],
        COMMON_IDENTIFIERS._methodNames,
        undefined,
        ts.createTypeReferenceNode('Array<string>', undefined),
        COMMON_IDENTIFIERS.methodNames,
    )
}

export function renderMethodNamesStaticProperty(): ts.PropertyDeclaration {
    return ts.createProperty(
        undefined,
        [
            ts.createToken(ts.SyntaxKind.PublicKeyword),
            ts.createToken(ts.SyntaxKind.StaticKeyword),
            ts.createToken(ts.SyntaxKind.ReadonlyKeyword),
        ],
        COMMON_IDENTIFIERS.methodNames,
        undefined,
        ts.createTypeReferenceNode('Array<string>', undefined),
        COMMON_IDENTIFIERS.methodNames,
    )
}

function getRawAnnotations(
    service: ServiceDefinition,
    state: IRenderState,
): Array<Annotation> {
    if (service.extends === null) {
        if (service.annotations) {
            return service.annotations.annotations
        } else {
            return []
        }
    } else {
        const parentService: DefinitionType = resolveIdentifierDefinition(
            service.extends,
            state.currentNamespace,
            state.project.namespaces,
            state.project.sourceDir,
        )
        switch (parentService.type) {
            case SyntaxType.ServiceDefinition:
                if (service.annotations) {
                    // This actually doesn't work for deeply extended services. This identifier map only
                    // has the identifiers for the current namespace.
                    return [
                        ...getRawAnnotations(parentService, state),
                        ...service.annotations.annotations,
                    ]
                } else {
                    return getRawAnnotations(parentService, state)
                }

            default:
                throw new TypeError(
                    `A service can only extend another service. Found: ${
                        parentService.type
                    }`,
                )
        }
    }
}

export function collectAllAnnotations(
    service: ServiceDefinition,
    state: IRenderState,
): Annotations {
    const temp: Map<string, Annotation> = new Map()
    const rawAnnotations: Array<Annotation> = getRawAnnotations(service, state)

    for (const annotation of rawAnnotations) {
        temp.set(annotation.name.value, annotation)
    }

    return {
        type: SyntaxType.Annotations,
        loc: service.loc,
        annotations: Array.from(temp.values()),
    }
}
