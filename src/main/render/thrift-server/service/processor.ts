import * as ts from 'typescript'

import {
    FieldDefinition,
    FunctionDefinition,
    Identifier,
    ServiceDefinition,
    SyntaxType,
    ThriftStatement,
} from '@creditkarma/thrift-parser'

import { ContextType, TProtocolType } from './types'

import {
    createOutputVariable,
    createStructArgsName,
    createStructResultName,
} from './utils'

import { IRenderState } from '../../../types'

import {
    COMMON_IDENTIFIERS,
    MESSAGE_TYPE,
    THRIFT_IDENTIFIERS,
    THRIFT_TYPES,
} from '../identifiers'

import {
    createApplicationException,
    createAssignmentStatement,
    createCallStatement,
    createClassConstructor,
    createConstStatement,
    createFunctionParameter,
    createMethodCall,
    createMethodCallStatement,
    createPromise,
    createPublicMethod,
} from '../utils'

import {
    constructorNameForFieldType,
    createNumberType,
    createProtocolConstructorType,
    createStringType,
    createTransportConstructorType,
    createVoidType,
    typeNodeForFieldType,
} from '../types'

import {
    renderServiceMetadataProperty,
    renderServiceMetadataStaticProperty,
} from './metadata'

import { Resolver } from '../../../resolver'

import { collectAllMethods } from '../../shared/service'

import {
    createBufferType,
    createErrorType,
    createAnyType,
} from '../../shared/types'

import { className, looseName, strictName, toolkitName } from '../struct/utils'

function objectLiteralForServiceFunctions(
    node: ThriftStatement,
): ts.ObjectLiteralExpression {
    switch (node.type) {
        case SyntaxType.ServiceDefinition:
            return ts.createObjectLiteral(
                node.functions.map(
                    (next: FunctionDefinition): ts.PropertyAssignment => {
                        return ts.createPropertyAssignment(
                            ts.createIdentifier(next.name.value),
                            ts.createIdentifier(`handler.${next.name.value}`),
                        )
                    },
                ),
                true,
            )

        default:
            throw new TypeError(
                `A service can only extend another service. Found: ${
                    node.type
                }`,
            )
    }
}

function createHandlerType(node: ServiceDefinition): ts.TypeNode {
    return ts.createTypeReferenceNode(COMMON_IDENTIFIERS.IHandler, [
        ts.createTypeReferenceNode(COMMON_IDENTIFIERS.Context, undefined),
    ])
}

export function extendsService(
    service: Identifier,
    state: IRenderState,
): ts.HeritageClause {
    return ts.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
        ts.createExpressionWithTypeArguments(
            [ts.createTypeReferenceNode(COMMON_IDENTIFIERS.Context, undefined)],
            ts.createIdentifier(
                `${
                    Resolver.resolveIdentifierName(service.value, {
                        currentNamespace: state.currentNamespace,
                        currentDefinitions: state.currentDefinitions,
                        namespaceMap: state.project.namespaces,
                    }).fullName
                }.Processor`,
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

    const readRequestMethod: Array<
        ts.MethodDeclaration
    > = createReadRequestMethod(service, state)

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
        'Processor', // name
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
            ...readRequestMethod,
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
                    createHandlerType(service),
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
                createSuperCall(service.extends, state),
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
                    createHandlerType(service),
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
    service: Identifier,
    state: IRenderState,
): ts.Statement {
    return ts.createStatement(
        ts.createCall(
            ts.createSuper(),
            [],
            [
                objectLiteralForServiceFunctions(
                    Resolver.resolveIdentifierDefinition(
                        service,
                        {
                            currentNamespace: state.currentNamespace,
                            currentDefinitions: state.currentDefinitions,
                            namespaceMap: state.project.namespaces,
                        }
                    ),
                ),
                COMMON_IDENTIFIERS.transport,
                COMMON_IDENTIFIERS.protocol,
            ],
        ),
    )
}

// const result: thrift.TApplicationException = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, err.message);
// const output: thrift.TProtocol = new this.protocol(new this.transport());
// output.writeMessageBegin(methodName, thrift.MessageType.EXCEPTION, requestId);
// thrift.TApplicationExceptionCodec.encode(result, output);
// output.writeMessageEnd();
// return output.flush();
function createWriteErrorMethod(): ts.MethodDeclaration {
    return ts.createMethod(
        undefined,
        undefined,
        undefined,
        COMMON_IDENTIFIERS.writeError,
        undefined,
        undefined,
        [
            createFunctionParameter(
                COMMON_IDENTIFIERS.methodName,
                createStringType(),
            ),
            createFunctionParameter(
                COMMON_IDENTIFIERS.requestId,
                createNumberType(),
            ),
            createFunctionParameter(
                COMMON_IDENTIFIERS.err,
                ts.createTypeReferenceNode(COMMON_IDENTIFIERS.Error, undefined),
            ),
        ],
        createBufferType(),
        ts.createBlock(
            [
                createConstStatement(
                    COMMON_IDENTIFIERS.result,
                    ts.createTypeReferenceNode(
                        THRIFT_IDENTIFIERS.TApplicationException,
                        undefined,
                    ),
                    ts.createNew(
                        THRIFT_IDENTIFIERS.TApplicationException,
                        undefined,
                        [
                            ts.createIdentifier(
                                'thrift.TApplicationExceptionType.UNKNOWN',
                            ),
                            ts.createIdentifier('err.message'),
                        ],
                    ),
                ),
                createOutputVariable(),
                ts.createStatement(
                    ts.createCall(
                        ts.createPropertyAccess(
                            COMMON_IDENTIFIERS.output,
                            COMMON_IDENTIFIERS.writeMessageBegin,
                        ),
                        undefined,
                        [
                            COMMON_IDENTIFIERS.methodName,
                            ts.createIdentifier('thrift.MessageType.EXCEPTION'),
                            COMMON_IDENTIFIERS.requestId,
                        ],
                    ),
                ),
                ts.createStatement(
                    ts.createCall(
                        ts.createIdentifier(
                            'thrift.TApplicationExceptionCodec.encode',
                        ),
                        undefined,
                        [COMMON_IDENTIFIERS.result, COMMON_IDENTIFIERS.output],
                    ),
                ),
                ts.createStatement(
                    ts.createCall(
                        ts.createPropertyAccess(
                            COMMON_IDENTIFIERS.output,
                            COMMON_IDENTIFIERS.writeMessageEnd,
                        ),
                        undefined,
                        undefined,
                    ),
                ),
                ts.createReturn(
                    ts.createCall(
                        ts.createPropertyAccess(
                            COMMON_IDENTIFIERS.output,
                            COMMON_IDENTIFIERS.flush,
                        ),
                        undefined,
                        undefined,
                    ),
                ),
            ],
            true,
        ),
    )
}

function createReadRequestMethod(
    service: ServiceDefinition,
    state: IRenderState,
): Array<ts.MethodDeclaration> {
    return [
        ...service.functions.map(
            (next: FunctionDefinition): ts.MethodDeclaration => {
                return ts.createMethod(
                    undefined,
                    undefined,
                    undefined,
                    COMMON_IDENTIFIERS.readRequest,
                    undefined,
                    undefined,
                    [
                        ts.createParameter(
                            undefined,
                            undefined,
                            undefined,
                            COMMON_IDENTIFIERS.methodName,
                            undefined,
                            ts.createLiteralTypeNode(
                                ts.createLiteral(next.name.value),
                            ),
                            undefined,
                        ),
                        ts.createParameter(
                            undefined,
                            undefined,
                            undefined,
                            COMMON_IDENTIFIERS.input,
                            undefined,
                            ts.createTypeReferenceNode(
                                THRIFT_IDENTIFIERS.TProtocol,
                                undefined,
                            ),
                            undefined,
                        ),
                    ],
                    ts.createTypeReferenceNode(
                        ts.createIdentifier(
                            strictName(
                                createStructArgsName(next),
                                SyntaxType.StructDefinition,
                                state,
                            ),
                        ),
                        undefined,
                    ),
                    undefined,
                )
            },
        ),
        ts.createMethod(
            undefined,
            undefined,
            undefined,
            COMMON_IDENTIFIERS.readRequest,
            undefined,
            undefined,
            [
                ts.createParameter(
                    undefined,
                    undefined,
                    undefined,
                    COMMON_IDENTIFIERS.methodName,
                    undefined,
                    createStringType(),
                    undefined,
                ),
                ts.createParameter(
                    undefined,
                    undefined,
                    undefined,
                    COMMON_IDENTIFIERS.input,
                    undefined,
                    ts.createTypeReferenceNode(
                        THRIFT_IDENTIFIERS.TProtocol,
                        undefined,
                    ),
                    undefined,
                ),
            ],
            createAnyType(),
            ts.createBlock(
                [
                    ts.createSwitch(
                        COMMON_IDENTIFIERS.methodName,
                        ts.createCaseBlock([
                            ...service.functions.map(
                                (next: FunctionDefinition) => {
                                    return ts.createCaseClause(
                                        ts.createLiteral(next.name.value),
                                        [
                                            ts.createBlock(
                                                [ts.createReturn()],
                                                true,
                                            ),
                                        ],
                                    )
                                },
                            ),
                            defaultCaseForRead(service, state),
                        ]),
                    ),
                ],
                true,
            ),
        ),
    ]
}

function createWriteResponseMethod(
    service: ServiceDefinition,
    state: IRenderState,
): Array<ts.MethodDeclaration> {
    return [
        ...service.functions.map(
            (next: FunctionDefinition): ts.MethodDeclaration => {
                return ts.createMethod(
                    undefined,
                    undefined,
                    undefined,
                    COMMON_IDENTIFIERS.writeResponse,
                    undefined,
                    undefined,
                    [
                        createFunctionParameter(
                            COMMON_IDENTIFIERS.methodName,
                            ts.createLiteralTypeNode(
                                ts.createLiteral(next.name.value),
                            ),
                        ),
                        createFunctionParameter(
                            COMMON_IDENTIFIERS.input,
                            ts.createTypeReferenceNode(
                                THRIFT_IDENTIFIERS.TProtocol,
                                undefined,
                            ),
                        ),
                    ],
                    ts.createTypeReferenceNode(
                        ts.createIdentifier(
                            strictName(
                                createStructArgsName(next),
                                SyntaxType.StructDefinition,
                                state,
                            ),
                        ),
                        undefined,
                    ),
                    undefined,
                )
            },
        ),
        ts.createMethod(
            undefined,
            undefined,
            undefined,
            COMMON_IDENTIFIERS.writeResponse,
            undefined,
            undefined,
            [
                ts.createParameter(
                    undefined,
                    undefined,
                    undefined,
                    COMMON_IDENTIFIERS.methodName,
                    undefined,
                    createStringType(),
                    undefined,
                ),
                ts.createParameter(
                    undefined,
                    undefined,
                    undefined,
                    COMMON_IDENTIFIERS.input,
                    undefined,
                    ts.createTypeReferenceNode(
                        THRIFT_IDENTIFIERS.TProtocol,
                        undefined,
                    ),
                    undefined,
                ),
            ],
            createAnyType(),
            ts.createBlock(
                [
                    ts.createSwitch(
                        COMMON_IDENTIFIERS.methodName,
                        ts.createCaseBlock([
                            ...service.functions.map(
                                (next: FunctionDefinition) => {
                                    return ts.createCaseClause(
                                        ts.createLiteral(next.name.value),
                                        [
                                            ts.createBlock(
                                                [ts.createReturn()],
                                                true,
                                            ),
                                        ],
                                    )
                                },
                            ),
                            defaultCaseForRead(service, state),
                        ]),
                    ),
                ],
                true,
            ),
        ),
    ]
}

function defaultCaseForRead(
    service: ServiceDefinition,
    state: IRenderState,
): ts.DefaultClause {
    if (service.extends !== null) {
        return ts.createDefaultClause([
            ts.createBlock(
                [
                    ts.createStatement(
                        ts.createCall(COMMON_IDENTIFIERS.resolve, undefined, [
                            ts.createCall(
                                ts.createPropertyAccess(
                                    ts.createSuper(),
                                    COMMON_IDENTIFIERS.readRequest,
                                ),
                                undefined,
                                [],
                            ),
                        ]),
                    ),
                ],
                true,
            ),
        ])
    } else {
        return ts.createDefaultClause([
            ts.createBlock(
                [
                    ts.createThrow(
                        ts.createNew(COMMON_IDENTIFIERS.Error, undefined, [
                            ts.createBinary(
                                ts.createLiteral(
                                    'Unable to read request for unknown function ',
                                ),
                                ts.SyntaxKind.PlusToken,
                                COMMON_IDENTIFIERS.methodName,
                            ),
                        ]),
                    ),
                ],
                true,
            ),
        ])
    }
}

function createProcessFunctionMethod(
    funcDef: FunctionDefinition,
    state: IRenderState,
): ts.MethodDeclaration {
    return createPublicMethod(
        ts.createIdentifier(`process_${funcDef.name.value}`),
        [
            createFunctionParameter(
                COMMON_IDENTIFIERS.requestId,
                createNumberType(),
            ),
            createFunctionParameter(COMMON_IDENTIFIERS.input, TProtocolType),
            createFunctionParameter(COMMON_IDENTIFIERS.output, TProtocolType),
            createFunctionParameter(
                COMMON_IDENTIFIERS.context,
                ContextType,
                undefined,
            ),
        ], // parameters
        ts.createTypeReferenceNode(COMMON_IDENTIFIERS.Promise, [
            createBufferType(),
        ]), // return type
        [
            // new Promise<{{typeName}}>((resolve, reject) => {
            ts.createReturn(
                createMethodCall(
                    createMethodCall(
                        createPromise(
                            typeNodeForFieldType(
                                funcDef.returnType,
                                state,
                                true,
                            ),
                            createVoidType(),
                            [
                                // try {
                                //     resolve(
                                //         this.handler.{{name}}({{#args}}args.{{fieldName}}, {{/args}}context)
                                //     )
                                // } catch (e) {
                                //     reject(e)
                                // }
                                ts.createTry(
                                    ts.createBlock(
                                        [
                                            ...createArgsVariable(
                                                funcDef,
                                                state,
                                            ),
                                            // input.readMessageEnd();
                                            createMethodCallStatement(
                                                COMMON_IDENTIFIERS.input,
                                                'readMessageEnd',
                                            ),
                                            createCallStatement(
                                                COMMON_IDENTIFIERS.resolve,
                                                [
                                                    createMethodCall(
                                                        ts.createPropertyAccess(
                                                            COMMON_IDENTIFIERS.this,
                                                            COMMON_IDENTIFIERS.handler,
                                                        ),
                                                        funcDef.name.value,
                                                        [
                                                            ...funcDef.fields.map(
                                                                (
                                                                    next: FieldDefinition,
                                                                ) => {
                                                                    return ts.createIdentifier(
                                                                        `args.${
                                                                            next
                                                                                .name
                                                                                .value
                                                                        }`,
                                                                    )
                                                                },
                                                            ),
                                                            COMMON_IDENTIFIERS.context,
                                                        ],
                                                    ),
                                                ],
                                            ),
                                        ],
                                        true,
                                    ),
                                    ts.createCatchClause(
                                        ts.createVariableDeclaration('err'),
                                        ts.createBlock(
                                            [
                                                createCallStatement(
                                                    COMMON_IDENTIFIERS.reject,
                                                    [COMMON_IDENTIFIERS.err],
                                                ),
                                            ],
                                            true,
                                        ),
                                    ),
                                    undefined,
                                ),
                            ],
                        ),
                        COMMON_IDENTIFIERS.then,
                        [
                            // }).then((data: {{typeName}}) => {
                            ts.createArrowFunction(
                                undefined,
                                undefined,
                                [
                                    createFunctionParameter(
                                        COMMON_IDENTIFIERS.data,
                                        typeNodeForFieldType(
                                            funcDef.returnType,
                                            state,
                                            true,
                                        ),
                                    ),
                                ],
                                createBufferType(),
                                undefined,
                                ts.createBlock(
                                    [
                                        // const result: StructType = {success: data}
                                        createConstStatement(
                                            COMMON_IDENTIFIERS.result,
                                            ts.createTypeReferenceNode(
                                                ts.createIdentifier(
                                                    looseName(
                                                        createStructResultName(
                                                            funcDef,
                                                        ),
                                                        SyntaxType.StructDefinition,
                                                        state,
                                                    ),
                                                ),
                                                undefined,
                                            ),
                                            ts.createObjectLiteral([
                                                ts.createPropertyAssignment(
                                                    COMMON_IDENTIFIERS.success,
                                                    COMMON_IDENTIFIERS.data,
                                                ),
                                            ]),
                                        ),
                                        // output.writeMessageBegin("{{name}}", Thrift.MessageType.REPLY, requestId)
                                        createMethodCallStatement(
                                            COMMON_IDENTIFIERS.output,
                                            'writeMessageBegin',
                                            [
                                                ts.createLiteral(
                                                    funcDef.name.value,
                                                ),
                                                MESSAGE_TYPE.REPLY,
                                                COMMON_IDENTIFIERS.requestId,
                                            ],
                                        ),
                                        // StructCodec.encode(result, output)
                                        createMethodCallStatement(
                                            ts.createIdentifier(
                                                toolkitName(
                                                    createStructResultName(
                                                        funcDef,
                                                    ),
                                                    state,
                                                ),
                                            ),
                                            'encode',
                                            [
                                                COMMON_IDENTIFIERS.result,
                                                COMMON_IDENTIFIERS.output,
                                            ],
                                        ),
                                        // output.writeMessageEnd()
                                        createMethodCallStatement(
                                            COMMON_IDENTIFIERS.output,
                                            'writeMessageEnd',
                                            [],
                                        ),
                                        // return output.flush()
                                        ts.createReturn(
                                            ts.createCall(
                                                ts.createPropertyAccess(
                                                    COMMON_IDENTIFIERS.output,
                                                    'flush',
                                                ),
                                                undefined,
                                                [],
                                            ),
                                        ),
                                    ],
                                    true,
                                ),
                            ),
                        ],
                    ),
                    'catch',
                    [
                        ts.createArrowFunction(
                            undefined,
                            undefined,
                            [
                                createFunctionParameter(
                                    COMMON_IDENTIFIERS.err,
                                    createErrorType(),
                                ),
                            ],
                            createBufferType(),
                            undefined,
                            ts.createBlock(
                                [
                                    // if (def.throws.length > 0)
                                    ...createExceptionHandlers(funcDef, state),
                                ],
                                true,
                            ),
                        ),
                    ],
                ),
            ),
        ], // body
    )
}

function createArgsVariable(
    funcDef: FunctionDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    if (funcDef.fields.length > 0) {
        // const args: type: StructType = StructCodec.decode(input)
        return [
            createConstStatement(
                COMMON_IDENTIFIERS.args,
                ts.createTypeReferenceNode(
                    ts.createIdentifier(
                        strictName(
                            createStructArgsName(funcDef),
                            SyntaxType.StructDefinition,
                            state,
                        ),
                    ),
                    undefined,
                ),
                ts.createCall(
                    ts.createPropertyAccess(
                        ts.createIdentifier(
                            toolkitName(createStructArgsName(funcDef), state),
                        ),
                        ts.createIdentifier('decode'),
                    ),
                    undefined,
                    [COMMON_IDENTIFIERS.input],
                ),
            ),
        ]
    } else {
        return []
    }
}

function createElseForExceptions(
    exp: FieldDefinition,
    remaining: Array<FieldDefinition>,
    funcDef: FunctionDefinition,
    state: IRenderState,
): ts.Statement {
    if (remaining.length > 0) {
        const [next, ...tail] = remaining
        return ts.createIf(
            ts.createBinary(
                COMMON_IDENTIFIERS.err,
                ts.SyntaxKind.InstanceOfKeyword,
                constructorNameForFieldType(next.fieldType, className, state),
            ),
            createThenForException(next, funcDef, state),
            createElseForExceptions(next, tail, funcDef, state),
        )
    } else {
        return ts.createBlock(
            [
                // const result: Thrift.TApplicationException = new thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, err.message)
                createConstStatement(
                    COMMON_IDENTIFIERS.result,
                    ts.createTypeReferenceNode(
                        THRIFT_IDENTIFIERS.TApplicationException,
                        undefined,
                    ),
                    createApplicationException(
                        'UNKNOWN',
                        ts.createIdentifier('err.message'),
                    ),
                ),
                // output.writeMessageBegin("{{name}}", Thrift.MessageType.EXCEPTION, requestId)
                createMethodCallStatement(
                    COMMON_IDENTIFIERS.output,
                    'writeMessageBegin',
                    [
                        ts.createLiteral(funcDef.name.value),
                        MESSAGE_TYPE.EXCEPTION,
                        COMMON_IDENTIFIERS.requestId,
                    ],
                ),
                // thrift.TApplicationExceptionCodec.encode(result, output)
                createMethodCallStatement(
                    THRIFT_IDENTIFIERS.TApplicationExceptionCodec,
                    'encode',
                    [COMMON_IDENTIFIERS.result, COMMON_IDENTIFIERS.output],
                ),
                // output.writeMessageEnd()
                createMethodCallStatement(
                    COMMON_IDENTIFIERS.output,
                    'writeMessageEnd',
                ),
                // return output.flush()
                ts.createReturn(
                    ts.createCall(
                        ts.createPropertyAccess(
                            COMMON_IDENTIFIERS.output,
                            'flush',
                        ),
                        undefined,
                        [],
                    ),
                ),
            ],
            true,
        )
    }
}

function createThenForException(
    throwDef: FieldDefinition,
    funcDef: FunctionDefinition,
    state: IRenderState,
): ts.Statement {
    return ts.createBlock(
        [
            // const result: {{throwType}} = new {{ServiceName}}{{nameTitleCase}}Result({{{throwName}}: err as {{throwType}}});
            createConstStatement(
                COMMON_IDENTIFIERS.result,
                ts.createTypeReferenceNode(
                    ts.createIdentifier(
                        looseName(
                            createStructResultName(funcDef),
                            SyntaxType.StructDefinition,
                            state,
                        ),
                    ),
                    undefined,
                ),
                ts.createObjectLiteral([
                    ts.createPropertyAssignment(
                        ts.createIdentifier(throwDef.name.value),
                        COMMON_IDENTIFIERS.err,
                    ),
                ]),
            ),
            // output.writeMessageBegin("{{name}}", Thrift.MessageType.REPLY, requestId)
            createMethodCallStatement(
                COMMON_IDENTIFIERS.output,
                'writeMessageBegin',
                [
                    ts.createLiteral(funcDef.name.value),
                    MESSAGE_TYPE.REPLY,
                    COMMON_IDENTIFIERS.requestId,
                ],
            ),
            // StructCodec.encode(result, output)
            createMethodCallStatement(
                ts.createIdentifier(
                    toolkitName(createStructResultName(funcDef), state),
                ),
                'encode',
                [COMMON_IDENTIFIERS.result, COMMON_IDENTIFIERS.output],
            ),
            // output.writeMessageEnd()
            createMethodCallStatement(
                COMMON_IDENTIFIERS.output,
                'writeMessageEnd',
            ),
            // return output.flush()
            ts.createReturn(
                ts.createCall(
                    ts.createPropertyAccess(COMMON_IDENTIFIERS.output, 'flush'),
                    undefined,
                    [],
                ),
            ),
        ],
        true,
    )
}

function createIfForExceptions(
    exps: Array<FieldDefinition>,
    funcDef: FunctionDefinition,
    state: IRenderState,
): ts.Statement {
    const [throwDef, ...tail] = exps

    return ts.createIf(
        ts.createBinary(
            COMMON_IDENTIFIERS.err,
            ts.SyntaxKind.InstanceOfKeyword,
            constructorNameForFieldType(throwDef.fieldType, className, state),
        ),
        createThenForException(throwDef, funcDef, state),
        createElseForExceptions(throwDef, tail, funcDef, state),
    )
}

function createExceptionHandlers(
    funcDef: FunctionDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    if (funcDef.throws.length > 0) {
        // if (err instanceof {{throwType}}) {
        return [createIfForExceptions(funcDef.throws, funcDef, state)]
    } else {
        return [
            // const result: Thrift.TApplicationException = new thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, err.message)
            createConstStatement(
                COMMON_IDENTIFIERS.result,
                ts.createTypeReferenceNode(
                    THRIFT_IDENTIFIERS.TApplicationException,
                    undefined,
                ),
                createApplicationException(
                    'UNKNOWN',
                    ts.createIdentifier('err.message'),
                ),
            ),
            // output.writeMessageBegin("{{name}}", Thrift.MessageType.EXCEPTION, requestId)
            createMethodCallStatement(
                COMMON_IDENTIFIERS.output,
                'writeMessageBegin',
                [
                    ts.createLiteral(funcDef.name.value),
                    MESSAGE_TYPE.EXCEPTION,
                    COMMON_IDENTIFIERS.requestId,
                ],
            ),
            // thrift.TApplicationExceptionCodec.encode(result, output)
            createMethodCallStatement(
                THRIFT_IDENTIFIERS.TApplicationExceptionCodec,
                'encode',
                [COMMON_IDENTIFIERS.result, COMMON_IDENTIFIERS.output],
            ),
            // output.writeMessageEnd()
            createMethodCallStatement(
                COMMON_IDENTIFIERS.output,
                'writeMessageEnd',
            ),
            // return output.flush()
            ts.createReturn(
                ts.createCall(
                    ts.createPropertyAccess(COMMON_IDENTIFIERS.output, 'flush'),
                    undefined,
                    [],
                ),
            ),
        ]
    }
}

// public process(input: TProtocol, output: TProtocol, context: Context): Promise<Buffer> {
//     const metadata = input.readMessageBegin()
//     const fieldName = metadata.fieldName;
//     const requestId = metadata.requestId;
//     const methodName: string = "process_" + fieldName;
//     switch (methodName) {
//       case "process_ping":
//         return this.process_ping(requestId, input, output, context)
//
//       default:
//         ...skip logic
//     }
// }
function createProcessMethod(
    service: ServiceDefinition,
    state: IRenderState,
): ts.MethodDeclaration {
    return createPublicMethod(
        COMMON_IDENTIFIERS.process,
        [
            createFunctionParameter(
                COMMON_IDENTIFIERS.data,
                createBufferType(),
            ),
            createFunctionParameter(
                COMMON_IDENTIFIERS.context,
                ContextType,
                undefined,
            ),
        ], // parameters
        ts.createTypeReferenceNode(COMMON_IDENTIFIERS.Promise, [
            createBufferType(),
        ]), // return type
        [
            createConstStatement(
                COMMON_IDENTIFIERS.transportWithData,
                ts.createTypeReferenceNode(
                    THRIFT_IDENTIFIERS.TTransport,
                    undefined,
                ),
                ts.createCall(
                    ts.createPropertyAccess(
                        ts.createPropertyAccess(
                            COMMON_IDENTIFIERS.this,
                            COMMON_IDENTIFIERS.transport,
                        ),
                        COMMON_IDENTIFIERS.receiver,
                    ),
                    undefined,
                    [COMMON_IDENTIFIERS.data],
                ),
            ),
            createConstStatement(
                COMMON_IDENTIFIERS.input,
                ts.createTypeReferenceNode(
                    THRIFT_IDENTIFIERS.TProtocol,
                    undefined,
                ),
                ts.createNew(
                    ts.createPropertyAccess(
                        COMMON_IDENTIFIERS.this,
                        COMMON_IDENTIFIERS.protocol,
                    ),
                    undefined,
                    [COMMON_IDENTIFIERS.transportWithData],
                ),
            ),
            ts.createReturn(
                createPromise(
                    ts.createTypeReferenceNode(
                        COMMON_IDENTIFIERS.Buffer,
                        undefined,
                    ),
                    createVoidType(),
                    [
                        createConstStatement(
                            COMMON_IDENTIFIERS.metadata,
                            ts.createTypeReferenceNode(
                                THRIFT_IDENTIFIERS.IThriftMessage,
                                undefined,
                            ),
                            createMethodCall(
                                COMMON_IDENTIFIERS.input,
                                'readMessageBegin',
                                [],
                            ),
                        ),
                        createConstStatement(
                            COMMON_IDENTIFIERS.fieldName,
                            createStringType(),
                            ts.createIdentifier('metadata.fieldName'),
                        ),
                        createConstStatement(
                            COMMON_IDENTIFIERS.requestId,
                            createNumberType(),
                            ts.createIdentifier('metadata.requestId'),
                        ),
                        createMethodCallForFname(service, state),
                    ],
                ),
            ),
        ], // body
    )
}

function createMethodCallForFunction(func: FunctionDefinition): ts.CaseClause {
    const processMethodName: string = `process_${func.name.value}`
    return ts.createCaseClause(ts.createLiteral(func.name.value), [
        ts.createBlock(
            [
                ts.createStatement(
                    ts.createCall(COMMON_IDENTIFIERS.resolve, undefined, [
                        createMethodCall(
                            COMMON_IDENTIFIERS.this,
                            processMethodName,
                            [
                                COMMON_IDENTIFIERS.requestId,
                                COMMON_IDENTIFIERS.input,
                                COMMON_IDENTIFIERS.output,
                                COMMON_IDENTIFIERS.context,
                            ],
                        ),
                    ]),
                ),
                ts.createStatement(COMMON_IDENTIFIERS.break),
            ],
            true,
        ),
    ])
}

/**
 * In Scrooge we did something like this:
 *
 * if (this["process_" + fieldName]) {
 *   retrun this["process_" + fieldName].call(this, requestId, input, output, context)
 * } else {
 *   ...skip logic
 * }
 *
 * When doing this we lose type safety. When we use the dynamic index access to call the method
 * the method and this are inferred to be of type any.
 *
 * We can maintain type safety through the generated code by removing the dynamic index access
 * and replace with a switch that will do static method calls.
 *
 * const methodName: string = "process_" + fieldName;
 * switch (methodName) {
 *   case "process_ping":
 *     return this.process_ping(requestId, input, output, context)
 *
 *   default:
 *     ...skip logic
 * }
 */
function createMethodCallForFname(
    service: ServiceDefinition,
    state: IRenderState,
): ts.SwitchStatement {
    return ts.createSwitch(
        COMMON_IDENTIFIERS.fieldName,
        ts.createCaseBlock([
            ...collectAllMethods(service, state).map(
                createMethodCallForFunction,
            ),
            ts.createDefaultClause([
                ts.createBlock(
                    [
                        // input.skip(Thrift.Type.STRUCT)
                        createMethodCallStatement(
                            COMMON_IDENTIFIERS.input,
                            'skip',
                            [THRIFT_TYPES.STRUCT],
                        ),
                        // input.readMessageEnd()
                        createMethodCallStatement(
                            COMMON_IDENTIFIERS.input,
                            'readMessageEnd',
                        ),
                        // const err = `Unknown function ${fieldName}`
                        createConstStatement(
                            ts.createIdentifier('errMessage'),
                            undefined,
                            ts.createBinary(
                                ts.createLiteral('Unknown function '),
                                ts.SyntaxKind.PlusToken,
                                COMMON_IDENTIFIERS.fieldName,
                            ),
                        ),
                        // const x = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN_METHOD, err)
                        createConstStatement(
                            COMMON_IDENTIFIERS.err,
                            undefined,
                            createApplicationException(
                                'UNKNOWN_METHOD',
                                ts.createIdentifier('errMessage'),
                            ),
                        ),
                        // output.writeMessageBegin(fieldName, Thrift.MessageType.EXCEPTION, requestId)
                        createMethodCallStatement(
                            COMMON_IDENTIFIERS.output,
                            'writeMessageBegin',
                            [
                                COMMON_IDENTIFIERS.fieldName,
                                MESSAGE_TYPE.EXCEPTION,
                                COMMON_IDENTIFIERS.requestId,
                            ],
                        ),
                        // thrift.TApplicationExceptionCodec.encode(err, output)
                        createMethodCallStatement(
                            THRIFT_IDENTIFIERS.TApplicationExceptionCodec,
                            'encode',
                            [COMMON_IDENTIFIERS.err, COMMON_IDENTIFIERS.output],
                        ),
                        // output.writeMessageEnd()
                        createMethodCallStatement(
                            COMMON_IDENTIFIERS.output,
                            'writeMessageEnd',
                        ),
                        // return output.flush()
                        ts.createStatement(
                            ts.createCall(
                                COMMON_IDENTIFIERS.resolve,
                                undefined,
                                [
                                    createMethodCall(
                                        COMMON_IDENTIFIERS.output,
                                        'flush',
                                    ),
                                ],
                            ),
                        ),
                        ts.createStatement(COMMON_IDENTIFIERS.break),
                    ],
                    true,
                ),
            ]),
        ]),
    )
}
