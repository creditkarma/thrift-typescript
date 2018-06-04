import * as ts from 'typescript'

import {
    FieldDefinition,
    FunctionDefinition,
    ServiceDefinition,
    SyntaxType,
} from '@creditkarma/thrift-parser'

import {
    ContextType,
    createConnectionType,
} from './types'

import {
    createStructArgsName,
    createStructResultName,
} from './utils'

import {
    APPLICATION_EXCEPTION,
    COMMON_IDENTIFIERS,
    MESSAGE_TYPE,
    THRIFT_IDENTIFIERS,
} from '../identifiers'

import {
    createApplicationException,
    createAssignmentStatement,
    createClassConstructor,
    createConstStatement,
    createFunctionParameter,
    createMethodCallStatement,
    createNotNullCheck,
    createProtectedProperty,
} from '../utils'

import {
    createAnyType,
    createNumberType,
    typeNodeForFieldType,
} from '../types'

import {
    renderValue,
} from '../values'

import {
    IIdentifierMap,
} from '../../../types'

import {
    codecName,
    looseName,
    strictName,
} from '../struct/utils'

export function renderClient(node: ServiceDefinition, identifiers: IIdentifierMap): ts.ClassDeclaration {
    // private _requestId: number;
    const requestId: ts.PropertyDeclaration = createProtectedProperty(
        '_requestId',
        createNumberType(),
    )

    // public transport: TTransport;
    const transport: ts.PropertyDeclaration = createProtectedProperty(
        'transport',
        ts.createTypeReferenceNode(
            THRIFT_IDENTIFIERS.TransportConstructor,
            undefined,
        ),
    )

    // public protocol: new (trans: TTransport) => TProtocol;
    const protocol: ts.PropertyDeclaration = createProtectedProperty(
        'protocol',
        ts.createTypeReferenceNode(
            THRIFT_IDENTIFIERS.ProtocolConstructor,
            undefined,
        ),
    )

    // private send: (data: Buffer, requestId: number, context: Context) => void;
    const connection: ts.PropertyDeclaration = createProtectedProperty(
        'connection',
        createConnectionType(),
    )

    /**
     * constructor(connection: ThriftConnection) {
     *   super(connection)
     *   this._requestId = 0;
     *   this.transport = connection.Transport;
     *   this.protocol = connection.Protocol;
     *   this.connection = connection;
     * }
     */
    const ctor: ts.ConstructorDeclaration = createClassConstructor(
        [
            createFunctionParameter(
                'connection',
                createConnectionType(),
            ),
        ], // parameters
        [
            ...createSuperCall(node),
            createAssignmentStatement(
                ts.createIdentifier('this._requestId'),
                ts.createLiteral(0),
            ),
            createAssignmentStatement(
                ts.createIdentifier('this.transport'),
                ts.createIdentifier('connection.Transport'),
            ),
            createAssignmentStatement(
                ts.createIdentifier('this.protocol'),
                ts.createIdentifier('connection.Protocol'),
            ),
            createAssignmentStatement(
                ts.createIdentifier('this.connection'),
                COMMON_IDENTIFIERS.connection,
            ),
        ], // body
    )

    const incrementRequestIdMethod: ts.MethodDeclaration = ts.createMethod(
        undefined,
        [ ts.createToken(ts.SyntaxKind.ProtectedKeyword) ],
        undefined,
        'incrementRequestId',
        undefined,
        undefined,
        [],
        createNumberType(),
        ts.createBlock([
            ts.createReturn(
                ts.createBinary(
                ts.createIdentifier('this._requestId'),
                ts.SyntaxKind.PlusEqualsToken,
                ts.createLiteral(1),
                ),
            ),
        ], true),
    )

    const baseMethods: Array<ts.MethodDeclaration> = node.functions.map((func: FunctionDefinition) => {
        return createBaseMethodForDefinition(func, identifiers)
    })

    const heritage: Array<ts.HeritageClause> = (
        (node.extends !== null) ?
        [
            ts.createHeritageClause(
                ts.SyntaxKind.ExtendsKeyword,
                [
                    ts.createExpressionWithTypeArguments(
                        [
                            ts.createTypeReferenceNode(
                                COMMON_IDENTIFIERS.Context,
                                undefined,
                            ),
                        ],
                        ts.createIdentifier(`${node.extends.value}.Client`),
                    ),
                ],
            ),
        ] :
        []
    )

    // export class <node.name> { ... }
    return ts.createClassDeclaration(
        undefined, // decorators
        [ ts.createToken(ts.SyntaxKind.ExportKeyword) ], // modifiers
        'Client', // name
        [
            ts.createTypeParameterDeclaration(
                COMMON_IDENTIFIERS.Context,
                undefined,
                createAnyType(),
            ),
        ], // type parameters
        heritage, // heritage
        [
            requestId,
            transport,
            protocol,
            connection,
            ctor,
            incrementRequestIdMethod,
            ...baseMethods,
        ], // body
    )
}

function createSuperCall(node: ServiceDefinition): Array<ts.Statement> {
    if (node.extends !== null) {
        return [
            ts.createStatement(ts.createCall(
                ts.createSuper(),
                [],
                [
                    COMMON_IDENTIFIERS.connection,
                ],
            )),
        ]
    } else {
        return []
    }
}

// public {{name}}( {{#args}}{{fieldName}}: {{fieldType}}, {{/args}} ): Promise<{{typeName}}> {
//     this._requestId = this.incrementSeqId()
//     return new Promise<{{typeName}}>((resolve, reject) => {
//         this._reqs[this.requestId()] = function(error, result) {
//             if (error) {
//                 reject(error)
//             } else {
//                 resolve(result)
//             }
//         }
//         this.send_{{name}}( {{#args}}{{fieldName}}, {{/args}} )
//     })
// }
function createBaseMethodForDefinition(def: FunctionDefinition, identifiers: IIdentifierMap): ts.MethodDeclaration {
    return ts.createMethod(
        undefined, // decorators
        [ ts.createToken(ts.SyntaxKind.PublicKeyword) ], // modifiers
        undefined, // asterisk token
        def.name.value, // name
        undefined, // question token
        undefined, // type parameters
        [
            ...def.fields.map((field: FieldDefinition) => {
                return createParametersForField(field, identifiers)
            }),
            createFunctionParameter(
                COMMON_IDENTIFIERS.context,
                ContextType,
                undefined,
                true,
            ),
        ], // parameters
        ts.createTypeReferenceNode(
            'Promise',
            [ typeNodeForFieldType(def.returnType, identifiers) ],
        ), // return type
        ts.createBlock([
            createConstStatement(
                COMMON_IDENTIFIERS.writer,
                ts.createTypeReferenceNode(
                    THRIFT_IDENTIFIERS.TTransport,
                    undefined,
                ),
                ts.createNew(
                    ts.createIdentifier('this.transport'),
                    undefined,
                    [],
                ),
            ),
            createConstStatement(
                COMMON_IDENTIFIERS.output,
                ts.createTypeReferenceNode(
                    THRIFT_IDENTIFIERS.TProtocol,
                    undefined,
                ),
                ts.createNew(
                    ts.createIdentifier('this.protocol'),
                    undefined,
                    [
                        COMMON_IDENTIFIERS.writer,
                    ],
                ),
            ),
            // output.writeMessageBegin("{{name}}", Thrift.MessageType.CALL, this.requestId())
            createMethodCallStatement(
                COMMON_IDENTIFIERS.output,
                'writeMessageBegin',
                [
                    ts.createLiteral(def.name.value),
                    MESSAGE_TYPE.CALL,
                    ts.createCall(
                        ts.createIdentifier('this.incrementRequestId'),
                        undefined,
                        [],
                    ),
                ],
            ),
            // const args = new {{ServiceName}}{{nameTitleCase}}Args( { {{#args}}{{fieldName}}, {{/args}} } )
            createConstStatement(
                COMMON_IDENTIFIERS.args,
                ts.createTypeReferenceNode(
                    ts.createIdentifier(
                        looseName(createStructArgsName(def)),
                    ),
                    undefined,
                ),
                ts.createObjectLiteral(
                    def.fields.map((next: FieldDefinition) => {
                        return ts.createShorthandPropertyAssignment(next.name.value)
                    }),
                ),
            ),
            // args.write(output)
            createMethodCallStatement(
                ts.createIdentifier(codecName(createStructArgsName(def))),
                'encode',
                [ COMMON_IDENTIFIERS.args, COMMON_IDENTIFIERS.output ],
            ),
            // output.writeMessageEnd()
            createMethodCallStatement(
                COMMON_IDENTIFIERS.output,
                'writeMessageEnd',
            ),
            ts.createReturn(
                ts.createCall(
                    ts.createPropertyAccess(
                        createConnectionSend(),
                        ts.createIdentifier('then'),
                    ),
                    undefined,
                    [
                        ts.createArrowFunction(
                            undefined,
                            undefined,
                            [
                                createFunctionParameter(
                                    COMMON_IDENTIFIERS.data,
                                    ts.createTypeReferenceNode(
                                        COMMON_IDENTIFIERS.Buffer,
                                        undefined,
                                    ),
                                ),
                            ],
                            undefined,
                            undefined,
                            ts.createBlock([
                                createConstStatement(
                                    COMMON_IDENTIFIERS.reader,
                                    ts.createTypeReferenceNode(
                                        THRIFT_IDENTIFIERS.TTransport,
                                        undefined,
                                    ),
                                    ts.createCall(
                                        ts.createIdentifier('this.transport.receiver'),
                                        undefined,
                                        [
                                            COMMON_IDENTIFIERS.data,
                                        ],
                                    ),
                                ),
                                createConstStatement(
                                    COMMON_IDENTIFIERS.input,
                                    ts.createTypeReferenceNode(
                                        THRIFT_IDENTIFIERS.TProtocol,
                                        undefined,
                                    ),
                                    ts.createNew(
                                        ts.createIdentifier('this.protocol'),
                                        undefined,
                                        [
                                            COMMON_IDENTIFIERS.reader,
                                        ],
                                    ),
                                ),
                                ts.createTry(
                                    ts.createBlock([
                                        ts.createVariableStatement(
                                            undefined,
                                            ts.createVariableDeclarationList([
                                                ts.createVariableDeclaration(
                                                    ts.createObjectBindingPattern([
                                                        ts.createBindingElement(
                                                            undefined,
                                                            COMMON_IDENTIFIERS.fieldName,
                                                            COMMON_IDENTIFIERS.fieldName,
                                                        ),
                                                        ts.createBindingElement(
                                                            undefined,
                                                            COMMON_IDENTIFIERS.messageType,
                                                            COMMON_IDENTIFIERS.messageType,
                                                        ),
                                                    ]),
                                                    ts.createTypeReferenceNode(
                                                        THRIFT_IDENTIFIERS.IThriftMessage,
                                                        undefined,
                                                    ),
                                                    ts.createCall(
                                                        ts.createPropertyAccess(
                                                            COMMON_IDENTIFIERS.input,
                                                            'readMessageBegin',
                                                        ),
                                                        undefined,
                                                        [],
                                                    ),
                                                ),
                                            ], ts.NodeFlags.Const),
                                        ),
                                        ts.createIf(
                                            ts.createBinary(
                                                COMMON_IDENTIFIERS.fieldName,
                                                ts.SyntaxKind.EqualsEqualsEqualsToken,
                                                ts.createLiteral(def.name.value),
                                            ),
                                            ts.createBlock([
                                                // if (messageType === Thrift.MessageType.EXCEPTION) {
                                                //     const x = new Thrift.TApplicationException()
                                                //     x.read(proto)
                                                //     proto.readMessageEnd()
                                                //     return callback(x)
                                                // }
                                                createExceptionHandler(),

                                                // const result = new {{ServiceName}}{{nameTitleCase}}Result()
                                                ...createNewResultInstance(def),

                                                // proto.readMessageEnd()
                                                createMethodCallStatement(
                                                    COMMON_IDENTIFIERS.input,
                                                    'readMessageEnd',
                                                ),

                                                // {{#throws}}if (result.{{throwName}} != null) {
                                                //     return callback(result.{{throwName}})
                                                // }
                                                ...def.throws.map((next: FieldDefinition): ts.IfStatement => {
                                                    return ts.createIf(
                                                        createNotNullCheck(`result.${next.name.value}`),
                                                        ts.createBlock([
                                                            ts.createReturn(
                                                                rejectPromiseWith(
                                                                    ts.createIdentifier(`result.${next.name.value}`),
                                                                ),
                                                            ),
                                                        ], true),
                                                    )
                                                }),
                                                createResultHandler(def),
                                            ], true),
                                            ts.createBlock([
                                                ts.createReturn(
                                                    rejectPromiseWith(
                                                        ts.createNew(
                                                            THRIFT_IDENTIFIERS.TApplicationException,
                                                            undefined,
                                                            [
                                                                APPLICATION_EXCEPTION.WRONG_METHOD_NAME,
                                                                ts.createBinary(
                                                                    ts.createLiteral(
                                                                        'Received a response to an unknown RPC function: ',
                                                                    ),
                                                                    ts.SyntaxKind.PlusToken,
                                                                    COMMON_IDENTIFIERS.fieldName,
                                                                ),
                                                            ],
                                                        ),
                                                    ),
                                                ),
                                            ], true),
                                        ),
                                    ], true),
                                    ts.createCatchClause(
                                        ts.createVariableDeclaration(
                                            COMMON_IDENTIFIERS.err,
                                        ),
                                        ts.createBlock([
                                            ts.createReturn(
                                                rejectPromiseWith(
                                                    COMMON_IDENTIFIERS.err,
                                                ),
                                            ),
                                        ], true),
                                    ),
                                    undefined,
                                ),
                            ], true),
                        ),
                    ],
                ),
            ),
        ], true), // body
    )
}

function createConnectionSend(): ts.CallExpression {
    return ts.createCall(
        ts.createIdentifier('this.connection.send'),
        undefined,
        [
            ts.createCall(
                ts.createPropertyAccess(
                    COMMON_IDENTIFIERS.writer,
                    'flush',
                ),
                undefined,
                [],
            ),
            COMMON_IDENTIFIERS.context,
        ],
    )
}

// const result: GetUserResult = GetUserResultCodec.decode(input);
function createNewResultInstance(def: FunctionDefinition): Array<ts.Statement> {
    return [
        createConstStatement(
            COMMON_IDENTIFIERS.result,
            ts.createTypeReferenceNode(
                ts.createIdentifier(
                    strictName(createStructResultName(def)),
                ),
                undefined,
            ),
            ts.createCall(
                ts.createPropertyAccess(
                    ts.createIdentifier(codecName(createStructResultName(def))),
                    ts.createIdentifier('decode'),
                ),
                undefined,
                [
                    COMMON_IDENTIFIERS.input,
                ],
            ),
        ),
    ]
}

function createExceptionHandler(): ts.Statement {
    return ts.createIf(
        ts.createBinary(
            COMMON_IDENTIFIERS.messageType,
            ts.SyntaxKind.EqualsEqualsEqualsToken,
            MESSAGE_TYPE.EXCEPTION,
        ),
        ts.createBlock([
            createConstStatement(
                COMMON_IDENTIFIERS.err,
                ts.createTypeReferenceNode(
                    THRIFT_IDENTIFIERS.TApplicationException,
                    undefined,
                ),
                ts.createCall(
                    ts.createPropertyAccess(
                        THRIFT_IDENTIFIERS.TApplicationExceptionCodec,
                        ts.createIdentifier('decode'),
                    ),
                    undefined,
                    [
                        COMMON_IDENTIFIERS.input,
                    ],
                ),
            ),
            createMethodCallStatement(
                COMMON_IDENTIFIERS.input,
                'readMessageEnd',
            ),
            ts.createReturn(
                rejectPromiseWith(COMMON_IDENTIFIERS.err),
            ),
        ], true),
    )
}

function resolvePromiseWith(result: ts.Expression): ts.CallExpression {
    return ts.createCall(
        ts.createPropertyAccess(
            COMMON_IDENTIFIERS.Promise,
            'resolve',
        ),
        undefined,
        [ result ],
    )
}

function rejectPromiseWith(result: ts.Expression): ts.CallExpression {
    return ts.createCall(
        ts.createPropertyAccess(
            COMMON_IDENTIFIERS.Promise,
            'reject',
        ),
        undefined,
        [ result ],
    )
}

function createResultHandler(def: FunctionDefinition): ts.Statement {
    if (def.returnType.type === SyntaxType.VoidKeyword) {
        return ts.createReturn(
            resolvePromiseWith(ts.createIdentifier('result.success')),
        )
    } else {
        // {{^isVoid}}
        // if (result.success != null) {
        //     return callback(undefined, result.success)
        // }
        // {{/isVoid}}
        return ts.createIf(
            createNotNullCheck(
                ts.createIdentifier('result.success'),
            ),
            ts.createBlock([
                ts.createReturn(
                    resolvePromiseWith(ts.createIdentifier('result.success')),
                ),
            ], true),
            ts.createBlock([
                // return callback(new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, "{{name}} failed: unknown result"))
                ts.createReturn(
                    rejectPromiseWith(
                        createApplicationException(
                            'UNKNOWN',
                            `${def.name.value} failed: unknown result`,
                        ),
                    ),
                ),
            ], true),
        )
    }
}

function createParametersForField(field: FieldDefinition, identifiers: IIdentifierMap): ts.ParameterDeclaration {
    const defaultValue = (field.defaultValue !== null) ?
        renderValue(field.fieldType, field.defaultValue) :
        undefined

    return createFunctionParameter(
        field.name.value,
        typeNodeForFieldType(field.fieldType, identifiers, true),
        defaultValue,
        (field.requiredness === 'optional'),
    )
}
