export interface Option {
    option1?: Buffer;
    option2?: thrift.Int64;
}
export interface Option_Loose {
    option1?: string | Buffer;
    option2?: number | thrift.Int64;
}
export const OptionCodec: thrift.IStructCodec<Option> = {
    encode(val: Option_Loose, output: thrift.TProtocol): void {
        let _fieldsSet: number = 0;
        const obj = {
            option1: (typeof val.option1 === "string" ? Buffer.from(val.option1) : val.option1),
            option2: (typeof val.option2 === "number" ? new thrift.Int64(val.option2) : val.option2)
        };
        output.writeStructBegin("Option");
        if (obj.option1 != null) {
            _fieldsSet++;
            output.writeFieldBegin("option1", thrift.TType.STRING, 1);
            output.writeBinary(obj.option1);
            output.writeFieldEnd();
        }
        if (obj.option2 != null) {
            _fieldsSet++;
            output.writeFieldBegin("option2", thrift.TType.I64, 2);
            output.writeI64(obj.option2);
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
    decode(input: thrift.TProtocol): Option {
        let _fieldsSet: number = 0;
        let _returnValue: Option | null = null;
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
                        const value_1: Buffer = input.readBinary();
                        _returnValue = { option1: value_1 };
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.I64) {
                        _fieldsSet++;
                        const value_2: thrift.Int64 = input.readI64();
                        _returnValue = { option2: value_2 };
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
export interface MyUnion {
    name?: string;
    option?: Option;
}
export interface MyUnion_Loose {
    name?: string;
    option?: Option;
}
export const MyUnionCodec: thrift.IStructCodec<MyUnion> = {
    encode(val: MyUnion_Loose, output: thrift.TProtocol): void {
        let _fieldsSet: number = 0;
        const obj = {
            name: val.name,
            option: val.option
        };
        output.writeStructBegin("MyUnion");
        if (obj.name != null) {
            _fieldsSet++;
            output.writeFieldBegin("name", thrift.TType.STRING, 1);
            output.writeString(obj.name);
            output.writeFieldEnd();
        }
        if (obj.option != null) {
            _fieldsSet++;
            output.writeFieldBegin("option", thrift.TType.STRUCT, 2);
            OptionCodec.encode(obj.option, output);
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
                    if (fieldType === thrift.TType.STRING) {
                        _fieldsSet++;
                        const value_3: string = input.readString();
                        _returnValue = { name: value_3 };
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.STRUCT) {
                        _fieldsSet++;
                        const value_4: Option = OptionCodec.decode(input);
                        _returnValue = { option: value_4 };
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
