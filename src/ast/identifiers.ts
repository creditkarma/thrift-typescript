import { createIdentifier, Identifier } from 'typescript'

export interface IIdentifiers {
  // globals
  readonly Set: Identifier,
  readonly Map: Identifier,
  readonly Array: Identifier,
  // pseudo-globals
  readonly Thrift: Identifier,
  // static props
  readonly success: Identifier,
  // constructor vars
  readonly args: Identifier,
  // read vars
  readonly input: Identifier,
  readonly ret: Identifier,
  readonly fname: Identifier,
  readonly ftype: Identifier,
  readonly fid: Identifier,
  readonly read: Identifier,
  // write vars
  readonly output: Identifier
  readonly write: Identifier
}

export const identifiers: IIdentifiers = {
  Array: createIdentifier('Array'),
  Map: createIdentifier('Map'),
  Set: createIdentifier('Set'),
  Thrift: createIdentifier('Thrift'),
  args: createIdentifier('args'),
  fid: createIdentifier('fid'),
  fname: createIdentifier('fname'),
  ftype: createIdentifier('ftype'),
  input: createIdentifier('input'),
  output: createIdentifier('output'),
  read: createIdentifier('read'),
  ret: createIdentifier('ret'),
  success: createIdentifier('success'),
  write: createIdentifier('write'),
}
