export interface IMyUnion {
    __name: "MyUnion";
    option1?: string;
    option2?: bigint;
}
export interface IMyUnionArgs {
    option1?: string;
    option2?: number | string | bigint;
}
export const MyUnionCodec: thrift.IStructCodec<IMyUnionArgs, IMyUnion> = {
    encode(args: IMyUnionArgs, output: thrift.TProtocol): void {
        let _fieldsSet: number = 0;
        const obj = {
            option1: args.option1,
            option2: (typeof args.option2 === "number" ? BigInt(args.option2) : typeof args.option2 === "string" ? BigInt(args.option2) : args.option2)
        };
        output.writeStructBegin("MyUnion");
        if (obj.option1 != null) {
            _fieldsSet++;
            output.writeFieldBegin("option1", thrift.TType.STRING, 1);
            output.writeString(obj.option1);
            output.writeFieldEnd();
        }
        if (obj.option2 != null) {
            _fieldsSet++;
            output.writeFieldBegin("option2", thrift.TType.I64, 2);
            output.writeI64((typeof obj.option2 === "number" ? BigInt(obj.option2) : typeof obj.option2 === "string" ? BigInt(obj.option2) : obj.option2));
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        if (_fieldsSet > 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion cannot have more than one value");
        }
        else if (_fieldsSet < 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion must have one value set");
        }
        return;
    },
    decode(input: thrift.TProtocol): IMyUnion {
        let _fieldsSet: number = 0;
        let _returnValue: IMyUnion | null = null;
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
                        _fieldsSet++;
                        const value_1: string = input.readString();
                        _returnValue = { __name: "MyUnion", option1: value_1 };
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.I64) {
                        _fieldsSet++;
                        const value_2: bigint = input.readI64();
                        _returnValue = { __name: "MyUnion", option2: value_2 };
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
        if (_fieldsSet > 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion cannot have more than one value");
        }
        else if (_fieldsSet < 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion must have one value set");
        }
        if (_returnValue !== null) {
            return _returnValue;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read data for TUnion");
        }
    }
};
export class MyUnion implements thrift.IStructLike, IMyUnion {
    public option1?: string;
    public option2?: bigint;
    public readonly __name = "MyUnion";
    constructor(args: IMyUnionArgs = {}) {
        let _fieldsSet: number = 0;
        if (args.option1 != null) {
            _fieldsSet++;
            const value_3: string = args.option1;
            this.option1 = value_3;
        }
        if (args.option2 != null) {
            _fieldsSet++;
            const value_4: bigint = (typeof args.option2 === "number" ? BigInt(args.option2) : typeof args.option2 === "string" ? BigInt(args.option2) : args.option2);
            this.option2 = value_4;
        }
        if (_fieldsSet > 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion cannot have more than one value");
        }
        else if (_fieldsSet < 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion must have one value set");
        }
    }
    public static read(input: thrift.TProtocol): MyUnion {
        return new MyUnion(MyUnionCodec.decode(input));
    }
    public static write(args: IMyUnionArgs, output: thrift.TProtocol): void {
        return MyUnionCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return MyUnionCodec.encode(this, output);
    }
}
