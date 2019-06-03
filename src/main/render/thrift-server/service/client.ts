import * as ts from 'typescript'

import {
    FieldDefinition,
    FunctionDefinition,
    Identifier,
    ServiceDefinition,
    SyntaxType,
} from '@creditkarma/thrift-parser'

import { ContextType, createConnectionType } from './types'

import { createStructArgsName, createStructResultName } from './utils'

import {
    APPLICATION_EXCEPTION,
    COMMON_IDENTIFIERS,
    MESSAGE_TYPE,
    THRIFT_IDENTIFIERS,
} from '../identifiers'

import {
    createApplicationException,
    createConstStatement,
    createFunctionParameter,
    createMethodCallStatement,
    createNotNullCheck,
} from '../utils'

import { typeNodeForFieldType } from '../types'

import { renderValue } from '../initializers'

import { IRenderState } from '../../../types'

import {
    renderServiceMetadataProperty,
    renderServiceMetadataStaticProperty,
} from './metadata'

import { Resolver } from '../../../resolver'
import { createNumberType } from '../../shared/types'
import { createBufferType, createPromiseType } from '../../shared/types'
import {
    createAssignmentStatement,
    createClassConstructor,
    createProtectedProperty,
} from '../../shared/utils'
import { looseName, strictName, toolkitName } from '../struct/utils'

function implementsThirftClient(): ts.HeritageClause {
    return ts.createHeritageClause(ts.SyntaxKind.ImplementsKeyword, [
        ts.createExpressionWithTypeArguments(
            [],
            THRIFT_IDENTIFIERS.IThriftClient,
        ),
    ])
}

function extendsService(
    service: Identifier,
    state: IRenderState,
): ts.HeritageClause {
    return ts.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
        ts.createExpressionWithTypeArguments(
            [ts.createTypeReferenceNode(COMMON_IDENTIFIERS.Context, undefined)],
            ts.createPropertyAccess(
                ts.createIdentifier(
                    `${
                        Resolver.resolveIdentifierName(service.value, {
                            currentNamespace: state.currentNamespace,
                            currentDefinitions: state.currentDefinitions,
                            namespaceMap: state.project.namespaces,
                        }).fullName
                    }`,
                ),
                COMMON_IDENTIFIERS.Client,
            ),
        ),
    ])
}

export function renderClient(
    service: ServiceDefinition,
    state: IRenderState,
): ts.ClassDeclaration {
    const fields: Array<ts.PropertyDeclaration> = [
        renderServiceMetadataStaticProperty(),
        renderServiceMetadataProperty(),
    ]

    if (service.extends === null) {
        fields.push(createProtectedProperty('_requestId', createNumberType()))

        fields.push(
            createProtectedProperty(
                'transport',
                ts.createTypeReferenceNode(
                    THRIFT_IDENTIFIERS.ITransportConstructor,
                    undefined,
                ),
            ),
        )

        fields.push(
            createProtectedProperty(
                'protocol',
                ts.createTypeReferenceNode(
                    THRIFT_IDENTIFIERS.IProtocolConstructor,
                    undefined,
                ),
            ),
        )

        fields.push(
            createProtectedProperty(
                'connection',
                ts.createTypeReferenceNode(
                    THRIFT_IDENTIFIERS.IThriftConnection,
                    [
                        ts.createTypeReferenceNode(
                            COMMON_IDENTIFIERS.Context,
                            undefined,
                        ),
                    ],
                ),
            ),
        )
    }

    const incrementRequestIdMethod: ts.MethodDeclaration = ts.createMethod(
        undefined,
        [ts.createToken(ts.SyntaxKind.ProtectedKeyword)],
        undefined,
        'incrementRequestId',
        undefined,
        undefined,
        [],
        createNumberType(),
        ts.createBlock(
            [
                ts.createReturn(
                    ts.createBinary(
                        ts.createIdentifier(`this._requestId`),
                        ts.SyntaxKind.PlusEqualsToken,
                        ts.createLiteral(1),
                    ),
                ),
            ],
            true,
        ),
    )

    const baseMethods: Array<ts.MethodDeclaration> = service.functions.map(
        (func: FunctionDefinition) => {
            return createBaseMethodForDefinition(func, state)
        },
    )

    const heritage: Array<ts.HeritageClause> =
        service.extends !== null
            ? [extendsService(service.extends, state)]
            : [implementsThirftClient()]

    // export class <node.name> { ... }
    return ts.createClassDeclaration(
        undefined, // decorators
        [ts.createToken(ts.SyntaxKind.ExportKeyword)], // modifiers
        COMMON_IDENTIFIERS.Client, // name
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
            ...fields,
            createCtor(service),
            incrementRequestIdMethod,
            ...baseMethods,
        ], // body
    )
}

function createCtor(service: ServiceDefinition): ts.ConstructorDeclaration {
    if (service.extends !== null) {
        return createClassConstructor(
            [createFunctionParameter('connection', createConnectionType())],
            [createSuperCall()],
        )
    } else {
        return createClassConstructor(
            [createFunctionParameter('connection', createConnectionType())],
            [
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
                    ts.createIdentifier('connection'),
                ),
            ],
        )
    }
}

function createSuperCall(): ts.Statement {
    return ts.createStatement(
        ts.createCall(ts.createSuper(), [], [COMMON_IDENTIFIERS.connection]),
    )
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
function createBaseMethodForDefinition(
    def: FunctionDefinition,
    state: IRenderState,
): ts.MethodDeclaration {
    return ts.createMethod(
        undefined, // decorators
        [ts.createToken(ts.SyntaxKind.PublicKeyword)], // modifiers
        undefined, // asterisk token
        def.name.value, // name
        undefined, // question token
        undefined, // type parameters
        [
            ...def.fields.map((field: FieldDefinition) => {
                return createParametersForField(field, state)
            }),
            createFunctionParameter(
                COMMON_IDENTIFIERS.context,
                ContextType,
                undefined,
                true,
            ),
        ], // parameters
        createPromiseType(typeNodeForFieldType(def.returnType, state)), // return type
        ts.createBlock(
            [
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
                        [COMMON_IDENTIFIERS.writer],
                    ),
                ),
                // output.writeMessageBegin("{{name}}", Thrift.MessageType.CALL, this.requestId())
                createMethodCallStatement(
                    COMMON_IDENTIFIERS.output,
                    COMMON_IDENTIFIERS.writeMessageBegin,
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
                            looseName(
                                createStructArgsName(def),
                                def.type,
                                state,
                            ),
                        ),
                        undefined,
                    ),
                    ts.createObjectLiteral(
                        def.fields.map((next: FieldDefinition) => {
                            return ts.createShorthandPropertyAssignment(
                                next.name.value,
                            )
                        }),
                    ),
                ),
                // args.write(output)
                createMethodCallStatement(
                    ts.createIdentifier(
                        toolkitName(createStructArgsName(def), state),
                    ),
                    'encode',
                    [COMMON_IDENTIFIERS.args, COMMON_IDENTIFIERS.output],
                ),
                // output.writeMessageEnd()
                createMethodCallStatement(
                    COMMON_IDENTIFIERS.output,
                    COMMON_IDENTIFIERS.writeMessageEnd,
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
                                        createBufferType(),
                                    ),
                                ],
                                undefined,
                                undefined,
                                ts.createBlock(
                                    [
                                        createConstStatement(
                                            COMMON_IDENTIFIERS.reader,
                                            ts.createTypeReferenceNode(
                                                THRIFT_IDENTIFIERS.TTransport,
                                                undefined,
                                            ),
                                            ts.createCall(
                                                ts.createIdentifier(
                                                    'this.transport.receiver',
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
                                                ts.createIdentifier(
                                                    'this.protocol',
                                                ),
                                                undefined,
                                                [COMMON_IDENTIFIERS.reader],
                                            ),
                                        ),
                                        ts.createTry(
                                            ts.createBlock(
                                                [
                                                    ts.createVariableStatement(
                                                        undefined,
                                                        ts.createVariableDeclarationList(
                                                            [
                                                                ts.createVariableDeclaration(
                                                                    ts.createObjectBindingPattern(
                                                                        [
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
                                                                        ],
                                                                    ),
                                                                    ts.createTypeReferenceNode(
                                                                        THRIFT_IDENTIFIERS.IThriftMessage,
                                                                        undefined,
                                                                    ),
                                                                    ts.createCall(
                                                                        ts.createPropertyAccess(
                                                                            COMMON_IDENTIFIERS.input,
                                                                            COMMON_IDENTIFIERS.readMessageBegin,
                                                                        ),
                                                                        undefined,
                                                                        [],
                                                                    ),
                                                                ),
                                                            ],
                                                            ts.NodeFlags.Const,
                                                        ),
                                                    ),
                                                    ts.createIf(
                                                        ts.createBinary(
                                                            COMMON_IDENTIFIERS.fieldName,
                                                            ts.SyntaxKind
                                                                .EqualsEqualsEqualsToken,
                                                            ts.createLiteral(
                                                                def.name.value,
                                                            ),
                                                        ),
                                                        ts.createBlock(
                                                            [
                                                                // if (messageType === Thrift.MessageType.EXCEPTION) {
                                                                //     const x = new Thrift.TApplicationException()
                                                                //     x.read(proto)
                                                                //     proto.readMessageEnd()
                                                                //     return callback(x)
                                                                // }
                                                                ts.createIf(
                                                                    ts.createBinary(
                                                                        COMMON_IDENTIFIERS.messageType,
                                                                        ts
                                                                            .SyntaxKind
                                                                            .EqualsEqualsEqualsToken,
                                                                        MESSAGE_TYPE.EXCEPTION,
                                                                    ),
                                                                    ts.createBlock(
                                                                        [
                                                                            createConstStatement(
                                                                                COMMON_IDENTIFIERS.err,
                                                                                ts.createTypeReferenceNode(
                                                                                    THRIFT_IDENTIFIERS.TApplicationException,
                                                                                    undefined,
                                                                                ),
                                                                                ts.createCall(
                                                                                    ts.createPropertyAccess(
                                                                                        THRIFT_IDENTIFIERS.TApplicationExceptionCodec,
                                                                                        COMMON_IDENTIFIERS.decode,
                                                                                    ),
                                                                                    undefined,
                                                                                    [
                                                                                        COMMON_IDENTIFIERS.input,
                                                                                    ],
                                                                                ),
                                                                            ),
                                                                            createMethodCallStatement(
                                                                                COMMON_IDENTIFIERS.input,
                                                                                COMMON_IDENTIFIERS.readMessageEnd,
                                                                            ),
                                                                            ts.createReturn(
                                                                                rejectPromiseWith(
                                                                                    COMMON_IDENTIFIERS.err,
                                                                                ),
                                                                            ),
                                                                        ],
                                                                        true,
                                                                    ),
                                                                    ts.createBlock(
                                                                        [
                                                                            // const result = new {{ServiceName}}{{nameTitleCase}}Result()
                                                                            ...createNewResultInstance(
                                                                                def,
                                                                                state,
                                                                            ),

                                                                            // proto.readMessageEnd()
                                                                            createMethodCallStatement(
                                                                                COMMON_IDENTIFIERS.input,
                                                                                COMMON_IDENTIFIERS.readMessageEnd,
                                                                            ),

                                                                            createResultHandler(
                                                                                def,
                                                                            ),
                                                                        ],
                                                                        true,
                                                                    ),
                                                                ),
                                                            ],
                                                            true,
                                                        ),
                                                        ts.createBlock(
                                                            [
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
                                                                                    ts
                                                                                        .SyntaxKind
                                                                                        .PlusToken,
                                                                                    COMMON_IDENTIFIERS.fieldName,
                                                                                ),
                                                                            ],
                                                                        ),
                                                                    ),
                                                                ),
                                                            ],
                                                            true,
                                                        ),
                                                    ),
                                                ],
                                                true,
                                            ),
                                            ts.createCatchClause(
                                                ts.createVariableDeclaration(
                                                    COMMON_IDENTIFIERS.err,
                                                ),
                                                ts.createBlock(
                                                    [
                                                        ts.createReturn(
                                                            rejectPromiseWith(
                                                                COMMON_IDENTIFIERS.err,
                                                            ),
                                                        ),
                                                    ],
                                                    true,
                                                ),
                                            ),
                                            undefined,
                                        ),
                                    ],
                                    true,
                                ),
                            ),
                        ],
                    ),
                ),
            ],
            true,
        ), // body
    )
}

function createConnectionSend(): ts.CallExpression {
    return ts.createCall(
        ts.createIdentifier('this.connection.send'),
        undefined,
        [
            ts.createCall(
                ts.createPropertyAccess(COMMON_IDENTIFIERS.writer, 'flush'),
                undefined,
                [],
            ),
            COMMON_IDENTIFIERS.context,
        ],
    )
}

// const result: GetUserResult = GetUserResultCodec.decode(input);
function createNewResultInstance(
    def: FunctionDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    return [
        createConstStatement(
            COMMON_IDENTIFIERS.result,
            ts.createTypeReferenceNode(
                ts.createIdentifier(
                    strictName(createStructResultName(def), def.type, state),
                ),
                undefined,
            ),
            ts.createCall(
                ts.createPropertyAccess(
                    ts.createIdentifier(
                        toolkitName(createStructResultName(def), state),
                    ),
                    COMMON_IDENTIFIERS.decode,
                ),
                undefined,
                [COMMON_IDENTIFIERS.input],
            ),
        ),
    ]
}

function resolvePromiseWith(result: ts.Expression): ts.CallExpression {
    return ts.createCall(
        ts.createPropertyAccess(
            COMMON_IDENTIFIERS.Promise,
            COMMON_IDENTIFIERS.resolve,
        ),
        undefined,
        [result],
    )
}

function rejectPromiseWith(result: ts.Expression): ts.CallExpression {
    return ts.createCall(
        ts.createPropertyAccess(
            COMMON_IDENTIFIERS.Promise,
            COMMON_IDENTIFIERS.reject,
        ),
        undefined,
        [result],
    )
}

function createResultReturn(def: FunctionDefinition): ts.Statement {
    if (def.returnType.type === SyntaxType.VoidKeyword) {
        return ts.createReturn(
            resolvePromiseWith(
                ts.createPropertyAccess(
                    COMMON_IDENTIFIERS.result,
                    COMMON_IDENTIFIERS.success,
                ),
            ),
        )
    } else {
        // {{^isVoid}}
        // if (result.success != null) {
        //     return callback(undefined, result.success)
        // }
        // {{/isVoid}}
        return ts.createIf(
            createNotNullCheck(
                ts.createPropertyAccess(
                    COMMON_IDENTIFIERS.result,
                    COMMON_IDENTIFIERS.success,
                ),
            ),
            ts.createBlock(
                [
                    ts.createReturn(
                        resolvePromiseWith(
                            ts.createPropertyAccess(
                                COMMON_IDENTIFIERS.result,
                                COMMON_IDENTIFIERS.success,
                            ),
                        ),
                    ),
                ],
                true,
            ),
            ts.createBlock(
                [
                    // return callback(new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, "{{name}} failed: unknown result"))
                    ts.createReturn(
                        rejectPromiseWith(
                            createApplicationException(
                                'UNKNOWN',
                                `${def.name.value} failed: unknown result`,
                            ),
                        ),
                    ),
                ],
                true,
            ),
        )
    }
}

function createElseForExceptions(
    throwDef: FieldDefinition,
    remaining: Array<FieldDefinition>,
    funcDef: FunctionDefinition,
): ts.Statement {
    if (remaining.length > 0) {
        const [next, ...tail] = remaining
        return ts.createIf(
            createNotNullCheck(`result.${next.name.value}`),
            createThenForException(next),
            createElseForExceptions(next, tail, funcDef),
        )
    } else {
        return createResultReturn(funcDef)
    }
}

function createThenForException(throwDef: FieldDefinition): ts.Statement {
    return ts.createBlock(
        [
            ts.createReturn(
                rejectPromiseWith(
                    ts.createIdentifier(`result.${throwDef.name.value}`),
                ),
            ),
        ],
        true,
    )
}

function createIfForExceptions(
    exps: Array<FieldDefinition>,
    funcDef: FunctionDefinition,
): ts.IfStatement {
    const [throwDef, ...tail] = exps

    return ts.createIf(
        createNotNullCheck(`result.${throwDef.name.value}`),
        createThenForException(throwDef),
        createElseForExceptions(throwDef, tail, funcDef),
    )
}

function createResultHandler(def: FunctionDefinition): ts.Statement {
    if (def.throws.length > 0) {
        return createIfForExceptions(def.throws, def)
    } else {
        return createResultReturn(def)
    }
}

function createParametersForField(
    field: FieldDefinition,
    state: IRenderState,
): ts.ParameterDeclaration {
    const defaultValue =
        field.defaultValue !== null
            ? renderValue(field.fieldType, field.defaultValue, state)
            : undefined

    return createFunctionParameter(
        field.name.value,
        typeNodeForFieldType(field.fieldType, state, true),
        defaultValue,
        field.requiredness === 'optional',
    )
}
