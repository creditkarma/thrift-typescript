export interface IMyException {
    message?: string;
    code?: number;
}
export interface IMyException_Loose {
    message?: string;
    code?: number;
}
export const MyExceptionCodec: thrift.IStructCodec<IMyException_Loose, IMyException> = {
    encode(args: IMyException_Loose, output: thrift.TProtocol): void {
        const obj = {
            message: args.message,
            code: (args.code != null ? args.code : 200)
        };
        output.writeStructBegin("MyException");
        if (obj.message != null) {
            output.writeFieldBegin("message", thrift.TType.STRING, 1);
            output.writeString(obj.message);
            output.writeFieldEnd();
        }
        if (obj.code != null) {
            output.writeFieldBegin("code", thrift.TType.I32, 2);
            output.writeI32(obj.code);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): IMyException {
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
                        const value_1: string = input.readString();
                        _args.message = value_1;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.I32) {
                        const value_2: number = input.readI32();
                        _args.code = value_2;
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
            message: _args.message,
            code: (_args.code != null ? _args.code : 200)
        };
    }
};
export class MyException extends thrift.StructLike  implements IMyException_Loose {
    public message?: string;
    public code?: number = 200;
    constructor(args: IMyException_Loose = {}) {
        super();
        if (args.message != null) {
            this.message = args.message;
        }
        if (args.code != null) {
            this.code = args.code;
        }
    }
    public static read(input: thrift.TProtocol): MyException {
        return new MyException(MyExceptionCodec.decode(input));
    }
    public write(output: thrift.TProtocol): void {
        return MyExceptionCodec.encode(this, output);
    }
}
