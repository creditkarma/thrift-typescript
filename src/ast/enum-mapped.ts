import { methods } from './methods'

export interface IEnums {
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

export const write: IEnums = {
  BINARY: methods.writeBinary,
  BOOL: methods.writeBool,
  BYTE: methods.writeByte,
  DOUBLE: methods.writeDouble,
  I08: methods.writeByte,
  I16: methods.writeI16,
  I32: methods.writeI32,
  I64: methods.writeI64,
  STRING: methods.writeString,
}

export const read: IEnums = {
  BINARY: methods.readBinary,
  BOOL: methods.readBool,
  BYTE: methods.readByte,
  DOUBLE: methods.readDouble,
  I08: methods.readByte,
  I16: methods.readI16,
  I32: methods.readI32,
  I64: methods.readI64,
  STRING: methods.readString,
}
