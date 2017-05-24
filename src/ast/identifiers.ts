import { createIdentifier, Identifier } from 'typescript';

export interface Identifiers {
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

export const identifiers: Identifiers = {
  // globals
  Set: createIdentifier('Set'),
  Map: createIdentifier('Map'),
  Array: createIdentifier('Array'),
  // pseudo-globals
  Thrift: createIdentifier('Thrift'),
  // static props
  success: createIdentifier('success'),
  // constructor vars
  args: createIdentifier('args'),
  // read vars
  input: createIdentifier('input'),
  ret: createIdentifier('ret'),
  fname: createIdentifier('fname'),
  ftype: createIdentifier('ftype'),
  fid: createIdentifier('fid'),
  read: createIdentifier('read'),
  // write vars
  output: createIdentifier('output'),
  write: createIdentifier('write')
};