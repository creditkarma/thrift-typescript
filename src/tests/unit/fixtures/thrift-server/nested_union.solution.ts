export interface IOptionArgs {
    option1?: string;
    option2?: string;
}
export class Option implements thrift.StructLike {
    public option1?: string;
    public option2?: string;
    constructor(args?: IOptionArgs) {
        let _fieldsSet: number = 0;
        if (args != null) {
            if (args.option1 != null) {
                _fieldsSet++;
                this.option1 = args.option1;
            }
            if (args.option2 != null) {
                _fieldsSet++;
                this.option2 = args.option2;
            }
            if (_fieldsSet > 1) {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with more than one set value!");
            }
            else if (_fieldsSet < 1) {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with no set value!");
            }
        }
    }
    public static fromOption1(option1: string): Option {
        return new Option({ option1 });
    }
    public static fromOption2(option2: string): Option {
        return new Option({ option2 });
    }
    public write(output: thrift.TProtocol): void {
        output.writeStructBegin("Option");
        if (this.option1 != null) {
            output.writeFieldBegin("option1", thrift.TType.STRING, 1);
            output.writeString(this.option1);
            output.writeFieldEnd();
        }
        if (this.option2 != null) {
            output.writeFieldBegin("option2", thrift.TType.STRING, 2);
            output.writeString(this.option2);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
    public static read(input: thrift.TProtocol): Option {
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
                        const value_1: string = input.readString();
                        _returnValue = Option.fromOption1(value_1);
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.STRING) {
                        _fieldsSet++;
                        const value_2: string = input.readString();
                        _returnValue = Option.fromOption2(value_2);
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
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with more than one set value!");
        }
        else if (_fieldsSet < 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with no set value!");
        }
        if (_returnValue !== null) {
            return _returnValue;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read data for TUnion");
        }
    }
}
export interface IMyUnionArgs {
    name?: string;
    option?: Option;
}
export class MyUnion implements thrift.StructLike {
    public name?: string;
    public option?: Option;
    constructor(args?: IMyUnionArgs) {
        let _fieldsSet: number = 0;
        if (args != null) {
            if (args.name != null) {
                _fieldsSet++;
                this.name = args.name;
            }
            if (args.option != null) {
                _fieldsSet++;
                this.option = args.option;
            }
            if (_fieldsSet > 1) {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with more than one set value!");
            }
            else if (_fieldsSet < 1) {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with no set value!");
            }
        }
    }
    public static fromName(name: string): MyUnion {
        return new MyUnion({ name });
    }
    public static fromOption(option: Option): MyUnion {
        return new MyUnion({ option });
    }
    public write(output: thrift.TProtocol): void {
        output.writeStructBegin("MyUnion");
        if (this.name != null) {
            output.writeFieldBegin("name", thrift.TType.STRING, 1);
            output.writeString(this.name);
            output.writeFieldEnd();
        }
        if (this.option != null) {
            output.writeFieldBegin("option", thrift.TType.STRUCT, 2);
            this.option.write(output);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
    public static read(input: thrift.TProtocol): MyUnion {
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
                        _returnValue = MyUnion.fromName(value_3);
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.STRUCT) {
                        _fieldsSet++;
                        const value_4: Option = Option.read(input);
                        _returnValue = MyUnion.fromOption(value_4);
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
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with more than one set value!");
        }
        else if (_fieldsSet < 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with no set value!");
        }
        if (_returnValue !== null) {
            return _returnValue;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read data for TUnion");
        }
    }
}
