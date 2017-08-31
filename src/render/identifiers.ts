import {
  createIdentifier,
  Identifier,
} from 'typescript'

export interface IIdentifierMap {
  [name: string]: Identifier
}

export const COMMON_IDENTIFIERS: IIdentifierMap = {
  input: createIdentifier('input'),
  output: createIdentifier('output'),
  ftype: createIdentifier('ftype'),
  fname: createIdentifier('fname'),
  fid: createIdentifier('fid'),
  Map: createIdentifier('Map'),
  Array: createIdentifier('Array'),
  Set: createIdentifier('Set'),
}
