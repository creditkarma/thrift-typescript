export interface IMyStruct {
    id: number;
    bigID: thrift.Int64;
}
export interface IMyStructArgs {
    id?: number;
    bigID?: number | string | thrift.Int64;
}
export const MyStructCodec: thrift.IStructCodec<IMyStructArgs, IMyStruct> = {
    encode(args: IMyStructArgs, output: thrift.TProtocol): void {
        const obj = {
            id: (args.id != null ? args.id : 45),
            bigID: (args.bigID != null ? (typeof args.bigID === "number" ? new thrift.Int64(args.bigID) : typeof args.bigID === "string" ? thrift.Int64.fromDecimalString(args.bigID) : args.bigID) : thrift.Int64.fromDecimalString("23948234"))
        };
        output.writeStructBegin("MyStruct");
        if (obj.id != null) {
            output.writeFieldBegin("id", thrift.TType.I32, 1);
            output.writeI32(obj.id);
            output.writeFieldEnd();
        }
        if (obj.bigID != null) {
            output.writeFieldBegin("bigID", thrift.TType.I64, 2);
            output.writeI64((typeof obj.bigID === "number" ? new thrift.Int64(obj.bigID) : typeof obj.bigID === "string" ? thrift.Int64.fromDecimalString(obj.bigID) : obj.bigID));
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): IMyStruct {
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
                        _args.id = value_1;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.I64) {
                        const value_2: thrift.Int64 = input.readI64();
                        _args.bigID = value_2;
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
        if (_args.id !== undefined && _args.bigID !== undefined) {
            return {
                id: (_args.id != null ? _args.id : 45),
                bigID: (_args.bigID != null ? _args.bigID : thrift.Int64.fromDecimalString("23948234"))
            };
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read MyStruct from input");
        }
    }
};
export class MyStruct extends thrift.StructLike implements IMyStruct {
    public id: number = 45;
    public bigID: thrift.Int64 = thrift.Int64.fromDecimalString("23948234");
    public readonly _annotations: thrift.IThriftAnnotations = {
        foo: "bar",
        two: "three",
        alone: "",
        'dot.foo': "bar",
        'dot.lonely': ""
    };
    public readonly _fieldAnnotations: thrift.IFieldAnnotations = {
        id: {
            foo: "bar",
            two: "three",
            lonely: "",
            'dot.foo': "bar",
            'dot.lonely': ""
        }
    };
    constructor(args: IMyStructArgs) {
        super();
        if (args.id != null) {
            const value_3: number = args.id;
            this.id = value_3;
        }
        if (args.bigID != null) {
            const value_4: thrift.Int64 = (typeof args.bigID === "number" ? new thrift.Int64(args.bigID) : typeof args.bigID === "string" ? thrift.Int64.fromDecimalString(args.bigID) : args.bigID);
            this.bigID = value_4;
        }
    }
    public static read(input: thrift.TProtocol): MyStruct {
        return new MyStruct(MyStructCodec.decode(input));
    }
    public static write(args: IMyStructArgs, output: thrift.TProtocol): void {
        return MyStructCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return MyStructCodec.encode(this, output);
    }
}
