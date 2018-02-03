import * as ts from 'typescript'

export const SHARED_IDENTIFIERS = {
    Map: ts.createIdentifier('Map'),
    Array: ts.createIdentifier('Array'),
    Set: ts.createIdentifier('Set'),
    String: ts.createIdentifier('String'),
    Buffer: ts.createIdentifier('Buffer'),
    Boolean: ts.createIdentifier('Boolean'),
    Promise: ts.createIdentifier('Promise'),
    Number: ts.createIdentifier('Number'),
    void: ts.createIdentifier('void'),
    Int64: ts.createIdentifier('thrift.Int64'),
}
