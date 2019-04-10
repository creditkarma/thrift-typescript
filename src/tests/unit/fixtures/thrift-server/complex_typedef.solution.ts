export { IMyUnion as IALIAS_UNION };
export { IMyUnionArgs as IALIAS_UNIONArgs };
export { MyUnion as ALIAS_UNION };
export { MyUnionCodec as ALIAS_UNIONCodec };
export { IMyStruct as IALIAS_STRUCT };
export { IMyStructArgs as IALIAS_STRUCTArgs };
export { MyStruct as ALIAS_STRUCT };
export { MyStructCodec as ALIAS_STRUCTCodec };
export interface IMyUnion {
    option1?: number;
    option2?: string;
}
export interface IMyUnionArgs {
    option1?: number;
    option2?: string;
}
export const MyUnionCodec: thrift.IStructCodec<IMyUnionArgs, IMyUnion> = {
    encode(args: IMyUnionArgs, output: thrift.TProtocol): void {
        let _fieldsSet: number = 0;
        const obj = {
            option1: args.option1,
            option2: args.option2
        };
        output.writeStructBegin("MyUnion");
        if (obj.option1 != null) {
            _fieldsSet++;
            output.writeFieldBegin("option1", thrift.TType.I32, 1);
            output.writeI32(obj.option1);
            output.writeFieldEnd();
        }
        if (obj.option2 != null) {
            _fieldsSet++;
            output.writeFieldBegin("option2", thrift.TType.STRING, 2);
            output.writeString(obj.option2);
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
                        _returnValue = { option1: value_1 };
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.STRING) {
                        _fieldsSet++;
                        const value_2: string = input.readString();
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
export class MyUnion extends thrift.StructLike implements IMyUnion {
    public option1?: number;
    public option2?: string;
    public readonly _annotations: thrift.IThriftAnnotations = {};
    public readonly _fieldAnnotations: thrift.IFieldAnnotations = {};
    constructor(args: IMyUnionArgs = {}) {
        super();
        let _fieldsSet: number = 0;
        if (args.option1 != null) {
            _fieldsSet++;
            const value_3: number = args.option1;
            this.option1 = value_3;
        }
        if (args.option2 != null) {
            _fieldsSet++;
            const value_4: string = args.option2;
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
export interface IMyStruct {
    option1?: number;
    option2?: string;
}
export interface IMyStructArgs {
    option1?: number;
    option2?: string;
}
export const MyStructCodec: thrift.IStructCodec<IMyStructArgs, IMyStruct> = {
    encode(args: IMyStructArgs, output: thrift.TProtocol): void {
        let _fieldsSet: number = 0;
        const obj = {
            option1: args.option1,
            option2: args.option2
        };
        output.writeStructBegin("MyStruct");
        if (obj.option1 != null) {
            _fieldsSet++;
            output.writeFieldBegin("option1", thrift.TType.I32, 1);
            output.writeI32(obj.option1);
            output.writeFieldEnd();
        }
        if (obj.option2 != null) {
            _fieldsSet++;
            output.writeFieldBegin("option2", thrift.TType.STRING, 2);
            output.writeString(obj.option2);
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
    decode(input: thrift.TProtocol): IMyStruct {
        let _fieldsSet: number = 0;
        let _returnValue: IMyStruct | null = null;
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
                        const value_5: number = input.readI32();
                        _returnValue = { option1: value_5 };
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.STRING) {
                        _fieldsSet++;
                        const value_6: string = input.readString();
                        _returnValue = { option2: value_6 };
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
export class MyStruct extends thrift.StructLike implements IMyStruct {
    public option1?: number;
    public option2?: string;
    public readonly _annotations: thrift.IThriftAnnotations = {};
    public readonly _fieldAnnotations: thrift.IFieldAnnotations = {};
    constructor(args: IMyStructArgs = {}) {
        super();
        let _fieldsSet: number = 0;
        if (args.option1 != null) {
            _fieldsSet++;
            const value_7: number = args.option1;
            this.option1 = value_7;
        }
        if (args.option2 != null) {
            _fieldsSet++;
            const value_8: string = args.option2;
            this.option2 = value_8;
        }
        if (_fieldsSet > 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion cannot have more than one value");
        }
        else if (_fieldsSet < 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion must have one value set");
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
