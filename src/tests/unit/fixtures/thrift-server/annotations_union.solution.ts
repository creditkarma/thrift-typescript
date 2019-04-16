export interface IMyUnion {
    __name: "MyUnion";
    field1?: number;
    field2?: thrift.Int64;
}
export interface IMyUnionArgs {
    field1?: number;
    field2?: number | string | thrift.Int64;
}
export const MyUnionCodec: thrift.IStructCodec<IMyUnionArgs, IMyUnion> = {
    encode(args: IMyUnionArgs, output: thrift.TProtocol): void {
        let _fieldsSet: number = 0;
        const obj = {
            field1: args.field1,
            field2: (typeof args.field2 === "number" ? new thrift.Int64(args.field2) : typeof args.field2 === "string" ? thrift.Int64.fromDecimalString(args.field2) : args.field2)
        };
        output.writeStructBegin("MyUnion");
        if (obj.field1 != null) {
            _fieldsSet++;
            output.writeFieldBegin("field1", thrift.TType.I32, 1);
            output.writeI32(obj.field1);
            output.writeFieldEnd();
        }
        if (obj.field2 != null) {
            _fieldsSet++;
            output.writeFieldBegin("field2", thrift.TType.I64, 2);
            output.writeI64((typeof obj.field2 === "number" ? new thrift.Int64(obj.field2) : typeof obj.field2 === "string" ? thrift.Int64.fromDecimalString(obj.field2) : obj.field2));
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
                    if (fieldType === thrift.TType.I32) {
                        _fieldsSet++;
                        const value_1: number = input.readI32();
                        _returnValue = { __name: "MyUnion", field1: value_1 };
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.I64) {
                        _fieldsSet++;
                        const value_2: thrift.Int64 = input.readI64();
                        _returnValue = { __name: "MyUnion", field2: value_2 };
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
export class MyUnion extends thrift.StructLike implements IMyUnion {
    public field1?: number;
    public field2?: thrift.Int64;
    public readonly __name = "MyUnion";
    public readonly _annotations: thrift.IThriftAnnotations = {
        foo: "bar",
        two: "three",
        alone: "",
        'dot.foo': "bar",
        'dot.lonely': ""
    };
    public readonly _fieldAnnotations: thrift.IFieldAnnotations = {
        field1: {
            foo: "bar",
            two: "three",
            lonely: "",
            'dot.foo': "bar",
            'dot.lonely': ""
        }
    };
    constructor(args: IMyUnionArgs = {}) {
        super();
        let _fieldsSet: number = 0;
        if (args.field1 != null) {
            _fieldsSet++;
            const value_3: number = args.field1;
            this.field1 = value_3;
        }
        if (args.field2 != null) {
            _fieldsSet++;
            const value_4: thrift.Int64 = (typeof args.field2 === "number" ? new thrift.Int64(args.field2) : typeof args.field2 === "string" ? thrift.Int64.fromDecimalString(args.field2) : args.field2);
            this.field2 = value_4;
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
