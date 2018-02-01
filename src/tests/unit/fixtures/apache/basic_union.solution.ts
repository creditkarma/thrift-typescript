export interface IMyUnionArgs {
    field1?: string;
    field2?: string;
}
export class MyUnion {
    public field1?: string;
    public field2?: string;
    constructor(args?: IMyUnionArgs) {
        let _fieldsSet: number = 0;
        if (args != null) {
            if (args.field1 != null) {
                _fieldsSet++;
                this.field1 = args.field1;
            }
            if (args.field2 != null) {
                _fieldsSet++;
                this.field2 = args.field2;
            }
            if (_fieldsSet > 1) {
                throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with more than one set value!");
            }
            else if (_fieldsSet < 1) {
                throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with no set value!");
            }
        }
    }
    public static fromField1(field1: string): MyUnion {
        return new MyUnion({ field1 });
    }
    public static fromField2(field2: string): MyUnion {
        return new MyUnion({ field2 });
    }
    public write(output: thrift.TProtocol): void {
        output.writeStructBegin("MyUnion");
        if (this.field1 != null) {
            output.writeFieldBegin("field1", thrift.Thrift.Type.STRING, 1);
            output.writeString(this.field1);
            output.writeFieldEnd();
        }
        if (this.field2 != null) {
            output.writeFieldBegin("field2", thrift.Thrift.Type.STRING, 2);
            output.writeString(this.field2);
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
            const ret: thrift.TField = input.readFieldBegin();
            const fieldType: thrift.Thrift.Type = ret.ftype;
            const fieldId: number = ret.fid;
            if (fieldType === thrift.Thrift.Type.STOP) {
                break;
            }
            switch (fieldId) {
                case 1:
                    if (fieldType === thrift.Thrift.Type.STRING) {
                        _fieldsSet++;
                        const value_1: string = input.readString();
                        _returnValue = MyUnion.fromField1(value_1);
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.Thrift.Type.STRING) {
                        _fieldsSet++;
                        const value_2: string = input.readString();
                        _returnValue = MyUnion.fromField2(value_2);
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
            throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with more than one set value!");
        }
        else if (_fieldsSet < 1) {
            throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with no set value!");
        }
        if (_returnValue !== null) {
            return _returnValue;
        }
        else {
            throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.UNKNOWN, "Unable to read data for TUnion");
        }
    }
}
