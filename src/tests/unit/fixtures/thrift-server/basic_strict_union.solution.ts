export type MyUnion = {
    field1: number;
    field2?: undefined;
} | {
    field1?: undefined;
    field2: thrift.Int64;
};
export type MyUnion_Loose = {
    field1: number;
    field2?: undefined;
} | {
    field1?: undefined;
    field2: number | thrift.Int64;
};
export const MyUnionCodec: thrift.IStructCodec<MyUnion_Loose, MyUnion> = {
    encode(args: MyUnion_Loose, output: thrift.TProtocol): void {
        let _fieldsSet: number = 0;
        const obj = {
            field1: args.field1,
            field2: (typeof args.field2 === "number" ? new thrift.Int64(args.field2) : args.field2)
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
            output.writeI64(obj.field2);
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
        let _returnValue: MyUnion | null = null;
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
                        _returnValue = { field1: value_1 };
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.I64) {
                        _fieldsSet++;
                        const value_2: thrift.Int64 = input.readI64();
                        _returnValue = { field2: value_2 };
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
