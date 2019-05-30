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
    createStructArgsName,
    createStructResultName,
    renderMethodNamesProperty,
    renderMethodNamesStaticProperty,
    renderServiceNameProperty,
    renderServiceNameStaticProperty,
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
    createAnyType,
    createNumberType,
    createStringType,
    createVoidType,
    typeNodeForFieldType,
} from '../types'

import {
    renderMethodAnnotationsProperty,
    renderMethodAnnotationsStaticProperty,
    renderServiceAnnotationsProperty,
    renderServiceAnnotationsStaticProperty,
} from '../annotations'

import { Resolver } from '../../../resolver'

import { collectAllMethods } from '../../shared/service'

import {
    createBufferType,
    createErrorType,
    createPromiseType,
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
                    Resolver.resolveIdentifierName(service.value, state)
                        .fullName
                }.Processor`,
            ),
        ),
    ])
}

export function extendsAbstract(): ts.HeritageClause {
    return ts.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
        ts.createExpressionWithTypeArguments(
            [
                ts.createTypeReferenceNode(
                    COMMON_IDENTIFIERS.Context,
                    undefined,
                ),
                ts.createTypeReferenceNode(COMMON_IDENTIFIERS.IHandler, [
                    ts.createTypeReferenceNode(
                        COMMON_IDENTIFIERS.Context,
                        undefined,
                    ),
                ]),
            ],
            THRIFT_IDENTIFIERS.ThriftProcessor,
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
        COMMON_IDENTIFIERS._handler,
        undefined,
        ts.createTypeReferenceNode(COMMON_IDENTIFIERS.IHandler, [
            ts.createTypeReferenceNode(COMMON_IDENTIFIERS.Context, undefined),
        ]),
        undefined,
    )

    const staticServiceName: ts.PropertyDeclaration = renderServiceNameStaticProperty()
    const staticAnnotations: ts.PropertyDeclaration = renderServiceAnnotationsStaticProperty()
    const staticMethodAnnotations: ts.PropertyDeclaration = renderMethodAnnotationsStaticProperty()
    const staticMethodNames: ts.PropertyDeclaration = renderMethodNamesStaticProperty()

    const serviceName: ts.PropertyDeclaration = renderServiceNameProperty()
    const annotations: ts.PropertyDeclaration = renderServiceAnnotationsProperty()
    const methodAnnotations: ts.PropertyDeclaration = renderMethodAnnotationsProperty()
    const methodNames: ts.PropertyDeclaration = renderMethodNamesProperty()

    const processMethod: ts.MethodDeclaration = createProcessMethod(
        service,
        state,
    )
    const processFunctions: Array<ts.MethodDeclaration> = service.functions.map(
        (next: FunctionDefinition) => {
            return createProcessFunctionMethod(service, next, state)
        },
    )

    const heritage: Array<ts.HeritageClause> =
        service.extends !== null
            ? [extendsService(service.extends, state)]
            : [extendsAbstract()]

    // export class <node.name> { ... }
    return ts.createClassDeclaration(
        undefined, // decorators
        [ts.createToken(ts.SyntaxKind.ExportKeyword)], // modifiers
        'Processor', // name
        [
            ts.createTypeParameterDeclaration(
                'Context',
                undefined,
                createAnyType(),
            ),
        ], // type parameters
        heritage, // heritage
        [
            handler,
            staticServiceName,
            staticAnnotations,
            staticMethodAnnotations,
            staticMethodNames,
            serviceName,
            annotations,
            methodAnnotations,
            methodNames,
            createCtor(service, state),
            processMethod,
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
            [createFunctionParameter('handler', createHandlerType(service))],
            [
                createSuperCall(service.extends, state),
                createAssignmentStatement(
                    ts.createIdentifier('this._handler'),
                    ts.createIdentifier('handler'),
                ),
            ],
        )
    } else {
        return createClassConstructor(
            [createFunctionParameter('handler', createHandlerType(service))],
            [
                ts.createStatement(ts.createCall(ts.createSuper(), [], [])),
                createAssignmentStatement(
                    ts.createIdentifier('this._handler'),
                    ts.createIdentifier('handler'),
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
                    Resolver.resolveIdentifierDefinition(service, {
                        currentNamespace: state.currentNamespace,
                        namespaceMap: state.project.namespaces,
                    }),
                ),
            ],
        ),
    )
}

function createProcessFunctionMethod(
    service: ServiceDefinition,
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
        createPromiseType(createBufferType()), // return type
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
                                //         this._handler.{{name}}({{#args}}args.{{fieldName}}, {{/args}}context)
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
                                                        ts.createIdentifier(
                                                            'this._handler',
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
            createFunctionParameter(COMMON_IDENTIFIERS.input, TProtocolType),
            createFunctionParameter(COMMON_IDENTIFIERS.output, TProtocolType),
            createFunctionParameter(
                COMMON_IDENTIFIERS.context,
                ContextType,
                undefined,
            ),
        ], // parameters
        createPromiseType(createBufferType()), // return type
        [
            ts.createReturn(
                createPromise(createBufferType(), createVoidType(), [
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
                        ts.createPropertyAccess(
                            COMMON_IDENTIFIERS.metadata,
                            COMMON_IDENTIFIERS.fieldName,
                        ),
                    ),
                    createConstStatement(
                        COMMON_IDENTIFIERS.requestId,
                        createNumberType(),
                        ts.createPropertyAccess(
                            COMMON_IDENTIFIERS.metadata,
                            COMMON_IDENTIFIERS.requestId,
                        ),
                    ),
                    createConstStatement(
                        COMMON_IDENTIFIERS.methodName,
                        createStringType(),
                        ts.createBinary(
                            ts.createLiteral('process_'),
                            ts.SyntaxKind.PlusToken,
                            COMMON_IDENTIFIERS.fieldName,
                        ),
                    ),
                    createMethodCallForFname(service, state),
                ]),
            ),
        ], // body
    )
}

function createMethodCallForFunction(func: FunctionDefinition): ts.CaseClause {
    const processMethodName: string = `process_${func.name.value}`
    return ts.createCaseClause(ts.createLiteral(processMethodName), [
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
        COMMON_IDENTIFIERS.methodName,
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
