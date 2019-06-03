import * as ts from 'typescript'

import { createNumberType, createVoidType } from '../types'

import { createFunctionParameter } from '../utils'

import { createErrorType, createUndefinedType } from '../../shared/types'
import { THRIFT_IDENTIFIERS } from '../identifiers'

export const TProtocolType: ts.TypeNode = ts.createTypeReferenceNode(
    THRIFT_IDENTIFIERS.TProtocol,
    undefined,
)

export function createProtocolType(): ts.ConstructorTypeNode {
    return ts.createConstructorTypeNode(
        [],
        [
            createFunctionParameter(
                'trans',
                ts.createTypeReferenceNode(
                    THRIFT_IDENTIFIERS.TTransport,
                    undefined,
                ),
            ),
        ],
        TProtocolType,
    )
}

// { [key: string]: (e?: Error|object, r?: any) => void }
export function createReqType(): ts.TypeLiteralNode {
    return ts.createTypeLiteralNode([
        ts.createIndexSignature(
            undefined,
            undefined,
            [
                ts.createParameter(
                    undefined,
                    undefined,
                    undefined,
                    'name',
                    undefined,
                    createNumberType(),
                ),
            ],
            ts.createFunctionTypeNode(
                undefined,
                [
                    createFunctionParameter(
                        'err',
                        ts.createUnionTypeNode([
                            createErrorType(),
                            ts.createTypeReferenceNode('object', undefined),
                            createUndefinedType(),
                        ]),
                    ),
                    createFunctionParameter(
                        'val',
                        ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
                        undefined,
                        true,
                    ),
                ],
                createVoidType(),
            ),
        ),
    ])
}
