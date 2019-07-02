/* tslint:disable */
/* eslint-disable */
/*
 * Autogenerated by @creditkarma/thrift-typescript v{{VERSION}}
 * DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
*/
import * as thrift from "test-lib";
export interface IOtherCommonUnion {
    __name: "OtherCommonUnion";
    option1?: string;
    option2?: number;
}
export interface IOtherCommonUnionArgs {
    option1?: string;
    option2?: number;
}
export const OtherCommonUnionCodec: thrift.IStructCodec<IOtherCommonUnionArgs, IOtherCommonUnion> = {
    encode(args: IOtherCommonUnionArgs, output: thrift.TProtocol): void {
        let _fieldsSet: number = 0;
        const obj = ({
            option1: args.option1,
            option2: args.option2
        } as IOtherCommonUnionArgs);
        output.writeStructBegin("OtherCommonUnion");
        if (obj.option1 != null) {
            _fieldsSet++;
            output.writeFieldBegin("option1", thrift.TType.STRING, 1);
            output.writeString(obj.option1);
            output.writeFieldEnd();
        }
        if (obj.option2 != null) {
            _fieldsSet++;
            output.writeFieldBegin("option2", thrift.TType.I32, 2);
            output.writeI32(obj.option2);
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
    decode(input: thrift.TProtocol): IOtherCommonUnion {
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
                    if (fieldType === thrift.TType.STRING) {
                        _fieldsSet++;
                        const value_1: string = input.readString();
                        _returnValue = { option1: value_1 };
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.I32) {
                        _fieldsSet++;
                        const value_2: number = input.readI32();
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
            if (_returnValue.option1 !== undefined) {
                return {
                    __name: "OtherCommonUnion",
                    option1: _returnValue.option1
                };
            }
            else {
                return {
                    __name: "OtherCommonUnion",
                    option2: _returnValue.option2
                };
            }
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read data for TUnion");
        }
    }
};
export class OtherCommonUnion extends thrift.StructLike implements IOtherCommonUnion {
    public option1?: string;
    public option2?: number;
    public readonly __name = "OtherCommonUnion";
    public readonly _annotations: thrift.IThriftAnnotations = {};
    public readonly _fieldAnnotations: thrift.IFieldAnnotations = {};
    constructor(args: IOtherCommonUnionArgs = {}) {
        super();
        let _fieldsSet: number = 0;
        if (args.option1 != null) {
            _fieldsSet++;
            const value_3: string = args.option1;
            this.option1 = value_3;
        }
        if (args.option2 != null) {
            _fieldsSet++;
            const value_4: number = args.option2;
            this.option2 = value_4;
        }
        if (_fieldsSet > 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion cannot have more than one value");
        }
        else if (_fieldsSet < 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion must have one value set");
        }
    }
    public static read(input: thrift.TProtocol): OtherCommonUnion {
        return new OtherCommonUnion(OtherCommonUnionCodec.decode(input));
    }
    public static write(args: IOtherCommonUnionArgs, output: thrift.TProtocol): void {
        return OtherCommonUnionCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return OtherCommonUnionCodec.encode(this, output);
    }
}
