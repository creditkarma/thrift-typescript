export { MyUnionType as ALIAS_UNIONType };
export { MyUnion as ALIAS_UNION };
export { IMyUnionWithOption1 as IALIAS_UNIONWithOption1 };
export { IMyUnionWithOption2 as IALIAS_UNIONWithOption2 };
export { MyUnionArgs as ALIAS_UNIONArgs };
export { IMyUnionWithOption1Args as IALIAS_UNIONWithOption1Args };
export { IMyUnionWithOption2Args as IALIAS_UNIONWithOption2Args };
export { MyUnionCodec as ALIAS_UNIONCodec };
export enum MyUnionType {
    MyUnionWithOption1 = "option1",
    MyUnionWithOption2 = "option2"
}
export type MyUnion = IMyUnionWithOption1 | IMyUnionWithOption2;
export interface IMyUnionWithOption1 {
    __type: MyUnionType.MyUnionWithOption1;
    option1: number;
    option2?: undefined;
}
export interface IMyUnionWithOption2 {
    __type: MyUnionType.MyUnionWithOption2;
    option1?: undefined;
    option2: string;
}
export type MyUnionArgs = IMyUnionWithOption1Args | IMyUnionWithOption2Args;
export interface IMyUnionWithOption1Args {
    option1: number;
    option2?: undefined;
}
export interface IMyUnionWithOption2Args {
    option1?: undefined;
    option2: string;
}
export const MyUnionCodec: thrift.IStructToolkit<MyUnionArgs, MyUnion> = {
    create(args: MyUnionArgs): MyUnion {
        let _fieldsSet: number = 0;
        let _returnValue: any = null;
        if (args.option1 != null) {
            _fieldsSet++;
            const value_1: number = args.option1;
            _returnValue = { option1: value_1 };
        }
        if (args.option2 != null) {
            _fieldsSet++;
            const value_2: string = args.option2;
            _returnValue = { option2: value_2 };
        }
        if (_fieldsSet > 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion cannot have more than one value");
        }
        else if (_fieldsSet < 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion must have one value set");
        }
        if (_returnValue !== null) {
            if (_returnValue.option1) {
                return {
                    __type: MyUnionType.MyUnionWithOption1,
                    option1: _returnValue.option1
                };
            }
            else {
                return {
                    __type: MyUnionType.MyUnionWithOption2,
                    option2: _returnValue.option2
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
                        _returnValue = { option1: value_3 };
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.STRING) {
                        _fieldsSet++;
                        const value_4: string = input.readString();
                        _returnValue = { option2: value_4 };
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
            if (_returnValue.option1) {
                return {
                    __type: MyUnionType.MyUnionWithOption1,
                    option1: _returnValue.option1
                };
            }
            else {
                return {
                    __type: MyUnionType.MyUnionWithOption2,
                    option2: _returnValue.option2
                };
            }
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read data for TUnion");
        }
    }
};
