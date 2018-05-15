import * as ts from 'typescript'

import {
  createNumberType,
  createVoidType,
} from '../../shared/types'

import {
  createFunctionParameter,
} from '../../shared/utils'

import {
    THRIFT_IDENTIFIERS,
} from '../identifiers'

export const TProtocolType: ts.TypeNode = ts.createTypeReferenceNode(THRIFT_IDENTIFIERS.TProtocol, undefined)

export function createProtocolType(): ts.ConstructorTypeNode {
    return ts.createConstructorTypeNode(
        [],
        [
            createFunctionParameter(
                'trans',
                ts.createTypeReferenceNode(THRIFT_IDENTIFIERS.TTransport, undefined),
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
                            ts.createTypeReferenceNode('Error', undefined),
                            ts.createTypeReferenceNode('object', undefined),
                            ts.createTypeReferenceNode('undefined', undefined),
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
