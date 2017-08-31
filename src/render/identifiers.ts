import {
  createIdentifier,
  Identifier,
} from 'typescript'

// TODO: This interface is too generic and was telling me a property (args) I was trying to access was the proper type
// even though it didn't exist
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
  args: createIdentifier('args'),
}
