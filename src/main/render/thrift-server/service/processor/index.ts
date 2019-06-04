import * as ts from 'typescript'

import {
    FunctionDefinition,
    Identifier,
    ServiceDefinition,
    SyntaxType,
    ThriftStatement,
} from '@creditkarma/thrift-parser'

import { IRenderState } from '../../../../types'

import { COMMON_IDENTIFIERS, THRIFT_IDENTIFIERS } from '../../identifiers'

import {
    createAssignmentStatement,
    createClassConstructor,
    createFunctionParameter,
} from '../../utils'

import {
    createNumberType,
    createProtocolConstructorType,
    createTransportConstructorType,
} from '../../types'

import {
    renderServiceMetadataProperty,
    renderServiceMetadataStaticProperty,
} from '../metadata'

import { Resolver } from '../../../../resolver'

import {
    IServiceResolution,
    serviceInheritanceChain,
} from '../../../shared/service'
import { createProcessFunctionMethod } from './processFunctionMethods'
import { createProcessMethod } from './processMethod'
import { createReadRequestMethod } from './readRequest'
import { argsTypeForFunction } from './utils'
import { createWriteErrorMethod } from './writeError'
import { createWriteResponseMethod } from './writeResponse'

const HANDLER_TYPE: ts.TypeNode = ts.createTypeReferenceNode(
    COMMON_IDENTIFIERS.IHandler,
    [ts.createTypeReferenceNode(COMMON_IDENTIFIERS.Context, undefined)],
)

export function extendsService(
    service: Identifier,
    state: IRenderState,
): ts.HeritageClause {
    return ts.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
        ts.createExpressionWithTypeArguments(
            [ts.createTypeReferenceNode(COMMON_IDENTIFIERS.Context, undefined)],
            ts.createPropertyAccess(
                ts.createIdentifier(
                    Resolver.resolveIdentifierName(service.value, {
                        currentNamespace: state.currentNamespace,
                        currentDefinitions: state.currentDefinitions,
                        namespaceMap: state.project.namespaces,
                    }).fullName,
                ),
                COMMON_IDENTIFIERS.Processor,
            ),
        ),
    ])
}

export function implementsThriftProcessor(): ts.HeritageClause {
    return ts.createHeritageClause(ts.SyntaxKind.ImplementsKeyword, [
        ts.createExpressionWithTypeArguments(
            [ts.createTypeReferenceNode(COMMON_IDENTIFIERS.Context, undefined)],
            THRIFT_IDENTIFIERS.IThriftProcessor,
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
export function renderReadResultType(
    service: ServiceDefinition,
    state: IRenderState,
): ts.Statement {
    const localTypes: Array<ts.TypeLiteralNode> = service.functions.map(
        (funcDef: FunctionDefinition) => {
            return createMetadataReturnTypeForFunction(funcDef, state)
        },
    )

    if (service.extends !== null) {
        return ts.createTypeAliasDeclaration(
            undefined,
            [ts.createToken(ts.SyntaxKind.ExportKeyword)],
            COMMON_IDENTIFIERS.IReadResult,
            undefined,
            ts.createUnionTypeNode([
                ...localTypes,
                ts.createTypeReferenceNode(
                    ts.createQualifiedName(
                        ts.createIdentifier(
                            Resolver.resolveIdentifierName(
                                service.extends.value,
                                {
                                    currentNamespace: state.currentNamespace,
                                    currentDefinitions:
                                        state.currentDefinitions,
                                    namespaceMap: state.project.namespaces,
                                },
                            ).fullName,
                        ),
                        COMMON_IDENTIFIERS.IReadResult,
                    ),
                    undefined,
                ),
            ]),
        )
    } else {
        return ts.createTypeAliasDeclaration(
            undefined,
            [ts.createToken(ts.SyntaxKind.ExportKeyword)],
            COMMON_IDENTIFIERS.IReadResult,
            undefined,
            ts.createUnionTypeNode([...localTypes]),
        )
    }
}

export function renderProcessor(
    service: ServiceDefinition,
    state: IRenderState,
): ts.ClassDeclaration {
    const handler: ts.PropertyDeclaration = ts.createProperty(
        undefined,
        [
            ts.createToken(ts.SyntaxKind.ProtectedKeyword),
            ts.createToken(ts.SyntaxKind.ReadonlyKeyword),
        ],
        COMMON_IDENTIFIERS.handler,
        undefined,
        ts.createTypeReferenceNode(COMMON_IDENTIFIERS.IHandler, [
            ts.createTypeReferenceNode(COMMON_IDENTIFIERS.Context, undefined),
        ]),
        undefined,
    )

    const transport: ts.PropertyDeclaration = ts.createProperty(
        undefined,
        [
            ts.createToken(ts.SyntaxKind.ProtectedKeyword),
            ts.createToken(ts.SyntaxKind.ReadonlyKeyword),
        ],
        COMMON_IDENTIFIERS.transport,
        undefined,
        createTransportConstructorType(),
        undefined,
    )

    const protocol: ts.PropertyDeclaration = ts.createProperty(
        undefined,
        [
            ts.createToken(ts.SyntaxKind.ProtectedKeyword),
            ts.createToken(ts.SyntaxKind.ReadonlyKeyword),
        ],
        COMMON_IDENTIFIERS.protocol,
        undefined,
        createProtocolConstructorType(),
        undefined,
    )

    // Static properties
    const staticServiceMetadata: ts.PropertyDeclaration = renderServiceMetadataStaticProperty()

    // Instance properties
    const serviceMetadata: ts.PropertyDeclaration = renderServiceMetadataProperty()

    const processMethod: ts.MethodDeclaration = createProcessMethod(
        service,
        state,
    )

    const readRequestMethod: ts.MethodDeclaration = createReadRequestMethod(
        service,
        state,
    )

    const writeResponseMethod: Array<
        ts.MethodDeclaration
    > = createWriteResponseMethod(service, state)

    const writeErrorMethod: ts.MethodDeclaration = createWriteErrorMethod()

    const processFunctions: Array<ts.MethodDeclaration> = service.functions.map(
        (next: FunctionDefinition) => {
            return createProcessFunctionMethod(next, state)
        },
    )

    const heritage: Array<ts.HeritageClause> =
        service.extends !== null
            ? [extendsService(service.extends, state)]
            : [implementsThriftProcessor()]

    // export class <node.name> { ... }
    return ts.createClassDeclaration(
        undefined, // decorators
        [ts.createToken(ts.SyntaxKind.ExportKeyword)], // modifiers
        COMMON_IDENTIFIERS.Processor, // name
        [
            ts.createTypeParameterDeclaration(
                COMMON_IDENTIFIERS.Context,
                ts.createTypeReferenceNode(
                    THRIFT_IDENTIFIERS.IThriftContext,
                    undefined,
                ),
                ts.createTypeReferenceNode(
                    THRIFT_IDENTIFIERS.IThriftContext,
                    undefined,
                ),
            ),
        ], // type parameters
        heritage, // heritage
        [
            handler,
            transport,
            protocol,
            staticServiceMetadata,
            serviceMetadata,
            createCtor(service, state),
            processMethod,
            readRequestMethod,
            ...writeResponseMethod,
            writeErrorMethod,
            ...processFunctions,
        ], // body
    )
}

function createCtor(
    service: ServiceDefinition,
    state: IRenderState,
): ts.ConstructorDeclaration {
    if (service.extends !== null) {
        return createClassConstructor(
            [
                createFunctionParameter(
                    COMMON_IDENTIFIERS.handler,
                    HANDLER_TYPE,
                ),
                createFunctionParameter(
                    COMMON_IDENTIFIERS.transport,
                    createTransportConstructorType(),
                    THRIFT_IDENTIFIERS.BufferedTransport,
                ),
                createFunctionParameter(
                    COMMON_IDENTIFIERS.protocol,
                    createProtocolConstructorType(),
                    THRIFT_IDENTIFIERS.BinaryProtocol,
                ),
            ],
            [
                createSuperCall(service, state),
                createAssignmentStatement(
                    ts.createPropertyAccess(
                        COMMON_IDENTIFIERS.this,
                        COMMON_IDENTIFIERS.handler,
                    ),
                    COMMON_IDENTIFIERS.handler,
                ),
                createAssignmentStatement(
                    ts.createPropertyAccess(
                        COMMON_IDENTIFIERS.this,
                        COMMON_IDENTIFIERS.transport,
                    ),
                    COMMON_IDENTIFIERS.transport,
                ),
                createAssignmentStatement(
                    ts.createPropertyAccess(
                        COMMON_IDENTIFIERS.this,
                        COMMON_IDENTIFIERS.protocol,
                    ),
                    COMMON_IDENTIFIERS.protocol,
                ),
            ],
        )
    } else {
        return createClassConstructor(
            [
                createFunctionParameter(
                    COMMON_IDENTIFIERS.handler,
                    HANDLER_TYPE,
                ),
                createFunctionParameter(
                    COMMON_IDENTIFIERS.transport,
                    createTransportConstructorType(),
                    THRIFT_IDENTIFIERS.BufferedTransport,
                ),
                createFunctionParameter(
                    COMMON_IDENTIFIERS.protocol,
                    createProtocolConstructorType(),
                    THRIFT_IDENTIFIERS.BinaryProtocol,
                ),
            ],
            [
                createAssignmentStatement(
                    ts.createPropertyAccess(
                        COMMON_IDENTIFIERS.this,
                        COMMON_IDENTIFIERS.handler,
                    ),
                    COMMON_IDENTIFIERS.handler,
                ),
                createAssignmentStatement(
                    ts.createPropertyAccess(
                        COMMON_IDENTIFIERS.this,
                        COMMON_IDENTIFIERS.transport,
                    ),
                    COMMON_IDENTIFIERS.transport,
                ),
                createAssignmentStatement(
                    ts.createPropertyAccess(
                        COMMON_IDENTIFIERS.this,
                        COMMON_IDENTIFIERS.protocol,
                    ),
                    COMMON_IDENTIFIERS.protocol,
                ),
            ],
        )
    }
}

function createSuperCall(
    service: ServiceDefinition,
    state: IRenderState,
): ts.Statement {
    const parents: Array<IServiceResolution> = serviceInheritanceChain(
        service,
        {
            currentNamespace: state.currentNamespace,
            currentDefinitions: state.currentDefinitions,
            namespaceMap: state.project.namespaces,
        },
    )

    return ts.createStatement(
        ts.createCall(
            ts.createSuper(),
            [],
            [
                ts.createObjectLiteral(
                    parents.reduce(
                        (
                            acc: Array<ts.PropertyAssignment>,
                            serviceRes: IServiceResolution,
                        ) => {
                            return [
                                ...acc,
                                ...serviceRes.definition.functions.map(
                                    (
                                        funcDef: FunctionDefinition,
                                    ): ts.PropertyAssignment => {
                                        return ts.createPropertyAssignment(
                                            ts.createIdentifier(
                                                funcDef.name.value,
                                            ),
                                            ts.createPropertyAccess(
                                                COMMON_IDENTIFIERS.handler,
                                                ts.createIdentifier(
                                                    funcDef.name.value,
                                                ),
                                            ),
                                        )
                                    },
                                ),
                            ]
                        },
                        [],
                    ),
                    true,
                ),
                COMMON_IDENTIFIERS.transport,
                COMMON_IDENTIFIERS.protocol,
            ],
        ),
    )
}

function createMetadataReturnTypeForFunction(
    funcDef: FunctionDefinition,
    state: IRenderState,
): ts.TypeLiteralNode {
    return ts.createTypeLiteralNode([
        ts.createPropertySignature(
            undefined,
            COMMON_IDENTIFIERS.methodName,
            undefined,
            ts.createLiteralTypeNode(ts.createLiteral(funcDef.name.value)),
            undefined,
        ),
        ts.createPropertySignature(
            undefined,
            COMMON_IDENTIFIERS.requestId,
            undefined,
            createNumberType(),
            undefined,
        ),
        ts.createPropertySignature(
            undefined,
            COMMON_IDENTIFIERS.data,
            undefined,
            argsTypeForFunction(funcDef, state),
            undefined,
        ),
    ])
}
