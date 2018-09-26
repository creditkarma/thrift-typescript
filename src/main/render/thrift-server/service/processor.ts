import * as ts from 'typescript'

import {
    // ExceptionDefinition,
    FieldDefinition,
    FunctionDefinition,
    ServiceDefinition,
    SyntaxType,
    ThriftStatement,
} from '@creditkarma/thrift-parser'

import {
    ContextType,
    TProtocolType,
} from './types'

import {
    createStructArgsName,
    createStructResultName,
} from './utils'

import {
  IIdentifierMap,
} from '../../../types'

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
    codecName, strictName,
} from '../struct/utils'

function objectLiteralForServiceFunctions(node: ThriftStatement): ts.ObjectLiteralExpression {
    switch (node.type) {
        case SyntaxType.ServiceDefinition:
            return ts.createObjectLiteral(
                node.functions.map((next: FunctionDefinition): ts.PropertyAssignment => {
                    return ts.createPropertyAssignment(
                        ts.createIdentifier(next.name.value),
                        ts.createIdentifier(`handler.${next.name.value}`),
                    )
                }),
                true,
            )

        default:
            throw new TypeError(`A service can only extend another service. Found: ${node.type}`)
    }
}

function handlerType(node: ServiceDefinition): ts.TypeNode {
    return ts.createTypeReferenceNode(
        COMMON_IDENTIFIERS.IHandler,
        [ ts.createTypeReferenceNode('Context', undefined) ],
    )
}

export function renderProcessor(node: ServiceDefinition, identifiers: IIdentifierMap): ts.ClassDeclaration {
    // private _handler
    const handler: ts.PropertyDeclaration = ts.createProperty(
        undefined,
        [ ts.createToken(ts.SyntaxKind.PublicKeyword) ],
        '_handler',
        undefined,
        handlerType(node),
        undefined,
    )

    const ctor: ts.ConstructorDeclaration = createClassConstructor(
        [
            createFunctionParameter(
                ts.createIdentifier('handler'),
                handlerType(node),
            ),
        ],
        [
            ...createSuperCall(node, identifiers),
            createAssignmentStatement(
                ts.createIdentifier('this._handler'),
                ts.createIdentifier('handler'),
            ),
        ],
    )

    const processMethod: ts.MethodDeclaration = createProcessMethod(node, identifiers)
    const processFunctions: Array<ts.MethodDeclaration> = node.functions.map((next: FunctionDefinition) => {
        return createProcessFunctionMethod(node, next, identifiers)
    })

    const heritage: Array<ts.HeritageClause> = (
        (node.extends !== null) ?
        [
            ts.createHeritageClause(
            ts.SyntaxKind.ExtendsKeyword,
            [
                ts.createExpressionWithTypeArguments(
                    [ ts.createTypeReferenceNode(COMMON_IDENTIFIERS.Context, undefined) ],
                    ts.createIdentifier(`${node.extends.value}.Processor`),
                ),
            ],
            ),
        ] :
        []
    )

    // export class <node.name> { ... }
    return ts.createClassDeclaration(
        undefined, // decorators
        [
            ts.createToken(ts.SyntaxKind.ExportKeyword),
        ], // modifiers
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
            ctor,
            processMethod,
            ...processFunctions,
        ], // body
    )
}

function createSuperCall(node: ServiceDefinition, identifiers: IIdentifierMap): Array<ts.Statement> {
    if (node.extends !== null) {
        return [
            ts.createStatement(ts.createCall(
                ts.createSuper(),
                [],
                [
                    objectLiteralForServiceFunctions(
                        identifiers[node.extends.value].definition,
                    ),
                ],
            )),
        ]
    } else {
        return []
    }
}

function createProcessFunctionMethod(
    service: ServiceDefinition,
    funcDef: FunctionDefinition,
    identifiers: IIdentifierMap,
): ts.MethodDeclaration {
    return createPublicMethod(
        ts.createIdentifier(`process_${funcDef.name.value}`),
        [
            createFunctionParameter('requestId', createNumberType()),
            createFunctionParameter('input', TProtocolType),
            createFunctionParameter('output', TProtocolType),
            createFunctionParameter('context', ContextType, undefined),
        ], // parameters
        ts.createTypeReferenceNode(
            ts.createIdentifier('Promise<Buffer>'),
            undefined,
        ), // return type
        [
            // new Promise<{{typeName}}>((resolve, reject) => {
            ts.createReturn(
                createMethodCall(
                    createMethodCall(
                        createPromise(
                            typeNodeForFieldType(funcDef.returnType, identifiers),
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
                                    ts.createBlock([
                                        ...createArgsVariable(funcDef),
                                        // input.readMessageEnd();
                                        createMethodCallStatement(
                                            COMMON_IDENTIFIERS.input,
                                            'readMessageEnd',
                                        ),
                                        createCallStatement(
                                            ts.createIdentifier('resolve'),
                                            [
                                                createMethodCall(
                                                    ts.createIdentifier('this._handler'),
                                                    funcDef.name.value,
                                                    [
                                                        ...funcDef.fields.map((next: FieldDefinition) => {
                                                            return ts.createIdentifier(`args.${next.name.value}`)
                                                        }),
                                                        COMMON_IDENTIFIERS.context,
                                                    ],
                                                ),
                                            ],
                                        ),
                                    ], true),
                                    ts.createCatchClause(
                                        ts.createVariableDeclaration('err'),
                                        ts.createBlock([
                                            createCallStatement(
                                                ts.createIdentifier('reject'),
                                                [ COMMON_IDENTIFIERS.err ],
                                            ),
                                        ], true),
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
                                        ts.createIdentifier('data'),
                                        typeNodeForFieldType(funcDef.returnType, identifiers),
                                    ),
                                ],
                                ts.createTypeReferenceNode(
                                    COMMON_IDENTIFIERS.Buffer,
                                    undefined,
                                ),
                                undefined,
                                ts.createBlock([
                                    // const result: StructType = {success: data}
                                    createConstStatement(
                                        COMMON_IDENTIFIERS.result,
                                        ts.createTypeReferenceNode(
                                            ts.createIdentifier(
                                                strictName(createStructResultName(funcDef)),
                                            ),
                                            undefined,
                                        ),
                                        ts.createObjectLiteral(
                                            [
                                                ts.createPropertyAssignment(
                                                    ts.createIdentifier('success'),
                                                    ts.createIdentifier('data'),
                                                ),
                                            ],
                                        ),
                                    ),
                                    // output.writeMessageBegin("{{name}}", Thrift.MessageType.REPLY, requestId)
                                    createMethodCallStatement(
                                        COMMON_IDENTIFIERS.output,
                                        'writeMessageBegin',
                                        [
                                            ts.createLiteral(funcDef.name.value),
                                            MESSAGE_TYPE.REPLY,
                                            ts.createIdentifier('requestId'),
                                        ],
                                    ),
                                    // StructCodec.encode(result, output)
                                    createMethodCallStatement(
                                        ts.createIdentifier(codecName(createStructResultName(funcDef))),
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
                                ], true),
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
                                    ts.createTypeReferenceNode(
                                        ts.createIdentifier('Error'),
                                        undefined,
                                    ),
                                ),
                            ],
                            ts.createTypeReferenceNode(
                                COMMON_IDENTIFIERS.Buffer,
                                undefined,
                            ),
                            undefined,
                            ts.createBlock([
                                // if (def.throws.length > 0)
                                ...createExceptionHandlers(funcDef),
                            ], true),
                        ),
                    ],
                ),
            ),
        ], // body
    )
}

function createArgsVariable(funcDef: FunctionDefinition): Array<ts.Statement> {
    if (funcDef.fields.length > 0) {
        // const args: type: StructType = StructCodec.decode(input)
        return [
            createConstStatement(
                COMMON_IDENTIFIERS.args,
                ts.createTypeReferenceNode(
                    ts.createIdentifier(
                        strictName(createStructArgsName(funcDef)),
                    ),
                    undefined,
                ),
                ts.createCall(
                    ts.createPropertyAccess(
                        ts.createIdentifier(
                            codecName(createStructArgsName(funcDef)),
                        ),
                        ts.createIdentifier('decode'),
                    ),
                    undefined,
                    [ COMMON_IDENTIFIERS.input ],
                ),
            ),
        ]
    } else {
        return []
    }
}

function createElseForExceptions(exp: FieldDefinition, remaining: Array<FieldDefinition>, funcDef: FunctionDefinition): ts.Statement {
    if (remaining.length > 0) {
        const [ next, ...tail ] = remaining
        return ts.createIf(
            ts.createBinary(
                COMMON_IDENTIFIERS.err,
                ts.SyntaxKind.InstanceOfKeyword,
                constructorNameForFieldType(next.fieldType),
            ),
            createThenForException(next, funcDef),
            createElseForExceptions(next, tail, funcDef),
        )
    } else {
        return ts.createBlock([
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
                    ts.createIdentifier('requestId'),
                ],
            ),
            // thrift.TApplicationExceptionCodec.encode(result, output)
            createMethodCallStatement(
                THRIFT_IDENTIFIERS.TApplicationExceptionCodec,
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
        ], true)
    }
}

function createThenForException(throwDef: FieldDefinition, funcDef: FunctionDefinition): ts.Statement {
    return ts.createBlock([
        // const result: {{throwType}} = new {{ServiceName}}{{nameTitleCase}}Result({{{throwName}}: err as {{throwType}}});
        createConstStatement(
            COMMON_IDENTIFIERS.result,
            ts.createTypeReferenceNode(
                ts.createIdentifier(
                    strictName(createStructResultName(funcDef)),
                ),
                undefined,
            ),
            ts.createObjectLiteral(
                [
                    ts.createPropertyAssignment(
                        ts.createIdentifier(throwDef.name.value),
                        COMMON_IDENTIFIERS.err,
                    ),
                ],
            ),
        ),
        // output.writeMessageBegin("{{name}}", Thrift.MessageType.REPLY, requestId)
        createMethodCallStatement(
            COMMON_IDENTIFIERS.output,
            'writeMessageBegin',
            [
                ts.createLiteral(funcDef.name.value),
                MESSAGE_TYPE.REPLY,
                ts.createIdentifier('requestId'),
            ],
        ),
        // StructCodec.encode(result, output)
        createMethodCallStatement(
            ts.createIdentifier(codecName(createStructResultName(funcDef))),
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
    ], true)
}

function createIfForExceptions(exps: Array<FieldDefinition>, funcDef: FunctionDefinition): ts.Statement {
    const [ throwDef, ...tail ] = exps

    return ts.createIf(
        ts.createBinary(
            COMMON_IDENTIFIERS.err,
            ts.SyntaxKind.InstanceOfKeyword,
            constructorNameForFieldType(throwDef.fieldType),
        ),
        createThenForException(throwDef, funcDef),
        createElseForExceptions(throwDef, tail, funcDef),
    )
}

function createExceptionHandlers(funcDef: FunctionDefinition): Array<ts.Statement> {
    if (funcDef.throws.length > 0) {
        // if (err instanceof {{throwType}}) {
        return [ createIfForExceptions(funcDef.throws, funcDef) ]

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
                    ts.createIdentifier('requestId'),
                ],
            ),
            // thrift.TApplicationExceptionCodec.encode(result, output)
            createMethodCallStatement(
                THRIFT_IDENTIFIERS.TApplicationExceptionCodec,
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
function createProcessMethod(service: ServiceDefinition, identifiers: IIdentifierMap): ts.MethodDeclaration {
    return createPublicMethod(
        COMMON_IDENTIFIERS.process,
        [
            createFunctionParameter('input', TProtocolType),
            createFunctionParameter('output', TProtocolType),
            createFunctionParameter('context', ContextType, undefined),
        ], // parameters
        ts.createTypeReferenceNode(
        ts.createIdentifier('Promise<Buffer>'),
        undefined,
        ), // return type
        [
            ts.createReturn(
                createPromise(
                    ts.createTypeReferenceNode(
                        COMMON_IDENTIFIERS.Buffer,
                        undefined,
                    ),
                    createVoidType(),
                    [
                        createConstStatement(
                            'metadata',
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
                            'fieldName',
                            createStringType(),
                            ts.createIdentifier('metadata.fieldName'),
                        ),
                        createConstStatement(
                            'requestId',
                            createNumberType(),
                            ts.createIdentifier('metadata.requestId'),
                        ),
                        createConstStatement(
                            ts.createIdentifier('methodName'),
                            createStringType(),
                            ts.createBinary(
                                ts.createLiteral('process_'),
                                ts.SyntaxKind.PlusToken,
                                COMMON_IDENTIFIERS.fieldName,
                            ),
                        ),
                        createMethodCallForFname(service, identifiers),
                    ],
                ),
            ),
        ], // body
    )
}

function createMethodCallForFunction(func: FunctionDefinition): ts.CaseClause {
    const processMethodName: string = `process_${func.name.value}`
    return ts.createCaseClause(
        ts.createLiteral(processMethodName),
        [
            ts.createBlock([
                ts.createStatement(ts.createCall(
                    ts.createIdentifier('resolve'),
                    undefined,
                    [
                        createMethodCall(
                            ts.createIdentifier('this'),
                            processMethodName,
                            [
                                ts.createIdentifier('requestId'),
                                COMMON_IDENTIFIERS.input,
                                COMMON_IDENTIFIERS.output,
                                COMMON_IDENTIFIERS.context,
                            ],
                        ),
                    ],
                )),
                ts.createStatement(COMMON_IDENTIFIERS.break),
            ], true),
        ],
    )
}

function functionsForService(node: ThriftStatement): Array<FunctionDefinition> {
    switch (node.type) {
        case SyntaxType.ServiceDefinition:
            return node.functions

        default:
            throw new TypeError(`A service can only extend another service. Found: ${node.type}`)
    }
}

function collectAllMethods(service: ServiceDefinition, identifiers: IIdentifierMap): Array<FunctionDefinition> {
    if (service.extends !== null) {
        const inheritedMethods: Array<FunctionDefinition> = functionsForService(identifiers[service.extends.value].definition)
        return [
            ...inheritedMethods,
            ...service.functions,
        ]
    } else {
        return service.functions
    }
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
function createMethodCallForFname(service: ServiceDefinition, identifiers: IIdentifierMap): ts.SwitchStatement {
    return ts.createSwitch(
        ts.createIdentifier('methodName'),
        ts.createCaseBlock([
            ...collectAllMethods(service, identifiers).map(createMethodCallForFunction),
            ts.createDefaultClause([
                ts.createBlock([
                    // input.skip(Thrift.Type.STRUCT)
                    createMethodCallStatement(
                        COMMON_IDENTIFIERS.input,
                        'skip',
                        [ THRIFT_TYPES.STRUCT ],
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
                            ts.createIdentifier('requestId'),
                        ],
                    ),
                    // thrift.TApplicationExceptionCodec.encode(err, output)
                    createMethodCallStatement(
                        THRIFT_IDENTIFIERS.TApplicationExceptionCodec,
                        'encode',
                        [
                            COMMON_IDENTIFIERS.err,
                            COMMON_IDENTIFIERS.output,
                        ],
                    ),
                    // output.writeMessageEnd()
                    createMethodCallStatement(
                        COMMON_IDENTIFIERS.output,
                        'writeMessageEnd',
                    ),
                    // return output.flush()
                    ts.createStatement(ts.createCall(
                        ts.createIdentifier('resolve'),
                        undefined,
                        [
                            createMethodCall(
                                COMMON_IDENTIFIERS.output,
                                'flush',
                            ),
                        ],
                    )),
                    ts.createStatement(COMMON_IDENTIFIERS.break),
                ], true),
            ]),
        ]),
    )
}
