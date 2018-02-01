export interface IMyUnionArgs {
    field1?: string;
    field2?: Array<Array<string>>;
}
export class MyUnion {
    public field1?: string;
    public field2?: Array<Array<string>>;
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
    public static fromField2(field2: Array<Array<string>>): MyUnion {
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
            output.writeFieldBegin("field2", thrift.Thrift.Type.LIST, 2);
            output.writeListBegin(thrift.Thrift.Type.LIST, this.field2.length);
            this.field2.forEach((value_1: Array<string>): void => {
                output.writeListBegin(thrift.Thrift.Type.STRING, value_1.length);
                value_1.forEach((value_2: string): void => {
                    output.writeString(value_2);
                });
                output.writeListEnd();
            });
            output.writeListEnd();
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
                        const value_3: string = input.readString();
                        _returnValue = MyUnion.fromField1(value_3);
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.Thrift.Type.LIST) {
                        _fieldsSet++;
                        const value_4: Array<Array<string>> = new Array<Array<string>>();
                        const metadata_1: thrift.TList = input.readListBegin();
                        const size_1: number = metadata_1.size;
                        for (let i_1: number = 0; i_1 < size_1; i_1++) {
                            const value_5: Array<string> = new Array<string>();
                            const metadata_2: thrift.TList = input.readListBegin();
                            const size_2: number = metadata_2.size;
                            for (let i_2: number = 0; i_2 < size_2; i_2++) {
                                const value_6: string = input.readString();
                                value_5.push(value_6);
                            }
                            input.readListEnd();
                            value_4.push(value_5);
                        }
                        input.readListEnd();
                        _returnValue = MyUnion.fromField2(value_4);
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
