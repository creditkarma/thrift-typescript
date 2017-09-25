import * as ts from 'typescript'

export interface IdentifierMap {
  [name: string]: ts.Identifier
}

export const COMMON_IDENTIFIERS: IdentifierMap = {
  args: ts.createIdentifier('args'),
  undefined: ts.createIdentifier('undefined'),
  input: ts.createIdentifier('input'),
  output: ts.createIdentifier('output'),
  ftype: ts.createIdentifier('ftype'),
  fname: ts.createIdentifier('fname'),
  fid: ts.createIdentifier('fid'),
  Map: ts.createIdentifier('Map'),
  Array: ts.createIdentifier('Array'),
  Set: ts.createIdentifier('Set'),
  String: ts.createIdentifier('String'),
  Boolean: ts.createIdentifier('Boolean'),
  Number: ts.createIdentifier('Number'),
  void: ts.createIdentifier('void'),
  Thrift: ts.createIdentifier('Thrift'),
  Int64: ts.createIdentifier('Int64'),
}
