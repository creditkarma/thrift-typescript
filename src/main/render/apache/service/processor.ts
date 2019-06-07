import * as ts from 'typescript'

import {
    FieldDefinition,
    FunctionDefinition,
    ServiceDefinition,
} from '@creditkarma/thrift-parser'

import { TProtocolType } from './types'

import { createStructArgsName, createStructResultName } from './utils'

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

import { Resolver } from '../../../resolver'
import { IRenderState } from '../../../types'

import {
    constructorNameForFieldType,
    createNumberType,
    createStringType,
    createVoidType,
    typeNodeForFieldType,
} from '../types'

import {
    COMMON_IDENTIFIERS,
    MESSAGE_TYPE,
    THRIFT_IDENTIFIERS,
    THRIFT_TYPES,
} from '../identifiers'

import {
    collectAllMethods,
    collectInheritedMethods,
} from '../../shared/service'

import { createErrorType, createPromiseType } from '../../shared/types'

function funcToMethodReducer(
    acc: Array<ts.MethodSignature>,
    func: FunctionDefinition,
    state: IRenderState,
): Array<ts.MethodSignature> {
    return acc.concat([
        ts.createMethodSignature(
            undefined,
            [
                ...func.fields.map((field: FieldDefinition) => {
                    return createFunctionParameter(
                        field.name.value,
                        typeNodeForFieldType(field.fieldType, state),
                        undefined,
                        field.requiredness === 'optional',
                    )
                }),
            ],
            ts.createUnionTypeNode([
                typeNodeForFieldType(func.returnType, state),
                createPromiseType(typeNodeForFieldType(func.returnType, state)),
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
 * interface IMyServiceHandler {
 *   add(a: number, b: number): number
 * }
 */
export function renderHandlerInterface(
    service: ServiceDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    const signatures: Array<ts.MethodSignature> = service.functions.reduce(
        (acc: Array<ts.MethodSignature>, next: FunctionDefinition) => {
            return funcToMethodReducer(acc, next, state)
        },
        [],
    )

    if (service.extends !== null) {
        return [
            ts.createInterfaceDeclaration(
                undefined,
                [ts.createToken(ts.SyntaxKind.ExportKeyword)],
                COMMON_IDENTIFIERS.ILocalHandler,
                undefined,
                [],
                signatures,
            ),
            ts.createTypeAliasDeclaration(
                undefined,
                [ts.createToken(ts.SyntaxKind.ExportKeyword)],
                COMMON_IDENTIFIERS.IHandler,
                undefined,
                ts.createIntersectionTypeNode([
                    ts.createTypeReferenceNode(
                        COMMON_IDENTIFIERS.ILocalHandler,
                        undefined,
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
                        undefined,
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
                undefined,
                [],
                signatures,
            ),
        ]
    }
}

function objectLiteralForServiceFunctions(
    service: ServiceDefinition,
    state: IRenderState,
): ts.ObjectLiteralExpression {
    return ts.createObjectLiteral(
        collectInheritedMethods(service, {
            currentNamespace: state.currentNamespace,
            namespaceMap: state.project.namespaces,
        }).map(
            (next: FunctionDefinition): ts.PropertyAssignment => {
                return ts.createPropertyAssignment(
                    ts.createIdentifier(next.name.value),
                    ts.createPropertyAccess(
                        COMMON_IDENTIFIERS.handler,
                        ts.createIdentifier(next.name.value),
                    ),
                )
            },
        ),
        true,
    )
}

function handlerType(node: ServiceDefinition): ts.TypeNode {
    return ts.createTypeReferenceNode(COMMON_IDENTIFIERS.IHandler, undefined)
}

function createSuperCall(
    service: ServiceDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    if (service.extends !== null) {
        return [
            ts.createStatement(
                ts.createCall(
                    ts.createSuper(),
                    [],
                    [objectLiteralForServiceFunctions(service, state)],
                ),
            ),
        ]
    } else {
        return []
    }
}

export function renderProcessor(
    node: ServiceDefinition,
    state: IRenderState,
): ts.ClassDeclaration {
    // private _handler
    const handler: ts.PropertyDeclaration = ts.createProperty(
        undefined,
        [ts.createToken(ts.SyntaxKind.PublicKeyword)],
        COMMON_IDENTIFIERS._handler,
        undefined,
        handlerType(node),
        undefined,
    )

    const ctor: ts.ConstructorDeclaration = createClassConstructor(
        [
            createFunctionParameter(
                COMMON_IDENTIFIERS.handler,
                handlerType(node),
            ),
        ],
        [
            ...createSuperCall(node, state),
            createAssignmentStatement(
                ts.createPropertyAccess(
                    COMMON_IDENTIFIERS.this,
                    COMMON_IDENTIFIERS._handler,
                ),
                COMMON_IDENTIFIERS.handler,
            ),
        ],
    )

    const processMethod: ts.MethodDeclaration = createProcessMethod(node, state)
    const processFunctions: Array<ts.MethodDeclaration> = node.functions.map(
        (next: FunctionDefinition) => {
            return createProcessFunctionMethod(next, state)
        },
    )

    const heritage: Array<ts.HeritageClause> =
        node.extends !== null
            ? [
                  ts.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
                      ts.createExpressionWithTypeArguments(
                          [],
                          ts.createPropertyAccess(
                              ts.createIdentifier(
                                  `${
                                      Resolver.resolveIdentifierName(
                                          node.extends.value,
                                          {
                                              currentNamespace:
                                                  state.currentNamespace,
                                              currentDefinitions:
                                                  state.currentDefinitions,
                                              namespaceMap:
                                                  state.project.namespaces,
                                          },
                                      ).fullName
                                  }`,
                              ),
                              COMMON_IDENTIFIERS.Processor,
                          ),
                      ),
                  ]),
              ]
            : []

    // export class <node.name> { ... }
    return ts.createClassDeclaration(
        undefined, // decorators
        [ts.createToken(ts.SyntaxKind.ExportKeyword)], // modifiers
        COMMON_IDENTIFIERS.Processor, // name
        undefined, // type parameters
        heritage, // heritage
        [handler, ctor, processMethod, ...processFunctions], // body
    )
}

// public process_{{name}}(seqid: number, input: TProtocol, output: TProtocol) {
//     const args = new {{ServiceName}}{{nameTitleCase}}Args()
//     args.read(input)
//     input.readMessageEnd()
//     new Promise<{{typeName}}>((resolve, reject) => {
//         try {
//             resolve(
//                 this._handler.{{name}}({{#args}}args.{{fieldName}}, {{/args}})
//             )
//         } catch (e) {
//             reject(e)
//         }
//     }).then((data: {{typeName}}) => {
//         const result = new {{ServiceName}}{{nameTitleCase}}Result({success: data})
//         output.writeMessageBegin("{{name}}", Thrift.MessageType.REPLY, seqid)
//         result.write(output)
//         output.writeMessageEnd()
//         output.flush()
//     }).catch((err: Error) => {
//         let result
//         {{#hasThrows}}{{#throws}}if (err instanceof {{throwType}}) {
//             result = new {{ServiceName}}{{nameTitleCase}}Result()
//             result.populate({{{throwName}}: err as {{throwType}}})
//             output.writeMessageBegin("{{name}}", Thrift.MessageType.REPLY, seqid)
//         } else {{/throws}}{
//             result = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, err.message)
//             output.writeMessageBegin("{{name}}", Thrift.MessageType.EXCEPTION, seqid)
//         }
//         {{/hasThrows}}
//         {{^hasThrows}}
//         result = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, err.message)
//         output.writeMessageBegin("{{name}}", Thrift.MessageType.EXCEPTION, seqid)
//         {{/hasThrows}}
//         result.write(output)
//         output.writeMessageEnd()
//         output.flush()
//     })
// }
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
        ], // parameters
        createVoidType(), // return type
        [
            // new Promise<{{typeName}}>((resolve, reject) => {
            ts.createStatement(
                createMethodCall(
                    createMethodCall(
                        createPromise(
                            typeNodeForFieldType(funcDef.returnType, state),
                            createVoidType(),
                            [
                                // try {
                                //     resolve(
                                //         this._handler.{{name}}({{#args}}args.{{fieldName}}, {{/args}})
                                //     )
                                // } catch (e) {
                                //     reject(e)
                                // }
                                ts.createTry(
                                    ts.createBlock(
                                        [
                                            ...createArgsVariable(funcDef),
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
                                                            COMMON_IDENTIFIERS._handler,
                                                        ),
                                                        funcDef.name.value,
                                                        funcDef.fields.map(
                                                            (
                                                                next: FieldDefinition,
                                                            ) => {
                                                                return ts.createIdentifier(
                                                                    `args.${next.name.value}`,
                                                                )
                                                            },
                                                        ),
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
                                                    ts.createIdentifier(
                                                        'reject',
                                                    ),
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
                        'then',
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
                                        ),
                                    ),
                                ],
                                createVoidType(),
                                undefined,
                                ts.createBlock(
                                    [
                                        // const result = new {{ServiceName}}{{nameTitleCase}}Result({success: data})
                                        createConstStatement(
                                            COMMON_IDENTIFIERS.result,
                                            ts.createTypeReferenceNode(
                                                ts.createIdentifier(
                                                    createStructResultName(
                                                        funcDef,
                                                    ),
                                                ),
                                                undefined,
                                            ),
                                            ts.createNew(
                                                ts.createIdentifier(
                                                    createStructResultName(
                                                        funcDef,
                                                    ),
                                                ),
                                                undefined,
                                                [
                                                    ts.createObjectLiteral([
                                                        ts.createPropertyAssignment(
                                                            COMMON_IDENTIFIERS.success,
                                                            COMMON_IDENTIFIERS.data,
                                                        ),
                                                    ]),
                                                ],
                                            ),
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
                                        // result.write(output)
                                        createMethodCallStatement(
                                            COMMON_IDENTIFIERS.result,
                                            COMMON_IDENTIFIERS.write,
                                            [COMMON_IDENTIFIERS.output],
                                        ),
                                        // output.writeMessageEnd()
                                        createMethodCallStatement(
                                            COMMON_IDENTIFIERS.output,
                                            'writeMessageEnd',
                                            [],
                                        ),
                                        // return output.flush()
                                        ts.createStatement(
                                            ts.createCall(
                                                ts.createPropertyAccess(
                                                    COMMON_IDENTIFIERS.output,
                                                    COMMON_IDENTIFIERS.flush,
                                                ),
                                                undefined,
                                                [],
                                            ),
                                        ),
                                        ts.createReturn(),
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
                            createVoidType(),
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

function createArgsVariable(funcDef: FunctionDefinition): Array<ts.Statement> {
    if (funcDef.fields.length > 0) {
        return [
            createConstStatement(
                COMMON_IDENTIFIERS.args,
                ts.createTypeReferenceNode(
                    ts.createIdentifier(createStructArgsName(funcDef)),
                    undefined,
                ),
                ts.createCall(
                    ts.createPropertyAccess(
                        ts.createIdentifier(createStructArgsName(funcDef)),
                        COMMON_IDENTIFIERS.read,
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
                constructorNameForFieldType(
                    next.fieldType,
                    (name: string) => {
                        return Resolver.resolveIdentifierName(name, {
                            currentNamespace: state.currentNamespace,
                            currentDefinitions: state.currentDefinitions,
                            namespaceMap: state.project.namespaces,
                        }).fullName
                    },
                    state,
                ),
            ),
            createThenForException(next, funcDef),
            createElseForExceptions(tail, funcDef, state),
        )
    } else {
        return ts.createBlock(
            [
                // const result: Thrift.TApplicationException = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, err.message)
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
                // output.writeMessageBegin("{{name}}", Thrift.MessageType.EXCEPTION, seqid)
                createMethodCallStatement(
                    COMMON_IDENTIFIERS.output,
                    'writeMessageBegin',
                    [
                        ts.createLiteral(funcDef.name.value),
                        MESSAGE_TYPE.EXCEPTION,
                        COMMON_IDENTIFIERS.requestId,
                    ],
                ),
                // result.write(output)
                createMethodCallStatement(
                    COMMON_IDENTIFIERS.result,
                    COMMON_IDENTIFIERS.write,
                    [COMMON_IDENTIFIERS.output],
                ),
                // output.writeMessageEnd()
                createMethodCallStatement(
                    COMMON_IDENTIFIERS.output,
                    'writeMessageEnd',
                ),
                // output.flush()
                createMethodCallStatement(
                    COMMON_IDENTIFIERS.output,
                    COMMON_IDENTIFIERS.flush,
                ),
                ts.createReturn(),
            ],
            true,
        )
    }
}

function createThenForException(
    throwDef: FieldDefinition,
    funcDef: FunctionDefinition,
): ts.Statement {
    return ts.createBlock(
        [
            // const result: {{throwType}} = new {{ServiceName}}{{nameTitleCase}}Result({{{throwName}}: err as {{throwType}}});
            createConstStatement(
                COMMON_IDENTIFIERS.result,
                ts.createTypeReferenceNode(
                    ts.createIdentifier(createStructResultName(funcDef)),
                    undefined,
                ),
                ts.createNew(
                    ts.createIdentifier(createStructResultName(funcDef)),
                    undefined,
                    [
                        ts.createObjectLiteral([
                            ts.createPropertyAssignment(
                                ts.createIdentifier(throwDef.name.value),
                                COMMON_IDENTIFIERS.err,
                            ),
                        ]),
                    ],
                ),
            ),
            // output.writeMessageBegin("{{name}}", Thrift.MessageType.REPLY, seqid)
            createMethodCallStatement(
                COMMON_IDENTIFIERS.output,
                'writeMessageBegin',
                [
                    ts.createLiteral(funcDef.name.value),
                    MESSAGE_TYPE.REPLY,
                    COMMON_IDENTIFIERS.requestId,
                ],
            ),
            // result.write(output)
            createMethodCallStatement(
                COMMON_IDENTIFIERS.result,
                COMMON_IDENTIFIERS.write,
                [COMMON_IDENTIFIERS.output],
            ),
            // output.writeMessageEnd()
            createMethodCallStatement(
                COMMON_IDENTIFIERS.output,
                'writeMessageEnd',
            ),
            // output.flush()
            createMethodCallStatement(
                COMMON_IDENTIFIERS.output,
                COMMON_IDENTIFIERS.flush,
            ),
            ts.createReturn(),
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
            constructorNameForFieldType(
                throwDef.fieldType,
                (name: string) => {
                    return Resolver.resolveIdentifierName(name, {
                        currentNamespace: state.currentNamespace,
                        currentDefinitions: state.currentDefinitions,
                        namespaceMap: state.project.namespaces,
                    }).fullName
                },
                state,
            ),
        ),
        createThenForException(throwDef, funcDef),
        createElseForExceptions(tail, funcDef, state),
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
            // const result: Thrift.TApplicationException = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, err.message)
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
            // output.writeMessageBegin("{{name}}", Thrift.MessageType.EXCEPTION, seqid)
            createMethodCallStatement(
                COMMON_IDENTIFIERS.output,
                'writeMessageBegin',
                [
                    ts.createLiteral(funcDef.name.value),
                    MESSAGE_TYPE.EXCEPTION,
                    COMMON_IDENTIFIERS.requestId,
                ],
            ),
            // result.write(output)
            createMethodCallStatement(
                COMMON_IDENTIFIERS.result,
                COMMON_IDENTIFIERS.write,
                [COMMON_IDENTIFIERS.output],
            ),
            // output.writeMessageEnd()
            createMethodCallStatement(
                COMMON_IDENTIFIERS.output,
                'writeMessageEnd',
            ),
            // output.flush()
            createMethodCallStatement(
                COMMON_IDENTIFIERS.output,
                COMMON_IDENTIFIERS.flush,
            ),
            ts.createReturn(),
        ]
    }
}

// public process(input: TProtocol, output: TProtocol) {
//     const metadata = input.readMessageBegin()
//     const fname = metadata.fname;
//     const rseqid = metadata.rseqid;
//     const methodName: string = "process_" + fname;
//     switch (methodName) {
//       case "process_ping":
//         return this.process_ping(rseqid, input, output)
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
        ], // parameters
        createVoidType(), // return type
        [
            createConstStatement(
                COMMON_IDENTIFIERS.metadata,
                ts.createTypeReferenceNode(
                    THRIFT_IDENTIFIERS.TMessage,
                    undefined,
                ),
                createMethodCall(
                    COMMON_IDENTIFIERS.input,
                    'readMessageBegin',
                    [],
                ),
            ),
            createConstStatement(
                COMMON_IDENTIFIERS.fname,
                createStringType(),
                ts.createPropertyAccess(
                    COMMON_IDENTIFIERS.metadata,
                    COMMON_IDENTIFIERS.fname,
                ),
            ),
            createConstStatement(
                COMMON_IDENTIFIERS.requestId,
                createNumberType(),
                ts.createPropertyAccess(
                    COMMON_IDENTIFIERS.metadata,
                    COMMON_IDENTIFIERS.rseqid,
                ),
            ),
            createConstStatement(
                COMMON_IDENTIFIERS.methodName,
                createStringType(),
                ts.createBinary(
                    ts.createLiteral('process_'),
                    ts.SyntaxKind.PlusToken,
                    COMMON_IDENTIFIERS.fname,
                ),
            ),
            createMethodCallForFname(service, state),
        ], // body
    )
}

function createMethodCallForFunction(func: FunctionDefinition): ts.CaseClause {
    const processMethodName: string = `process_${func.name.value}`
    return ts.createCaseClause(ts.createLiteral(processMethodName), [
        ts.createBlock(
            [
                ts.createStatement(
                    createMethodCall(
                        COMMON_IDENTIFIERS.this,
                        processMethodName,
                        [
                            COMMON_IDENTIFIERS.requestId,
                            COMMON_IDENTIFIERS.input,
                            COMMON_IDENTIFIERS.output,
                        ],
                    ),
                ),
                ts.createReturn(),
            ],
            true,
        ),
    ])
}

/**
 * In Scrooge we did something like this:
 *
 * if (this["process_" + fname]) {
 *   retrun this["process_" + fname].call(this, rseqid, input, output)
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
 * const methodName: string = "process_" + fname;
 * switch (methodName) {
 *   case "process_ping":
 *     return this.process_ping(rseqid, input, output)
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
                        // const err = `Unknown function ${fname}`
                        createConstStatement(
                            ts.createIdentifier('errMessage'),
                            undefined,
                            ts.createBinary(
                                ts.createLiteral('Unknown function '),
                                ts.SyntaxKind.PlusToken,
                                COMMON_IDENTIFIERS.fname,
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
                        // output.writeMessageBegin(fname, Thrift.MessageType.EXCEPTION, rseqid)
                        createMethodCallStatement(
                            COMMON_IDENTIFIERS.output,
                            'writeMessageBegin',
                            [
                                COMMON_IDENTIFIERS.fname,
                                MESSAGE_TYPE.EXCEPTION,
                                COMMON_IDENTIFIERS.requestId,
                            ],
                        ),
                        // err.write(output)
                        createMethodCallStatement(
                            COMMON_IDENTIFIERS.err,
                            COMMON_IDENTIFIERS.write,
                            [COMMON_IDENTIFIERS.output],
                        ),
                        // output.writeMessageEnd()
                        createMethodCallStatement(
                            COMMON_IDENTIFIERS.output,
                            'writeMessageEnd',
                        ),
                        // output.flush()
                        createMethodCallStatement(
                            COMMON_IDENTIFIERS.output,
                            COMMON_IDENTIFIERS.flush,
                        ),
                        // return;
                        ts.createReturn(),
                    ],
                    true,
                ),
            ]),
        ]),
    )
}
