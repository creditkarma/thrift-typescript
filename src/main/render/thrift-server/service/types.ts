import * as ts from 'typescript'

import { THRIFT_IDENTIFIERS } from '../identifiers'

import { COMMON_IDENTIFIERS } from '../identifiers'

export const TProtocolType: ts.TypeNode = ts.createTypeReferenceNode(
    THRIFT_IDENTIFIERS.TProtocol,
    undefined,
)

export const ContextType: ts.TypeNode = ts.createTypeReferenceNode(
    'Context',
    undefined,
)

export function createConnectionType(): ts.TypeNode {
    return ts.createTypeReferenceNode(THRIFT_IDENTIFIERS.IThriftConnection, [
        ts.createTypeReferenceNode(COMMON_IDENTIFIERS.Context, undefined),
    ])
}
