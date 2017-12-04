export interface IMyUnionArgs {
    field1?: string;
    field2?: number | thrift.Int64;
}
export class MyUnion implements thrift.IStructLike {
    public field1: string;
    public field2: thrift.Int64;
    constructor(args?: IMyUnionArgs) {
        let fieldsSet: number = 0;
        if (args != null) {
            if (args.field1 != null) {
                fieldsSet++;
                this.field1 = args.field1;
            }
            if (args.field2 != null) {
                fieldsSet++;
                if (typeof args.field2 === "number") {
                    this.field2 = new thrift.Int64(args.field2);
                }
                else {
                    this.field2 = args.field2;
                }
            }
            if (fieldsSet > 1) {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with more than one set value!");
            }
            else if (fieldsSet < 1) {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with no set value!");
            }
        }
    }
    public static fromField1(field1: string): MyUnion {
        return new MyUnion({ field1 });
    }
    public static fromField2(field2: thrift.Int64): MyUnion {
        return new MyUnion({ field2 });
    }
    public write(output: thrift.TProtocol): void {
        output.writeStructBegin("MyUnion");
        if (this.field1 != null) {
            output.writeFieldBegin("field1", thrift.TType.STRING, 1);
            output.writeString(this.field1);
            output.writeFieldEnd();
        }
        if (this.field2 != null) {
            output.writeFieldBegin("field2", thrift.TType.I64, 2);
            output.writeI64(this.field2);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
    public read(input: thrift.TProtocol): void {
        let fieldsSet: number = 0;
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
                        fieldsSet++;
                        const value_1: string = input.readString();
                        this.field1 = value_1;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.I64) {
                        fieldsSet++;
                        const value_2: thrift.Int64 = input.readI64();
                        this.field2 = value_2;
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
        if (fieldsSet > 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with more than one set value!");
        }
        else if (fieldsSet < 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with no set value!");
        }
    }
}
