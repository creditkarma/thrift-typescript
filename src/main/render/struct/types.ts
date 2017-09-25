import * as ts from 'typescript'

import {
  createTypeProperty,
  createStringType,
  createNumberType
} from '../types'

// { ktype: Thrift.Type; vtype: Thrift.Type; size: number; }
export function mapMetadataType(): ts.TypeLiteralNode {
  return ts.createTypeLiteralNode([
    createTypeProperty('ktype', ts.createTypeReferenceNode('Thrift.Type', undefined)),
    createTypeProperty('vtype', ts.createTypeReferenceNode('Thrift.Type', undefined)),
    createTypeProperty('size', createNumberType())
  ])
}

// { etype: Thrift.Type; size: number; }
export function listMetadataType(): ts.TypeLiteralNode {
  return ts.createTypeLiteralNode([
    createTypeProperty('etype', ts.createTypeReferenceNode('Thrift.Type', undefined)),
    createTypeProperty('size', createNumberType())
  ])
}

// { fname: string; ftype: Thrift.Type; fid: number; }
export function fieldMetadataType(): ts.TypeLiteralNode {
  return ts.createTypeLiteralNode([
    createTypeProperty('fname', createStringType()),
    createTypeProperty('ftype', ts.createTypeReferenceNode('Thrift.Type', undefined)),
    createTypeProperty('fid', createNumberType())
  ])
}