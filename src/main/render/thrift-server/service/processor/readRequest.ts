import * as ts from 'typescript'

import {
    FunctionDefinition,
    ServiceDefinition,
} from '@creditkarma/thrift-parser'

import { createStructArgsName } from '../utils'

import { IRenderState } from '../../../../types'

import {
    COMMON_IDENTIFIERS,
    THRIFT_IDENTIFIERS,
    THRIFT_TYPES,
} from '../../identifiers'

import {
    createConstStatement,
    createMethodCall,
    createMethodCallStatement,
} from '../../utils'

import {
    createAnyType,
    createBufferType,
    createNumberType,
    createStringType,
} from '../../types'

import { toolkitName } from '../../struct/utils'
import { argsTypeForFunction } from './utils'

export function createReadRequestMethod(
    service: ServiceDefinition,
    state: IRenderState,
): ts.MethodDeclaration {
    return ts.createMethod(
        undefined,
        [ts.createToken(ts.SyntaxKind.PublicKeyword)],
        undefined,
        COMMON_IDENTIFIERS.readRequest,
        undefined,
        undefined,
        [
            ts.createParameter(
                undefined,
                undefined,
                undefined,
                COMMON_IDENTIFIERS.data,
                undefined,
                createBufferType(),
                undefined,
            ),
        ],
        ts.createTypeLiteralNode([
            ts.createPropertySignature(
                undefined,
                COMMON_IDENTIFIERS.methodName,
                undefined,
                createStringType(),
                undefined,
            ),
            ts.createPropertySignature(
                undefined,
                COMMON_IDENTIFIERS.requestId,
                undefined,
                createNumberType(),
                undefined,
            ),
            ts.createPropertySignature(
                undefined,
                COMMON_IDENTIFIERS.data,
                undefined,
                createAnyType(),
                undefined,
            ),
        ]),
        ts.createBlock(
            [
                createConstStatement(
                    COMMON_IDENTIFIERS.transportWithData,
                    ts.createTypeReferenceNode(
                        THRIFT_IDENTIFIERS.TTransport,
                        undefined,
                    ),
                    ts.createCall(
                        ts.createPropertyAccess(
                            ts.createPropertyAccess(
                                COMMON_IDENTIFIERS.this,
                                COMMON_IDENTIFIERS.transport,
                            ),
                            COMMON_IDENTIFIERS.receiver,
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
                        ts.createPropertyAccess(
                            COMMON_IDENTIFIERS.this,
                            COMMON_IDENTIFIERS.protocol,
                        ),
                        undefined,
                        [COMMON_IDENTIFIERS.transportWithData],
                    ),
                ),
                createConstStatement(
                    COMMON_IDENTIFIERS.metadata,
                    ts.createTypeReferenceNode(
                        THRIFT_IDENTIFIERS.IThriftMessage,
                        undefined,
                    ),
                    createMethodCall(
                        COMMON_IDENTIFIERS.input,
                        COMMON_IDENTIFIERS.readMessageBegin,
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
                ts.createSwitch(
                    COMMON_IDENTIFIERS.fieldName,
                    ts.createCaseBlock([
                        ...service.functions.map((next: FunctionDefinition) => {
                            return ts.createCaseClause(
                                ts.createLiteral(next.name.value),
                                [
                                    ts.createBlock(
                                        [
                                            createConstStatement(
                                                COMMON_IDENTIFIERS.data,
                                                argsTypeForFunction(
                                                    next,
                                                    state,
                                                ),
                                                ts.createCall(
                                                    ts.createPropertyAccess(
                                                        ts.createIdentifier(
                                                            toolkitName(
                                                                createStructArgsName(
                                                                    next,
                                                                ),
                                                                state,
                                                            ),
                                                        ),
                                                        COMMON_IDENTIFIERS.decode,
                                                    ),
                                                    undefined,
                                                    [COMMON_IDENTIFIERS.input],
                                                ),
                                            ),
                                            // input.readMessageEnd();
                                            createMethodCallStatement(
                                                COMMON_IDENTIFIERS.input,
                                                COMMON_IDENTIFIERS.readMessageEnd,
                                            ),
                                            ts.createReturn(
                                                ts.createObjectLiteral(
                                                    [
                                                        ts.createPropertyAssignment(
                                                            COMMON_IDENTIFIERS.methodName,
                                                            COMMON_IDENTIFIERS.fieldName,
                                                        ),
                                                        ts.createPropertyAssignment(
                                                            COMMON_IDENTIFIERS.requestId,
                                                            COMMON_IDENTIFIERS.requestId,
                                                        ),
                                                        ts.createPropertyAssignment(
                                                            COMMON_IDENTIFIERS.data,
                                                            COMMON_IDENTIFIERS.data,
                                                        ),
                                                    ],
                                                    true,
                                                ),
                                            ),
                                        ],
                                        true,
                                    ),
                                ],
                            )
                        }),
                        defaultCaseForRead(service),
                    ]),
                ),
            ],
            true,
        ),
    )
}

function defaultCaseForRead(service: ServiceDefinition): ts.DefaultClause {
    if (service.extends !== null) {
        return ts.createDefaultClause([
            ts.createBlock(
                [
                    ts.createReturn(
                        ts.createCall(
                            ts.createPropertyAccess(
                                ts.createSuper(),
                                COMMON_IDENTIFIERS.readRequest,
                            ),
                            undefined,
                            [COMMON_IDENTIFIERS.data],
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
                    createMethodCallStatement(
                        COMMON_IDENTIFIERS.input,
                        COMMON_IDENTIFIERS.skip,
                        [THRIFT_TYPES.STRUCT],
                    ),
                    createMethodCallStatement(
                        COMMON_IDENTIFIERS.input,
                        COMMON_IDENTIFIERS.readMessageEnd,
                    ),
                    ts.createThrow(
                        ts.createNew(COMMON_IDENTIFIERS.Error, undefined, [
                            ts.createBinary(
                                ts.createLiteral(
                                    'Unable to read request for unknown function ',
                                ),
                                ts.SyntaxKind.PlusToken,
                                COMMON_IDENTIFIERS.fieldName,
                            ),
                        ]),
                    ),
                ],
                true,
            ),
        ])
    }
}
