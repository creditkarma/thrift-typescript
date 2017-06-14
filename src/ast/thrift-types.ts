import { createPropertyAccess, PropertyAccessExpression } from 'typescript'

import { identifiers as _id } from './identifiers'

export interface IThriftTypes {
  readonly STOP: PropertyAccessExpression,
  readonly VOID: PropertyAccessExpression,
  readonly BOOL: PropertyAccessExpression,
  readonly BYTE: PropertyAccessExpression,
  readonly I08: PropertyAccessExpression,
  readonly DOUBLE: PropertyAccessExpression,
  readonly I16: PropertyAccessExpression,
  readonly I32: PropertyAccessExpression,
  readonly I64: PropertyAccessExpression,
  readonly STRING: PropertyAccessExpression,
  readonly UTF7: PropertyAccessExpression,
  readonly STRUCT: PropertyAccessExpression,
  readonly MAP: PropertyAccessExpression,
  readonly SET: PropertyAccessExpression,
  readonly LIST: PropertyAccessExpression,
  readonly UTF8: PropertyAccessExpression,
  readonly UTF16: PropertyAccessExpression
}

export const types: IThriftTypes = {
  BOOL: createPropertyAccess(_id.Thrift, 'Type.BOOL'),
  BYTE: createPropertyAccess(_id.Thrift, 'Type.BYTE'),
  DOUBLE: createPropertyAccess(_id.Thrift, 'Type.DOUBLE'),
  I08: createPropertyAccess(_id.Thrift, 'Type.I08'),
  I16: createPropertyAccess(_id.Thrift, 'Type.I16'),
  I32: createPropertyAccess(_id.Thrift, 'Type.I32'),
  I64: createPropertyAccess(_id.Thrift, 'Type.I64'),
  LIST: createPropertyAccess(_id.Thrift, 'Type.LIST'),
  MAP: createPropertyAccess(_id.Thrift, 'Type.MAP'),
  SET: createPropertyAccess(_id.Thrift, 'Type.SET'),
  STOP: createPropertyAccess(_id.Thrift, 'Type.STOP'),
  STRING: createPropertyAccess(_id.Thrift, 'Type.STRING'),
  STRUCT: createPropertyAccess(_id.Thrift, 'Type.STRUCT'),
  UTF16: createPropertyAccess(_id.Thrift, 'Type.UTF16'),
  UTF7: createPropertyAccess(_id.Thrift, 'Type.UTF7'),
  UTF8: createPropertyAccess(_id.Thrift, 'Type.UTF8'),
  VOID: createPropertyAccess(_id.Thrift, 'Type.VOID'),
}
