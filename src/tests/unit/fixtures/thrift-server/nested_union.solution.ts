export interface IOption {
    option1?: Buffer;
    option2?: thrift.Int64;
}
export interface IOption_Loose {
    option1?: string | Buffer;
    option2?: number | thrift.Int64;
}
export class Option extends thrift.IStructLike  implements IOption_Loose {
    public option1?: string | Buffer;
    public option2?: number | thrift.Int64;
    constructor(args: IOption_Loose) {
        super();
        let _fieldsSet: number = 0;
        if (args.option1 != null) {
            _fieldsSet++;
            this.option1 = args.option1;
        }
        if (args.option2 != null) {
            _fieldsSet++;
            this.option2 = args.option2;
        }
        if (_fieldsSet > 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion cannot have more than one value");
        }
        else if (_fieldsSet < 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion must have one value set");
        }
    }
    public static write(args: IOption_Loose, output: thrift.TProtocol): void {
        let _fieldsSet: number = 0;
        const obj = {
            option1: (typeof args.option1 === "string" ? Buffer.from(args.option1) : args.option1),
            option2: (typeof args.option2 === "number" ? new thrift.Int64(args.option2) : args.option2)
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
    }
    public static read(input: thrift.TProtocol): IOption {
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
}
export interface IMyUnion {
    name?: string;
    option?: IOption;
}
export interface IMyUnion_Loose {
    name?: string;
    option?: IOption_Loose;
}
export class MyUnion extends thrift.IStructLike  implements IMyUnion_Loose {
    public name?: string;
    public option?: IOption_Loose;
    constructor(args: IMyUnion_Loose) {
        super();
        let _fieldsSet: number = 0;
        if (args.name != null) {
            _fieldsSet++;
            this.name = args.name;
        }
        if (args.option != null) {
            _fieldsSet++;
            this.option = args.option;
        }
        if (_fieldsSet > 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion cannot have more than one value");
        }
        else if (_fieldsSet < 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion must have one value set");
        }
    }
    public static write(args: IMyUnion_Loose, output: thrift.TProtocol): void {
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
            Option.write(obj.option, output);
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
    }
    public static read(input: thrift.TProtocol): IMyUnion {
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
                        const value_4: IOption = Option.read(input);
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
}
