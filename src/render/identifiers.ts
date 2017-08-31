import {
  createIdentifier,
  Identifier,
} from 'typescript'

export interface IdentifierMap {
  [name: string]: Identifier
}

export const COMMON_IDENTIFIERS: IdentifierMap = {
  input: createIdentifier('input'),
  output: createIdentifier('output'),
  ftype: createIdentifier('ftype'),
  fname: createIdentifier('fname'),
  fid: createIdentifier('fid'),
  Map: createIdentifier('Map'),
  Array: createIdentifier('Array'),
  Set: createIdentifier('Set'),
}
