export interface IOption {
    __name: "Option";
    option1?: Buffer;
    option2?: thrift.Int64;
}
export interface IOptionArgs {
    option1?: string | Buffer;
    option2?: number | string | thrift.Int64;
}
export const OptionCodec: thrift.IStructCodec<IOptionArgs, IOption> = {
    encode(args: IOptionArgs, output: thrift.TProtocol): void {
        let _fieldsSet: number = 0;
        const obj = {
            option1: (typeof args.option1 === "string" ? Buffer.from(args.option1) : args.option1),
            option2: (typeof args.option2 === "number" ? new thrift.Int64(args.option2) : typeof args.option2 === "string" ? thrift.Int64.fromDecimalString(args.option2) : args.option2)
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
            output.writeI64((typeof obj.option2 === "number" ? new thrift.Int64(obj.option2) : typeof obj.option2 === "string" ? thrift.Int64.fromDecimalString(obj.option2) : obj.option2));
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
    decode(input: thrift.TProtocol): IOption {
        let _fieldsSet: number = 0;
        let _returnValue: IOption | null = null;
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
                        _returnValue = { __name: "Option", option1: value_1 };
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.I64) {
                        _fieldsSet++;
                        const value_2: thrift.Int64 = input.readI64();
                        _returnValue = { __name: "Option", option2: value_2 };
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
export class Option extends thrift.StructLike implements IOption {
    public option1?: Buffer;
    public option2?: thrift.Int64;
    public readonly __name = "Option";
    public readonly _annotations: thrift.IThriftAnnotations = {};
    public readonly _fieldAnnotations: thrift.IFieldAnnotations = {};
    constructor(args: IOptionArgs = {}) {
        super();
        let _fieldsSet: number = 0;
        if (args.option1 != null) {
            _fieldsSet++;
            const value_3: Buffer = (typeof args.option1 === "string" ? Buffer.from(args.option1) : args.option1);
            this.option1 = value_3;
        }
        if (args.option2 != null) {
            _fieldsSet++;
            const value_4: thrift.Int64 = (typeof args.option2 === "number" ? new thrift.Int64(args.option2) : typeof args.option2 === "string" ? thrift.Int64.fromDecimalString(args.option2) : args.option2);
            this.option2 = value_4;
        }
        if (_fieldsSet > 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion cannot have more than one value");
        }
        else if (_fieldsSet < 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion must have one value set");
        }
    }
    public static read(input: thrift.TProtocol): Option {
        return new Option(OptionCodec.decode(input));
    }
    public static write(args: IOptionArgs, output: thrift.TProtocol): void {
        return OptionCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return OptionCodec.encode(this, output);
    }
}
export interface IMyUnion {
    __name: "MyUnion";
    name?: string;
    option?: IOption;
}
export interface IMyUnionArgs {
    name?: string;
    option?: IOptionArgs;
}
export const MyUnionCodec: thrift.IStructCodec<IMyUnionArgs, IMyUnion> = {
    encode(args: IMyUnionArgs, output: thrift.TProtocol): void {
        let _fieldsSet: number = 0;
        const obj = {
            name: args.name,
            option: args.option
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
                        const value_5: string = input.readString();
                        _returnValue = { __name: "MyUnion", name: value_5 };
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.STRUCT) {
                        _fieldsSet++;
                        const value_6: IOption = OptionCodec.decode(input);
                        _returnValue = { __name: "MyUnion", option: value_6 };
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
    public name?: string;
    public option?: IOption;
    public readonly __name = "MyUnion";
    public readonly _annotations: thrift.IThriftAnnotations = {};
    public readonly _fieldAnnotations: thrift.IFieldAnnotations = {};
    constructor(args: IMyUnionArgs = {}) {
        super();
        let _fieldsSet: number = 0;
        if (args.name != null) {
            _fieldsSet++;
            const value_7: string = args.name;
            this.name = value_7;
        }
        if (args.option != null) {
            _fieldsSet++;
            const value_8: IOption = new Option(args.option);
            this.option = value_8;
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
