import * as ts from 'typescript'

import {
    FieldDefinition,
    FunctionDefinition,
    SyntaxType,
} from '@creditkarma/thrift-parser'

import { ContextType } from '../types'

import { IRenderState } from '../../../../types'

import { COMMON_IDENTIFIERS, MESSAGE_TYPE } from '../../identifiers'

import {
    createCallStatement,
    createConstStatement,
    createFunctionParameter,
    createMethodCall,
    createMethodCallStatement,
    createPromise,
} from '../../utils'

import {
    constructorNameForFieldType,
    createBufferType,
    createErrorType,
    createNumberType,
    createVoidType,
    typeNodeForFieldType,
} from '../../types'

import { createProtectedMethod } from '../../../shared/utils'
import { className, looseName, toolkitName } from '../../struct/utils'
import { createOutputVariable, createStructResultName } from '../utils'
import { argsTypeForFunction, createWriteErrorCall } from './utils'

export function createProcessFunctionMethod(
    funcDef: FunctionDefinition,
    state: IRenderState,
): ts.MethodDeclaration {
    return createProtectedMethod(
        ts.createIdentifier(`process_${funcDef.name.value}`),
        [
            createFunctionParameter(
                COMMON_IDENTIFIERS.args,
                argsTypeForFunction(funcDef, state),
            ),
            createFunctionParameter(
                COMMON_IDENTIFIERS.requestId,
                createNumberType(),
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
                                                                    return ts.createPropertyAccess(
                                                                        COMMON_IDENTIFIERS.args,
                                                                        ts.createIdentifier(
                                                                            next
                                                                                .name
                                                                                .value,
                                                                        ),
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
                                        ts.createReturn(
                                            ts.createCall(
                                                ts.createPropertyAccess(
                                                    COMMON_IDENTIFIERS.this,
                                                    COMMON_IDENTIFIERS.writeResponse,
                                                ),
                                                undefined,
                                                [
                                                    ts.createLiteral(
                                                        funcDef.name.value,
                                                    ),
                                                    COMMON_IDENTIFIERS.data,
                                                    COMMON_IDENTIFIERS.requestId,
                                                ],
                                            ),
                                        ),
                                    ],
                                    true,
                                ),
                            ),
                        ],
                    ),
                    COMMON_IDENTIFIERS.catch,
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

function createExceptionHandlers(
    funcDef: FunctionDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    if (funcDef.throws.length > 0) {
        // if (err instanceof {{throwType}}) {
        return [createIfForExceptions(funcDef.throws, funcDef, state)]
    } else {
        return [createWriteErrorCall(funcDef)]
    }
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
        createElseForExceptions(tail, funcDef, state),
    )
}

function createElseForExceptions(
    // exp: FieldDefinition,
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
            createElseForExceptions(tail, funcDef, state),
        )
    } else {
        return ts.createBlock([createWriteErrorCall(funcDef)], true)
    }
}

function createThenForException(
    throwDef: FieldDefinition,
    funcDef: FunctionDefinition,
    state: IRenderState,
): ts.Statement {
    return ts.createBlock(
        [
            createOutputVariable(),
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
                COMMON_IDENTIFIERS.writeMessageBegin,
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
                COMMON_IDENTIFIERS.encode,
                [COMMON_IDENTIFIERS.result, COMMON_IDENTIFIERS.output],
            ),
            // output.writeMessageEnd()
            createMethodCallStatement(
                COMMON_IDENTIFIERS.output,
                COMMON_IDENTIFIERS.writeMessageEnd,
            ),
            // return output.flush()
            ts.createReturn(
                ts.createCall(
                    ts.createPropertyAccess(
                        COMMON_IDENTIFIERS.output,
                        COMMON_IDENTIFIERS.flush,
                    ),
                    undefined,
                    [],
                ),
            ),
        ],
        true,
    )
}
