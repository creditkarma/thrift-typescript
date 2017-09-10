import {
  SyntaxKind,
  TypeLiteralNode,
  createTypeLiteralNode,
  createIndexSignature,
  createParameter,
  createFunctionTypeNode,
  createUnionTypeNode,
  createTypeReferenceNode,
  createKeywordTypeNode,
  createConstructorTypeNode,
  ConstructorTypeNode,
  TypeNode
} from 'typescript'

import {
  createStringType,
  createNumberType,
  createVoidType,
  createTypeProperty
} from '../types'

import {
  createFunctionParameter
} from '../utils'

export const TProtocolType: TypeNode = createTypeReferenceNode('TProtocol', undefined)

export const ContextType: TypeNode = createTypeReferenceNode('Context', undefined)

// { fname: string; mtype: Thrift.MessageType; rseqid: number; }
export function createReadMessageType(): TypeLiteralNode {
  return createTypeLiteralNode([
    createTypeProperty('fname', createStringType()),
    createTypeProperty('mtype', createTypeReferenceNode('Thrift.MessageType', undefined)),
    createTypeProperty('rseqid', createNumberType())
  ])
}

export function createProtocolType(): ConstructorTypeNode {
  return createConstructorTypeNode([], [], TProtocolType)
}

// { [key: string]: (e?: Error|object, r?: any) => void }
export function createReqType(): TypeLiteralNode {
  return createTypeLiteralNode([
    createIndexSignature(
      undefined,
      undefined,
      [ createParameter(
        undefined,
        undefined,
        undefined,
        'name',
        undefined,
        createStringType()
      ) ],
      createFunctionTypeNode(
        undefined,
        [
          createFunctionParameter(
            'err',
            createUnionTypeNode([
              createTypeReferenceNode('Error', undefined),
              createTypeReferenceNode('object', undefined)
            ])
          ),
          createFunctionParameter(
            'r',
            createKeywordTypeNode(SyntaxKind.AnyKeyword),
            undefined,
            true
          )
        ],
        createVoidType()
      )
    )
  ])
}