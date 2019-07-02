export interface IMyException {
    __name: "MyException";
    message?: string;
    code?: number;
}
export interface IMyExceptionArgs {
    message?: string;
    code?: number;
}
export const MyExceptionCodec: thrift.IStructCodec<IMyExceptionArgs, IMyException> = {
    encode(args: IMyExceptionArgs, output: thrift.TProtocol): void {
        const obj = ({
            message: args.message,
            code: (args.code != null ? args.code : 200)
        } as IMyExceptionArgs);
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
            __name: "MyException",
            message: _args.message,
            code: (_args.code != null ? _args.code : 200)
        };
    }
};
export class MyException extends thrift.StructLike implements IMyException {
    public message?: string;
    public code?: number = 200;
    public readonly __name = "MyException";
    public readonly _annotations: thrift.IThriftAnnotations = {
        foo: "bar",
        two: "three",
        alone: "",
        'dot.foo': "bar",
        'dot.lonely': ""
    };
    public readonly _fieldAnnotations: thrift.IFieldAnnotations = {
        message: {
            foo: "bar",
            two: "three",
            lonely: "",
            'dot.foo': "bar",
            'dot.lonely': ""
        }
    };
    constructor(args: IMyExceptionArgs = {}) {
        super();
        if (args.message != null) {
            const value_3: string = args.message;
            this.message = value_3;
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
