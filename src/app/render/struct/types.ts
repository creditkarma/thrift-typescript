import {
  createTypeReferenceNode,
  TypeLiteralNode,
  createTypeLiteralNode
} from 'typescript'

import {
  createTypeProperty,
  createStringType,
  createNumberType
} from '../types'

// { ktype: Thrift.Type; vtype: Thrift.Type; size: number; }
export function mapMetadataType(): TypeLiteralNode {
  return createTypeLiteralNode([
    createTypeProperty('ktype', createTypeReferenceNode('Thrift.Type', undefined)),
    createTypeProperty('vtype', createTypeReferenceNode('Thrift.Type', undefined)),
    createTypeProperty('size', createNumberType())
  ])
}

// { etype: Thrift.Type; size: number; }
export function listMetadataType(): TypeLiteralNode {
  return createTypeLiteralNode([
    createTypeProperty('etype', createTypeReferenceNode('Thrift.Type', undefined)),
    createTypeProperty('size', createNumberType())
  ])
}

// { fname: string; ftype: Thrift.Type; fid: number; }
export function fieldMetadataType(): TypeLiteralNode {
  return createTypeLiteralNode([
    createTypeProperty('fname', createStringType()),
    createTypeProperty('ftype', createTypeReferenceNode('Thrift.Type', undefined)),
    createTypeProperty('fid', createNumberType())
  ])
}