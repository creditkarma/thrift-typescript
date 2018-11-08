import { SyntaxType } from '@creditkarma/thrift-parser'

export type ReadMethodName =
    | 'readString'
    | 'readBinary'
    | 'readDouble'
    | 'readI16'
    | 'readI32'
    | 'readI64'
    | 'readByte'
    | 'readBool'

export interface IReadMap {
    [name: string]: ReadMethodName
}

export const READ_METHODS: IReadMap = {
    [SyntaxType.BoolKeyword]: 'readBool',
    [SyntaxType.BinaryKeyword]: 'readBinary',
    [SyntaxType.StringKeyword]: 'readString',
    [SyntaxType.DoubleKeyword]: 'readDouble',
    [SyntaxType.I8Keyword]: 'readByte',
    [SyntaxType.ByteKeyword]: 'readByte',
    [SyntaxType.I16Keyword]: 'readI16',
    [SyntaxType.I32Keyword]: 'readI32',
    [SyntaxType.I64Keyword]: 'readI64',
}

export type WriteMethodName =
    | 'writeString'
    | 'writeBinary'
    | 'writeDouble'
    | 'writeI16'
    | 'writeI32'
    | 'writeI64'
    | 'writeByte'
    | 'writeBool'

export interface IWriteMap {
    [name: string]: WriteMethodName
}

export const WRITE_METHODS: IWriteMap = {
    [SyntaxType.BoolKeyword]: 'writeBool',
    [SyntaxType.BinaryKeyword]: 'writeBinary',
    [SyntaxType.StringKeyword]: 'writeString',
    [SyntaxType.DoubleKeyword]: 'writeDouble',
    [SyntaxType.I8Keyword]: 'writeByte',
    [SyntaxType.ByteKeyword]: 'writeByte',
    [SyntaxType.I16Keyword]: 'writeI16',
    [SyntaxType.I32Keyword]: 'writeI32',
    [SyntaxType.I64Keyword]: 'writeI64',
}
