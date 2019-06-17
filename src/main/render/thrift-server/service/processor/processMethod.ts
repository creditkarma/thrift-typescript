import {
    FunctionDefinition,
    ServiceDefinition,
} from '@creditkarma/thrift-parser'
import * as ts from 'typescript'

import { IRenderState } from '../../../../types'
import { COMMON_IDENTIFIERS } from '../../identifiers'

import {
    createConstStatement,
    createFunctionParameter,
    createMethodCall,
    createPromise,
    createPublicMethod,
} from '../../utils'

import { ThriftContextType } from '../types'

import {
    createAnyType,
    createBufferType,
    createErrorType,
    createStringType,
    createVoidType,
} from '../../types'

import { collectAllMethods, IFunctionResolution } from '../../../shared/service'

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
export function createProcessMethod(
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
                ThriftContextType,
                undefined,
            ),
        ], // parameters
        ts.createTypeReferenceNode(COMMON_IDENTIFIERS.Promise, [
            createBufferType(),
        ]), // return type
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
                            COMMON_IDENTIFIERS.metadata,
                            ts.createTypeReferenceNode(
                                COMMON_IDENTIFIERS.ReadRequestData,
                                undefined,
                            ),
                            ts.createCall(
                                ts.createPropertyAccess(
                                    COMMON_IDENTIFIERS.this,
                                    COMMON_IDENTIFIERS.readRequest,
                                ),
                                undefined,
                                [COMMON_IDENTIFIERS.data],
                            ),
                        ),
                        createMethodCallForFunctionName(service),
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
                                ts.createPropertyAccess(
                                    COMMON_IDENTIFIERS.metadata,
                                    COMMON_IDENTIFIERS.data,
                                ),
                                ts.createPropertyAccess(
                                    COMMON_IDENTIFIERS.metadata,
                                    COMMON_IDENTIFIERS.requestId,
                                ),
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
function createMethodCallForFunctionName(
    service: ServiceDefinition,
): ts.SwitchStatement {
    return ts.createSwitch(
        ts.createPropertyAccess(
            COMMON_IDENTIFIERS.metadata,
            COMMON_IDENTIFIERS.methodName,
        ),
        ts.createCaseBlock([
            ...service.functions.map((next: FunctionDefinition) => {
                return createMethodCallForFunction(next)
            }),
            ts.createDefaultClause([
                ts.createBlock([...createDefaultBlock(service)], true),
            ]),
        ]),
    )
}

function createDefaultBlock(service: ServiceDefinition): Array<ts.Statement> {
    if (service.extends !== null) {
        return [
            ts.createStatement(
                ts.createCall(COMMON_IDENTIFIERS.resolve, undefined, [
                    createMethodCall(
                        ts.createPropertyAccess(
                            COMMON_IDENTIFIERS.this,
                            COMMON_IDENTIFIERS.parent,
                        ),
                        COMMON_IDENTIFIERS.process,
                        [COMMON_IDENTIFIERS.data, COMMON_IDENTIFIERS.context],
                    ),
                ]),
            ),
            ts.createBreak(),
        ]
    } else {
        return [
            createConstStatement(
                COMMON_IDENTIFIERS.failed,
                createAnyType(),
                COMMON_IDENTIFIERS.metadata,
            ),
            createConstStatement(
                COMMON_IDENTIFIERS.errMessage,
                createStringType(),
                ts.createBinary(
                    ts.createLiteral('Unknown function '),
                    ts.SyntaxKind.PlusToken,
                    ts.createPropertyAccess(
                        COMMON_IDENTIFIERS.failed,
                        COMMON_IDENTIFIERS.methodName,
                    ),
                ),
            ),
            createConstStatement(
                COMMON_IDENTIFIERS.err,
                createErrorType(),
                ts.createNew(COMMON_IDENTIFIERS.Error, undefined, [
                    COMMON_IDENTIFIERS.errMessage,
                ]),
            ),
            ts.createStatement(
                ts.createCall(COMMON_IDENTIFIERS.resolve, undefined, [
                    ts.createCall(
                        ts.createPropertyAccess(
                            COMMON_IDENTIFIERS.this,
                            COMMON_IDENTIFIERS.writeError,
                        ),
                        undefined,
                        [
                            ts.createPropertyAccess(
                                COMMON_IDENTIFIERS.failed,
                                COMMON_IDENTIFIERS.methodName,
                            ),
                            ts.createPropertyAccess(
                                COMMON_IDENTIFIERS.failed,
                                COMMON_IDENTIFIERS.requestId,
                            ),
                            COMMON_IDENTIFIERS.err,
                        ],
                    ),
                ]),
            ),
            ts.createBreak(),
        ]
    }
}
