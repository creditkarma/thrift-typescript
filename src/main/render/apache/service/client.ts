import * as ts from 'typescript'

import {
    FieldDefinition,
    FunctionDefinition,
    ServiceDefinition,
    SyntaxType,
} from '@creditkarma/thrift-parser'

import { createProtocolType, createReqType } from './types'

import { createStructArgsName, createStructResultName } from './utils'

import { renderValue } from '../values'

import {
    COMMON_IDENTIFIERS,
    MESSAGE_TYPE,
    THRIFT_IDENTIFIERS,
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
    createNotNullCheck,
    createPromise,
    createPublicProperty,
} from '../utils'

import {
    createAnyType,
    createNumberType,
    createVoidType,
    typeNodeForFieldType,
} from '../types'

import { Resolver } from '../../../resolver'
import { IRenderState } from '../../../types'
import { createPromiseType, createUndefinedType } from '../../shared/types'

export function renderClient(
    node: ServiceDefinition,
    state: IRenderState,
): ts.ClassDeclaration {
    // public _seqid: number;
    const seqid: ts.PropertyDeclaration = createPublicProperty(
        '_seqid',
        createNumberType(),
    )

    // public _reqs: { [key: string]: (e?: Error|object, r? any) => void }
    const reqs: ts.PropertyDeclaration = createPublicProperty(
        '_reqs',
        createReqType(),
    )

    // public output: TTransport;
    const output: ts.PropertyDeclaration = createPublicProperty(
        'output',
        ts.createTypeReferenceNode(THRIFT_IDENTIFIERS.TTransport, undefined),
    )

    // public protocol: new (trans: TTransport) => TProtocol;
    const protocol: ts.PropertyDeclaration = createPublicProperty(
        'protocol',
        createProtocolType(),
    )

    /**
     * constructor(output: TTransport, protocol: { new (trans: TTransport): TProtocol }) {
     *   this._seqid = 0;
     *   this._reqs = {};
     * }
     */
    const ctor: ts.ConstructorDeclaration = createClassConstructor(
        [
            createFunctionParameter(
                'output',
                ts.createTypeReferenceNode(
                    THRIFT_IDENTIFIERS.TTransport,
                    undefined,
                ),
            ),
            createFunctionParameter('protocol', createProtocolType()),
        ], // parameters
        [
            ...createSuperCall(node),
            createAssignmentStatement(
                ts.createIdentifier('this._seqid'),
                ts.createLiteral(0),
            ),
            createAssignmentStatement(
                ts.createIdentifier('this._reqs'),
                ts.createObjectLiteral(),
            ),
            createAssignmentStatement(
                ts.createIdentifier('this.output'),
                COMMON_IDENTIFIERS.output,
            ),
            createAssignmentStatement(
                ts.createIdentifier('this.protocol'),
                ts.createIdentifier('protocol'),
            ),
        ], // body
    )

    const incrementSeqIdMethod: ts.MethodDeclaration = ts.createMethod(
        undefined,
        [ts.createToken(ts.SyntaxKind.PublicKeyword)],
        undefined,
        'incrementSeqId',
        undefined,
        undefined,
        [],
        createNumberType(),
        ts.createBlock(
            [
                ts.createReturn(
                    ts.createBinary(
                        ts.createIdentifier('this._seqid'),
                        ts.SyntaxKind.PlusEqualsToken,
                        ts.createLiteral(1),
                    ),
                ),
            ],
            true,
        ),
    )

    const baseMethods: Array<ts.MethodDeclaration> = node.functions.map(
        (next: FunctionDefinition) => {
            return createBaseMethodForDefinition(next, state)
        },
    )
    const sendMethods: Array<ts.MethodDeclaration> = node.functions.map(
        (next) => {
            return createSendMethodForDefinition(next, state)
        },
    )
    const recvMethods: Array<ts.MethodDeclaration> = node.functions.map(
        (next) => {
            return createRecvMethodForDefinition(node, next)
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
                              COMMON_IDENTIFIERS.Client,
                          ),
                      ),
                  ]),
              ]
            : []

    // export class <node.name> { ... }
    return ts.createClassDeclaration(
        undefined, // decorators
        [ts.createToken(ts.SyntaxKind.ExportKeyword)], // modifiers
        COMMON_IDENTIFIERS.Client, // name
        [], // type parameters
        heritage, // heritage
        [
            seqid,
            reqs,
            output,
            protocol,
            ctor,
            incrementSeqIdMethod,
            ...baseMethods,
            ...sendMethods,
            ...recvMethods,
        ], // body
    )
}

function createSuperCall(node: ServiceDefinition): Array<ts.Statement> {
    if (node.extends !== null) {
        return [
            ts.createStatement(
                ts.createCall(
                    ts.createSuper(),
                    [],
                    [
                        ts.createIdentifier('output'),
                        ts.createIdentifier('protocol'),
                    ],
                ),
            ),
        ]
    } else {
        return []
    }
}

// public {{name}}( {{#args}}{{fieldName}}: {{fieldType}}, {{/args}} ): Promise<{{typeName}}> {
//     this._seqid = this.incrementSeqId()
//     return new Promise<{{typeName}}>((resolve, reject) => {
//         this._reqs[this.seqid()] = function(error, result) {
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
        def.fields.map((field: FieldDefinition) => {
            return createParametersForField(field, state)
        }), // parameters
        createPromiseType(typeNodeForFieldType(def.returnType, state)), // return type
        ts.createBlock(
            [
                // this._seqid = this.incrementSeqId()
                createConstStatement(
                    COMMON_IDENTIFIERS.requestId,
                    createNumberType(),
                    ts.createCall(
                        ts.createIdentifier('this.incrementSeqId'),
                        undefined,
                        [],
                    ),
                ),
                // return new Promise<type>((resolve, reject) => { ... })
                ts.createReturn(
                    createPromise(
                        typeNodeForFieldType(def.returnType, state),
                        createVoidType(),
                        [
                            // this._reqs[this.seqid()] = (error, result) =>
                            createAssignmentStatement(
                                ts.createElementAccess(
                                    ts.createIdentifier('this._reqs'),
                                    COMMON_IDENTIFIERS.requestId,
                                ),
                                ts.createArrowFunction(
                                    undefined,
                                    undefined,
                                    [
                                        createFunctionParameter(
                                            COMMON_IDENTIFIERS.error,
                                            undefined,
                                            undefined,
                                        ),
                                        createFunctionParameter(
                                            COMMON_IDENTIFIERS.result,
                                            undefined,
                                            undefined,
                                        ),
                                    ],
                                    undefined,
                                    undefined,
                                    ts.createBlock(
                                        [
                                            // delete this._reqs[_seqid]
                                            ts.createStatement(
                                                ts.createDelete(
                                                    ts.createElementAccess(
                                                        ts.createIdentifier(
                                                            'this._reqs',
                                                        ),
                                                        COMMON_IDENTIFIERS.requestId,
                                                    ),
                                                ),
                                            ),
                                            ts.createIf(
                                                // if (error != null)
                                                createNotNullCheck(
                                                    COMMON_IDENTIFIERS.error,
                                                ),
                                                // reject(error)
                                                ts.createBlock(
                                                    [
                                                        createCallStatement(
                                                            COMMON_IDENTIFIERS.reject,
                                                            [
                                                                COMMON_IDENTIFIERS.error,
                                                            ],
                                                        ),
                                                    ],
                                                    true,
                                                ),
                                                // resolve(result)
                                                ts.createBlock(
                                                    [
                                                        createCallStatement(
                                                            COMMON_IDENTIFIERS.resolve,
                                                            [
                                                                COMMON_IDENTIFIERS.result,
                                                            ],
                                                        ),
                                                    ],
                                                    true,
                                                ),
                                            ),
                                        ],
                                        true,
                                    ),
                                ),
                            ),
                            // this.send_{{name}}( {{#args}}{{fieldName}}, {{/args}} )
                            createMethodCallStatement(
                                COMMON_IDENTIFIERS.this,
                                `send_${def.name.value}`,
                                [
                                    ...def.fields.map(
                                        (next: FieldDefinition) => {
                                            return ts.createIdentifier(
                                                next.name.value,
                                            )
                                        },
                                    ),
                                    COMMON_IDENTIFIERS.requestId,
                                ],
                            ),
                        ],
                    ),
                ),
            ],
            true,
        ), // body
    )
}

// public send_{{name}}({{#args}}{{fieldName}}: {{fieldType}}, {{/args}}): void {
//     const output = new (this.protocol as any)(this.output)
//     output.writeMessageBegin("{{name}}", Thrift.MessageType.CALL, this.seqid())
//     const args = new {{ServiceName}}{{nameTitleCase}}Args()
//     args.write(output)
//     output.writeMessageEnd()
//     return this.output.flush()
// }
function createSendMethodForDefinition(
    def: FunctionDefinition,
    state: IRenderState,
): ts.MethodDeclaration {
    return ts.createMethod(
        undefined, // decorators
        [ts.createToken(ts.SyntaxKind.PublicKeyword)], // modifiers
        undefined, // asterisk token
        `send_${def.name.value}`, // name
        undefined, // question token
        undefined, // type params
        [
            ...def.fields.map((field: FieldDefinition) => {
                const returnType: ts.TypeNode =
                    field.requiredness === 'optional'
                        ? ts.createUnionTypeNode([
                              typeNodeForFieldType(field.fieldType, state),
                              createUndefinedType(),
                          ])
                        : typeNodeForFieldType(field.fieldType, state)

                return createFunctionParameter(
                    ts.createIdentifier(field.name.value),
                    returnType,
                )
            }),
            createFunctionParameter(
                COMMON_IDENTIFIERS.requestId,
                createNumberType(),
            ),
        ], // parameters
        createVoidType(), // return type
        ts.createBlock(
            [
                // const output = new (this.protocol as any)(this.output)
                createConstStatement(
                    COMMON_IDENTIFIERS.output,
                    ts.createTypeReferenceNode(
                        THRIFT_IDENTIFIERS.TProtocol,
                        undefined,
                    ),
                    ts.createNew(
                        ts.createIdentifier('this.protocol'),
                        undefined,
                        [ts.createIdentifier('this.output')],
                    ),
                ),
                // output.writeMessageBegin("{{name}}", Thrift.MessageType.CALL, this.seqid())
                createMethodCallStatement(
                    COMMON_IDENTIFIERS.output,
                    'writeMessageBegin',
                    [
                        ts.createLiteral(def.name.value),
                        MESSAGE_TYPE.CALL,
                        COMMON_IDENTIFIERS.requestId,
                    ],
                ),
                // MortgageServiceGetMortgageOffersArgs
                // const args = new {{ServiceName}}{{nameTitleCase}}Args( { {{#args}}{{fieldName}}, {{/args}} } )
                createConstStatement(
                    COMMON_IDENTIFIERS.args,
                    ts.createTypeReferenceNode(
                        ts.createIdentifier(createStructArgsName(def)),
                        undefined,
                    ),
                    ts.createNew(
                        ts.createIdentifier(createStructArgsName(def)),
                        undefined,
                        createArgumentsObject(def),
                    ),
                ),
                // args.write(output)
                createMethodCallStatement(
                    COMMON_IDENTIFIERS.args,
                    COMMON_IDENTIFIERS.write,
                    [COMMON_IDENTIFIERS.output],
                ),
                // output.writeMessageEnd()
                createMethodCallStatement(
                    COMMON_IDENTIFIERS.output,
                    'writeMessageEnd',
                ),
                // return this.output.flush()
                ts.createStatement(
                    createMethodCall(
                        ts.createIdentifier('this.output'),
                        COMMON_IDENTIFIERS.flush,
                        [],
                    ),
                ),
                ts.createReturn(),
            ],
            true,
        ), // body
    )
}

function createArgumentsObject(def: FunctionDefinition): Array<ts.Expression> {
    if (def.fields.length > 0) {
        return [
            ts.createObjectLiteral(
                def.fields.map((next: FieldDefinition) => {
                    return ts.createShorthandPropertyAssignment(next.name.value)
                }),
            ),
        ]
    } else {
        return []
    }
}

function createRecvMethodForDefinition(
    service: ServiceDefinition,
    def: FunctionDefinition,
): ts.MethodDeclaration {
    return ts.createMethod(
        undefined, // decorators
        [ts.createToken(ts.SyntaxKind.PublicKeyword)], // modifiers
        undefined, // asterisk token
        `recv_${def.name.value}`, // method name
        undefined, // question token
        undefined, // type parameters
        [
            createFunctionParameter(
                COMMON_IDENTIFIERS.input,
                ts.createTypeReferenceNode(
                    THRIFT_IDENTIFIERS.TProtocol,
                    undefined,
                ),
            ),
            createFunctionParameter(
                ts.createIdentifier('mtype'),
                ts.createTypeReferenceNode(
                    THRIFT_IDENTIFIERS.MessageType,
                    undefined,
                ),
            ),
            createFunctionParameter(
                COMMON_IDENTIFIERS.requestId,
                createNumberType(),
            ),
        ], // parameters
        createVoidType(), // return type
        ts.createBlock(
            [
                // const noop = () => null
                createConstStatement(
                    ts.createIdentifier('noop'),
                    undefined,
                    ts.createArrowFunction(
                        undefined,
                        undefined,
                        [],
                        createAnyType(),
                        undefined,
                        ts.createIdentifier('null'),
                    ),
                ),

                // const callback = this._reqs[rseqid] || noop
                createConstStatement(
                    COMMON_IDENTIFIERS.callback,
                    undefined,
                    ts.createBinary(
                        ts.createElementAccess(
                            ts.createIdentifier('this._reqs'),
                            COMMON_IDENTIFIERS.requestId,
                        ),
                        ts.SyntaxKind.BarBarToken,
                        ts.createIdentifier('noop'),
                    ),
                ),

                ts.createIf(
                    ts.createBinary(
                        ts.createIdentifier('mtype'),
                        ts.SyntaxKind.EqualsEqualsEqualsToken,
                        MESSAGE_TYPE.EXCEPTION,
                    ),
                    ts.createBlock(
                        [
                            createConstStatement(
                                ts.createIdentifier('x'),
                                ts.createTypeReferenceNode(
                                    THRIFT_IDENTIFIERS.TApplicationException,
                                    undefined,
                                ),
                                ts.createNew(
                                    THRIFT_IDENTIFIERS.TApplicationException,
                                    undefined,
                                    [],
                                ),
                            ),
                            createMethodCallStatement(
                                ts.createIdentifier('x'),
                                'read',
                                [COMMON_IDENTIFIERS.input],
                            ),
                            createMethodCallStatement(
                                COMMON_IDENTIFIERS.input,
                                'readMessageEnd',
                            ),
                            ts.createReturn(
                                ts.createCall(
                                    COMMON_IDENTIFIERS.callback,
                                    undefined,
                                    [ts.createIdentifier('x')],
                                ),
                            ),
                        ],
                        true,
                    ),
                    ts.createBlock(
                        [
                            // const result = new {{ServiceName}}{{nameTitleCase}}Result()
                            ...createNewResultInstance(def),

                            // input.readMessageEnd()
                            createMethodCallStatement(
                                COMMON_IDENTIFIERS.input,
                                'readMessageEnd',
                            ),

                            createResultHandler(def),
                        ],
                        true,
                    ),
                ),
            ],
            true,
        ),
    )
}

function createNewResultInstance(def: FunctionDefinition): Array<ts.Statement> {
    if (def.returnType.type === SyntaxType.VoidKeyword && !def.throws.length) {
        return []
    } else {
        return [
            createConstStatement(
                COMMON_IDENTIFIERS.result,
                ts.createTypeReferenceNode(
                    ts.createIdentifier(createStructResultName(def)),
                    undefined,
                ),
                ts.createCall(
                    ts.createPropertyAccess(
                        ts.createIdentifier(createStructResultName(def)),
                        COMMON_IDENTIFIERS.read,
                    ),
                    undefined,
                    [COMMON_IDENTIFIERS.input],
                ),
            ),
        ]
    }
}

function undefinedReturn(): ts.Statement {
    return ts.createReturn(
        ts.createCall(COMMON_IDENTIFIERS.callback, undefined, [
            COMMON_IDENTIFIERS.undefined,
        ]),
    )
}

function createResultReturn(def: FunctionDefinition): ts.Statement {
    if (def.returnType.type === SyntaxType.VoidKeyword) {
        return undefinedReturn()
    } else {
        return ts.createIf(
            createNotNullCheck(ts.createIdentifier('result.success')),
            ts.createBlock(
                [
                    ts.createReturn(
                        ts.createCall(COMMON_IDENTIFIERS.callback, undefined, [
                            COMMON_IDENTIFIERS.undefined,
                            ts.createIdentifier('result.success'),
                        ]),
                    ),
                ],
                true,
            ),
            ts.createBlock(
                [
                    // return callback(new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, "{{name}} failed: unknown result"))
                    ts.createReturn(
                        ts.createCall(COMMON_IDENTIFIERS.callback, undefined, [
                            createApplicationException(
                                'UNKNOWN',
                                `${def.name.value} failed: unknown result`,
                            ),
                        ]),
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
        return ts.createBlock([createResultReturn(funcDef)], true)
    }
}

function createThenForException(throwDef: FieldDefinition): ts.Statement {
    return ts.createBlock(
        [
            ts.createReturn(
                ts.createCall(COMMON_IDENTIFIERS.callback, undefined, [
                    ts.createIdentifier(`result.${throwDef.name.value}`),
                ]),
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
        typeNodeForFieldType(field.fieldType, state),
        defaultValue,
        field.requiredness === 'optional',
    )
}
