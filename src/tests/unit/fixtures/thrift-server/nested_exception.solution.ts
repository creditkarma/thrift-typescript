export interface Code {
    status?: thrift.Int64;
    data?: Buffer;
}
export interface Code_Loose {
    status?: number | thrift.Int64;
    data?: string | Buffer;
}
export const CodeCodec: thrift.IStructCodec<Code> = {
    encode(val: Code_Loose, output: thrift.TProtocol): void {
        const obj = {
            status: (val.status != null ? (typeof val.status === "number" ? new thrift.Int64(val.status) : val.status) : new thrift.Int64(200)),
            data: (val.data != null ? (typeof val.data === "string" ? Buffer.from(val.data) : val.data) : Buffer.from("data"))
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
    },
    decode(input: thrift.TProtocol): Code {
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
            status: (_args.status != null ? _args.status : new thrift.Int64(200)),
            data: (_args.data != null ? _args.data : Buffer.from("data"))
        };
    }
};
export class MyException extends Error {
    public description: string;
    public code?: Code_Loose;
    constructor(args: {
        description: string;
        code?: Code_Loose;
    }) {
        super();
        if (args != null && args.description != null) {
            this.description = args.description;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[description] is unset!");
        }
        if (args != null && args.code != null) {
            this.code = args.code;
        }
    }
}
export const MyExceptionCodec: thrift.IStructCodec<MyException> = {
    encode(val: MyException, output: thrift.TProtocol): void {
        const obj = {
            description: val.description,
            code: val.code
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
            CodeCodec.encode(obj.code, output);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): MyException {
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
                        const value_4: Code = CodeCodec.decode(input);
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
            return new MyException({
                description: _args.description,
                code: _args.code
            });
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read MyException from input");
        }
    }
};
