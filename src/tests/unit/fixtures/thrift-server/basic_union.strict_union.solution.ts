export enum MyUnionType {
    MyUnionWithField1 = "field1",
    MyUnionWithField2 = "field2"
}
export type MyUnion = IMyUnionWithField1 | IMyUnionWithField2;
export interface IMyUnionWithField1 {
    __name: "MyUnion";
    __type: MyUnionType.MyUnionWithField1;
    field1: number;
    field2?: undefined;
}
export interface IMyUnionWithField2 {
    __name: "MyUnion";
    __type: MyUnionType.MyUnionWithField2;
    field1?: undefined;
    field2: thrift.Int64;
}
export type MyUnionArgs = IMyUnionWithField1Args | IMyUnionWithField2Args;
export interface IMyUnionWithField1Args {
    field1: number;
    field2?: undefined;
}
export interface IMyUnionWithField2Args {
    field1?: undefined;
    field2: number | string | thrift.Int64;
}
export const MyUnionCodec: thrift.IStructToolkit<MyUnionArgs, MyUnion> = {
    create(args: MyUnionArgs): MyUnion {
        let _fieldsSet: number = 0;
        let _returnValue: any = null;
        if (args.field1 != null) {
            _fieldsSet++;
            const value_1: number = args.field1;
            _returnValue = { field1: value_1 };
        }
        if (args.field2 != null) {
            _fieldsSet++;
            const value_2: thrift.Int64 = (typeof args.field2 === "number" ? new thrift.Int64(args.field2) : typeof args.field2 === "string" ? thrift.Int64.fromDecimalString(args.field2) : args.field2);
            _returnValue = { field2: value_2 };
        }
        if (_fieldsSet > 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion cannot have more than one value");
        }
        else if (_fieldsSet < 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion must have one value set");
        }
        if (_returnValue !== null) {
            if (_returnValue.field1 !== undefined) {
                return {
                    __name: "MyUnion",
                    __type: MyUnionType.MyUnionWithField1,
                    field1: _returnValue.field1
                };
            }
            else {
                return {
                    __name: "MyUnion",
                    __type: MyUnionType.MyUnionWithField2,
                    field2: _returnValue.field2
                };
            }
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read data for TUnion");
        }
    },
    encode(args: MyUnionArgs, output: thrift.TProtocol): void {
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
    decode(input: thrift.TProtocol): MyUnion {
        let _fieldsSet: number = 0;
        let _returnValue: any = null;
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
                        const value_3: number = input.readI32();
                        _returnValue = { __name: "MyUnion", field1: value_3 };
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.I64) {
                        _fieldsSet++;
                        const value_4: thrift.Int64 = input.readI64();
                        _returnValue = { __name: "MyUnion", field2: value_4 };
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
            if (_returnValue.field1 !== undefined) {
                return {
                    __name: "MyUnion",
                    __type: MyUnionType.MyUnionWithField1,
                    field1: _returnValue.field1
                };
            }
            else {
                return {
                    __name: "MyUnion",
                    __type: MyUnionType.MyUnionWithField2,
                    field2: _returnValue.field2
                };
            }
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read data for TUnion");
        }
    }
};
