/* tslint:disable */
/*
 * Autogenerated by @creditkarma/thrift-typescript v{{VERSION}}
 * DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
*/
import Int64 = require("node-int64");
import * as thrift from "test-lib";
import * as __NAMESPACE__ from "./.";
export interface ISharedStructArgs {
    code: __NAMESPACE__.Code;
    value: string;
}
export class SharedStruct {
    public code: __NAMESPACE__.Code;
    public value: string;
    constructor(args: ISharedStructArgs) {
        if (args != null && args.code != null) {
            this.code = args.code;
        }
        else {
            throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.UNKNOWN, "Required field[code] is unset!");
        }
        if (args != null && args.value != null) {
            this.value = args.value;
        }
        else {
            throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.UNKNOWN, "Required field[value] is unset!");
        }
    }
    public write(output: thrift.TProtocol): void {
        output.writeStructBegin("SharedStruct");
        if (this.code != null) {
            output.writeFieldBegin("code", thrift.Thrift.Type.STRUCT, 1);
            this.code.write(output);
            output.writeFieldEnd();
        }
        if (this.value != null) {
            output.writeFieldBegin("value", thrift.Thrift.Type.STRING, 2);
            output.writeString(this.value);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
    public static read(input: thrift.TProtocol): SharedStruct {
        input.readStructBegin();
        let _args: any = {};
        while (true) {
            const ret: thrift.TField = input.readFieldBegin();
            const fieldType: thrift.Thrift.Type = ret.ftype;
            const fieldId: number = ret.fid;
            if (fieldType === thrift.Thrift.Type.STOP) {
                break;
            }
            switch (fieldId) {
                case 1:
                    if (fieldType === thrift.Thrift.Type.STRUCT) {
                        const value_1: __NAMESPACE__.Code = __NAMESPACE__.Code.read(input);
                        _args.code = value_1;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.Thrift.Type.STRING) {
                        const value_2: string = input.readString();
                        _args.value = value_2;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                default: {
                    input.skip(fieldType);
                }
            }
            input.readFieldEnd();
        }
        input.readStructEnd();
        if (_args.code !== undefined && _args.value !== undefined) {
            return new SharedStruct(_args);
        }
        else {
            throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.UNKNOWN, "Unable to read SharedStruct from input");
        }
    }
}
