import { methods } from './methods'

export interface Enums {
  BOOL,
  I32,
  I16,
  STRING,
  BINARY,
  DOUBLE,
  I64,
  BYTE,
  I08
}

export const write: Enums = {
  BOOL: methods.writeBool,
  I32: methods.writeI32,
  I16: methods.writeI16,
  STRING: methods.writeString,
  BINARY: methods.writeBinary,
  DOUBLE: methods.writeDouble,
  I64: methods.writeI64,
  BYTE: methods.writeByte,
  I08: methods.writeByte
};

export const read: Enums = {
  BOOL: methods.readBool,
  I32: methods.readI32,
  I16: methods.readI16,
  STRING: methods.readString,
  BINARY: methods.readBinary,
  DOUBLE: methods.readDouble,
  I64: methods.readI64,
  BYTE: methods.readByte,
  I08: methods.readByte
}