import * as ts from 'typescript'

import {
  createTypeProperty,
  createStringType,
  createNumberType
} from '../types'

import {
  COMMON_IDENTIFIERS
} from '../identifiers'

// { ktype: Thrift.Type; vtype: Thrift.Type; size: number; }
export function mapMetadataType(): ts.TypeLiteralNode {
  return ts.createTypeLiteralNode([
    createTypeProperty('ktype', ts.createTypeReferenceNode(COMMON_IDENTIFIERS.Thrift_Type, undefined)),
    createTypeProperty('vtype', ts.createTypeReferenceNode(COMMON_IDENTIFIERS.Thrift_Type, undefined)),
    createTypeProperty('size', createNumberType())
  ])
}

// { etype: Thrift.Type; size: number; }
export function listMetadataType(): ts.TypeLiteralNode {
  return ts.createTypeLiteralNode([
    createTypeProperty('etype', ts.createTypeReferenceNode(COMMON_IDENTIFIERS.Thrift_Type, undefined)),
    createTypeProperty('size', createNumberType())
  ])
}

// { fname: string; ftype: Thrift.Type; fid: number; }
export function fieldMetadataType(): ts.TypeLiteralNode {
  return ts.createTypeLiteralNode([
    createTypeProperty('fname', createStringType()),
    createTypeProperty('ftype', ts.createTypeReferenceNode(COMMON_IDENTIFIERS.Thrift_Type, undefined)),
    createTypeProperty('fid', createNumberType())
  ])
}
