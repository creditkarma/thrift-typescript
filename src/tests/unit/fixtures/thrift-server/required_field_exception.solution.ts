export interface IMyException {
    __name: "MyException";
    description: string;
    code?: number;
}
export interface IMyExceptionArgs {
    description: string;
    code?: number;
}
export const MyExceptionCodec: thrift.IStructCodec<IMyExceptionArgs, IMyException> = {
    encode(args: IMyExceptionArgs, output: thrift.TProtocol): void {
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
                        _args.description = value_1;
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
        if (_args.description !== undefined) {
            return {
                __name: "MyException",
                description: _args.description,
                code: _args.code
            };
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read MyException from input");
        }
    }
};
export class MyException extends thrift.StructLike implements IMyException {
    public description: string;
    public code?: number;
    public readonly __name = "MyException";
    public readonly _annotations: thrift.IThriftAnnotations = {};
    public readonly _fieldAnnotations: thrift.IFieldAnnotations = {};
    constructor(args: IMyExceptionArgs) {
        super();
        if (args.description != null) {
            const value_3: string = args.description;
            this.description = value_3;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[description] is unset!");
        }
        if (args.code != null) {
            const value_4: number = args.code;
            this.code = value_4;
        }
    }
    public static read(input: thrift.TProtocol): MyException {
        return new MyException(MyExceptionCodec.decode(input));
    }
    public static write(args: IMyExceptionArgs, output: thrift.TProtocol): void {
        return MyExceptionCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return MyExceptionCodec.encode(this, output);
    }
}
