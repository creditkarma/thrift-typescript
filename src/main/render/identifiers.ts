import {
  createIdentifier,
  Identifier,
} from 'typescript'

export interface IdentifierMap {
  [name: string]: Identifier
}

export const COMMON_IDENTIFIERS: IdentifierMap = {
  args: createIdentifier('args'),
  undefined: createIdentifier('undefined'),
  input: createIdentifier('input'),
  output: createIdentifier('output'),
  ftype: createIdentifier('ftype'),
  fname: createIdentifier('fname'),
  fid: createIdentifier('fid'),
  Map: createIdentifier('Map'),
  Array: createIdentifier('Array'),
  Set: createIdentifier('Set'),
  String: createIdentifier('String'),
  Boolean: createIdentifier('Boolean'),
  Number: createIdentifier('Number'),
  void: createIdentifier('void'),
  Thrift: createIdentifier('Thrift'),
  Int64: createIdentifier('Int64'),
}
