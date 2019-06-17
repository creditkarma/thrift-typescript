import * as ts from 'typescript'

import {
    FunctionDefinition,
    ServiceDefinition,
    SyntaxType,
} from '@creditkarma/thrift-parser'

import { createOutputVariable, createStructResultName } from '../utils'

import { IRenderState } from '../../../../types'

import { COMMON_IDENTIFIERS, MESSAGE_TYPE } from '../../identifiers'

import { createConstStatement, createMethodCallStatement } from '../../utils'

import { createNumberType, createStringType } from '../../types'

import { createAnyType, createBufferType } from '../../../shared/types'

import { looseName, toolkitName } from '../../struct/utils'

function defaultCaseForWrite(service: ServiceDefinition): ts.DefaultClause {
    if (service.extends !== null) {
        return ts.createDefaultClause([
            ts.createBlock(
                [
                    ts.createReturn(
                        ts.createCall(
                            ts.createPropertyAccess(
                                ts.createPropertyAccess(
                                    COMMON_IDENTIFIERS.this,
                                    COMMON_IDENTIFIERS.parent,
                                ),
                                COMMON_IDENTIFIERS.writeResponse,
                            ),
                            undefined,
                            [
                                COMMON_IDENTIFIERS.methodName,
                                COMMON_IDENTIFIERS.data,
                                COMMON_IDENTIFIERS.requestId,
                            ],
                        ),
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
                                    'Unable to write response for unknown function ',
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

export function createWriteResponseMethod(
    service: ServiceDefinition,
    state: IRenderState,
): Array<ts.MethodDeclaration> {
    return [
        ts.createMethod(
            undefined,
            [ts.createToken(ts.SyntaxKind.PublicKeyword)],
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
                    COMMON_IDENTIFIERS.data,
                    undefined,
                    createAnyType(),
                    undefined,
                ),
                ts.createParameter(
                    undefined,
                    undefined,
                    undefined,
                    COMMON_IDENTIFIERS.requestId,
                    undefined,
                    createNumberType(),
                    undefined,
                ),
            ],
            createBufferType(),
            ts.createBlock(
                [
                    createOutputVariable(),
                    ts.createSwitch(
                        COMMON_IDENTIFIERS.methodName,
                        ts.createCaseBlock([
                            ...service.functions.map(
                                (next: FunctionDefinition) => {
                                    return ts.createCaseClause(
                                        ts.createLiteral(next.name.value),
                                        [
                                            ts.createBlock(
                                                [
                                                    // const result: StructType = {success: data}
                                                    createConstStatement(
                                                        COMMON_IDENTIFIERS.result,
                                                        ts.createTypeReferenceNode(
                                                            ts.createIdentifier(
                                                                looseName(
                                                                    createStructResultName(
                                                                        next,
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
                                                        COMMON_IDENTIFIERS.writeMessageBegin,
                                                        [
                                                            ts.createLiteral(
                                                                next.name.value,
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
                                                                    next,
                                                                ),
                                                                state,
                                                            ),
                                                        ),
                                                        COMMON_IDENTIFIERS.encode,
                                                        [
                                                            COMMON_IDENTIFIERS.result,
                                                            COMMON_IDENTIFIERS.output,
                                                        ],
                                                    ),
                                                    // output.writeMessageEnd()
                                                    createMethodCallStatement(
                                                        COMMON_IDENTIFIERS.output,
                                                        COMMON_IDENTIFIERS.writeMessageEnd,
                                                        [],
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
                                        ],
                                    )
                                },
                            ),
                            defaultCaseForWrite(service),
                        ]),
                    ),
                ],
                true,
            ),
        ),
    ]
}
