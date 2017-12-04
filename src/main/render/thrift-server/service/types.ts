import * as ts from 'typescript'

import {
  createStringType,
  createNumberType,
  createVoidType,
  createTypeProperty
} from '../types'

import {
  createFunctionParameter
} from '../utils'

import {
  COMMON_IDENTIFIERS
} from '../identifiers'

export const TProtocolType: ts.TypeNode = ts.createTypeReferenceNode(COMMON_IDENTIFIERS.TProtocol, undefined)

export const ContextType: ts.TypeNode = ts.createTypeReferenceNode('Context', undefined)

// { fieldName: string; messageType: Thrift.MessageType; requestId: number; }
export function createReadMessageType(): ts.TypeLiteralNode {
  return ts.createTypeLiteralNode([
    createTypeProperty('fieldName', createStringType()),
    createTypeProperty('messageType', ts.createTypeReferenceNode(COMMON_IDENTIFIERS.MessageType, undefined)),
    createTypeProperty('requestId', createNumberType())
  ])
}

export function createProtocolType(): ts.ConstructorTypeNode {
  return ts.createConstructorTypeNode(
    [],
    [ createFunctionParameter('trans', ts.createTypeReferenceNode(COMMON_IDENTIFIERS.TTransport, undefined)) ],
    TProtocolType
  )
}

// { [key: string]: (e?: Error|object, r?: any) => void }
export function createReqType(): ts.TypeLiteralNode {
  return ts.createTypeLiteralNode([
    ts.createIndexSignature(
      undefined,
      undefined,
      [ ts.createParameter(
        undefined,
        undefined,
        undefined,
        'name',
        undefined,
        createNumberType()
      ) ],
      ts.createFunctionTypeNode(
        undefined,
        [
          createFunctionParameter(
            'err',
            ts.createUnionTypeNode([
              ts.createTypeReferenceNode('Error', undefined),
              ts.createTypeReferenceNode('object', undefined),
              ts.createTypeReferenceNode('undefined', undefined)
            ])
          ),
          createFunctionParameter(
            'val',
            ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
            undefined,
            true
          )
        ],
        createVoidType()
      )
    )
  ])
}
