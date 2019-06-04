import * as ts from 'typescript'

import { createOutputVariable } from '../utils'

import {
    COMMON_IDENTIFIERS,
    MESSAGE_TYPE,
    THRIFT_IDENTIFIERS,
} from '../../identifiers'

import {
    createApplicationException,
    createConstStatement,
    createFunctionParameter,
    createMethodCallStatement,
} from '../../utils'

import {
    createBufferType,
    createNumberType,
    createStringType,
} from '../../types'

// const result: thrift.TApplicationException = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, err.message);
// const output: thrift.TProtocol = new this.protocol(new this.transport());
// output.writeMessageBegin(methodName, thrift.MessageType.EXCEPTION, requestId);
// thrift.TApplicationExceptionCodec.encode(result, output);
// output.writeMessageEnd();
// return output.flush();
export function createWriteErrorMethod(): ts.MethodDeclaration {
    return ts.createMethod(
        undefined,
        [ts.createToken(ts.SyntaxKind.ProtectedKeyword)],
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
                createOutputVariable(),
                // const result: Thrift.TApplicationException = new thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, err.message)
                createConstStatement(
                    COMMON_IDENTIFIERS.result,
                    ts.createTypeReferenceNode(
                        THRIFT_IDENTIFIERS.TApplicationException,
                        undefined,
                    ),
                    createApplicationException(
                        'UNKNOWN',
                        ts.createPropertyAccess(
                            COMMON_IDENTIFIERS.err,
                            COMMON_IDENTIFIERS.message,
                        ),
                    ),
                ),
                // output.writeMessageBegin("{{name}}", Thrift.MessageType.EXCEPTION, requestId)
                createMethodCallStatement(
                    COMMON_IDENTIFIERS.output,
                    COMMON_IDENTIFIERS.writeMessageBegin,
                    [
                        COMMON_IDENTIFIERS.methodName,
                        MESSAGE_TYPE.EXCEPTION,
                        COMMON_IDENTIFIERS.requestId,
                    ],
                ),
                // thrift.TApplicationExceptionCodec.encode(result, output)
                createMethodCallStatement(
                    THRIFT_IDENTIFIERS.TApplicationExceptionCodec,
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
        ),
    )
}
