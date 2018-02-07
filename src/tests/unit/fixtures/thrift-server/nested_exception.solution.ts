export interface Code {
    status?: number;
}
export interface Code_Loose {
    status?: number;
}
export const CodeCodec: thrift.IStructCodec<Code> = {
    encode(val: Code_Loose, output: thrift.TProtocol): void {
        const obj: Code = {
            status: val.status != null ? val.status : 200
        };
        output.writeStructBegin("Code");
        if (obj.status != null) {
            output.writeFieldBegin("status", thrift.TType.I32, 1);
            output.writeI32(obj.status);
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
                    if (fieldType === thrift.TType.I32) {
                        const value_1: number = input.readI32();
                        _args.status = value_1;
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
            status: _args.status != null ? _args.status : 200
        };
    }
};
export class MyException extends Error {
    public message: string = "";
    public code?: Code;
    constructor(args?: {
        message?: string;
        code?: Code;
    }) {
        super();
        if (args != null && args.message != null) {
            this.message = args.message;
        }
        if (args != null && args.code != null) {
            this.code = args.code;
        }
    }
}
export const MyExceptionCodec: thrift.IStructCodec<MyException> = {
    encode(val: MyException, output: thrift.TProtocol): void {
        const obj = {
            message: val.message,
            code: val.code
        };
        output.writeStructBegin("MyException");
        if (obj.message != null) {
            output.writeFieldBegin("message", thrift.TType.STRING, 1);
            output.writeString(obj.message);
            output.writeFieldEnd();
        }
        if (obj.code != null) {
            output.writeFieldBegin("code", thrift.TType.STRUCT, 2);
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
                        const value_2: string = input.readString();
                        _args.message = value_2;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.STRUCT) {
                        const value_3: Code = CodeCodec.decode(input);
                        _args.code = value_3;
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
        return new MyException({
            message: _args.message,
            code: _args.code
        });
    }
};
