export interface ICode {
    status?: thrift.Int64;
    data?: Buffer;
}
export interface ICode_Loose {
    status?: number | thrift.Int64;
    data?: string | Buffer;
}
export class Code extends thrift.IStructLike  implements ICode_Loose {
    public status?: number | thrift.Int64;
    public data?: string | Buffer;
    constructor(args: ICode_Loose = {}) {
        super();
        if (args.status != null) {
            this.status = args.status;
        }
        if (args.data != null) {
            this.data = args.data;
        }
    }
    public static write(args: ICode_Loose, output: thrift.TProtocol): void {
        const obj = {
            status: (args.status != null ? (typeof args.status === "number" ? new thrift.Int64(args.status) : args.status) : thrift.Int64.fromDecimalString("200")),
            data: (args.data != null ? (typeof args.data === "string" ? Buffer.from(args.data) : args.data) : Buffer.from("data"))
        };
        output.writeStructBegin("Code");
        if (obj.status != null) {
            output.writeFieldBegin("status", thrift.TType.I64, 1);
            output.writeI64(obj.status);
            output.writeFieldEnd();
        }
        if (obj.data != null) {
            output.writeFieldBegin("data", thrift.TType.STRING, 2);
            output.writeBinary(obj.data);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
    public static read(input: thrift.TProtocol): ICode {
        let _args: any = {};
        input.readStructBegin();
        while (true) {
            const ret: thrift.IThriftField = input.readFieldBegin();
            const fieldType: thrift.TType = ret.fieldType;
            const fieldId: number = ret.fieldId;
            if (fieldType === thrift.TType.STOP) {
                break;
            }
            switch (fieldId) {
                case 1:
                    if (fieldType === thrift.TType.I64) {
                        const value_1: thrift.Int64 = input.readI64();
                        _args.status = value_1;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.STRING) {
                        const value_2: Buffer = input.readBinary();
                        _args.data = value_2;
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
        return {
            status: (_args.status != null ? _args.status : thrift.Int64.fromDecimalString("200")),
            data: (_args.data != null ? _args.data : Buffer.from("data"))
        };
    }
}
export interface IMyException {
    description: string;
    code?: ICode;
}
export interface IMyException_Loose {
    description: string;
    code?: ICode_Loose;
}
export class MyException extends thrift.IStructLike  implements IMyException_Loose {
    public description: string;
    public code?: ICode_Loose;
    constructor(args: IMyException_Loose) {
        super();
        if (args.description != null) {
            this.description = args.description;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[description] is unset!");
        }
        if (args.code != null) {
            this.code = args.code;
        }
    }
    public static write(args: IMyException_Loose, output: thrift.TProtocol): void {
        const obj = {
            description: args.description,
            code: args.code
        };
        output.writeStructBegin("MyException");
        if (obj.description != null) {
            output.writeFieldBegin("description", thrift.TType.STRING, 1);
            output.writeString(obj.description);
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[description] is unset!");
        }
        if (obj.code != null) {
            output.writeFieldBegin("code", thrift.TType.STRUCT, 3);
            Code.write(obj.code, output);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
    public static read(input: thrift.TProtocol): IMyException {
        let _args: any = {};
        input.readStructBegin();
        while (true) {
            const ret: thrift.IThriftField = input.readFieldBegin();
            const fieldType: thrift.TType = ret.fieldType;
            const fieldId: number = ret.fieldId;
            if (fieldType === thrift.TType.STOP) {
                break;
            }
            switch (fieldId) {
                case 1:
                    if (fieldType === thrift.TType.STRING) {
                        const value_3: string = input.readString();
                        _args.description = value_3;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 3:
                    if (fieldType === thrift.TType.STRUCT) {
                        const value_4: ICode = Code.read(input);
                        _args.code = value_4;
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
        if (_args.description !== undefined) {
            return {
                description: _args.description,
                code: _args.code
            };
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read MyException from input");
        }
    }
}
