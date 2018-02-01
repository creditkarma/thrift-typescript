export interface IMyStructArgs {
    id: number;
    bigID: number | thrift.Int64;
    word: string;
    field1?: number;
    blob?: Buffer;
}
export class MyStruct {
    public id: number = 45;
    public bigID: thrift.Int64 = new thrift.Int64(23948234);
    public word: string;
    public field1?: number;
    public blob?: Buffer = Buffer.from("binary");
    constructor(args: IMyStructArgs) {
        if (args != null && args.id != null) {
            this.id = args.id;
        }
        else {
            throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.UNKNOWN, "Required field id is unset!");
        }
        if (args != null && args.bigID != null) {
            if (typeof args.bigID === "number") {
                this.bigID = new thrift.Int64(args.bigID);
            }
            else {
                this.bigID = args.bigID;
            }
        }
        else {
            throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.UNKNOWN, "Required field bigID is unset!");
        }
        if (args != null && args.word != null) {
            this.word = args.word;
        }
        else {
            throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.UNKNOWN, "Required field word is unset!");
        }
        if (args != null && args.field1 != null) {
            this.field1 = args.field1;
        }
        if (args != null && args.blob != null) {
            this.blob = args.blob;
        }
    }
    public write(output: thrift.TProtocol): void {
        output.writeStructBegin("MyStruct");
        if (this.id != null) {
            output.writeFieldBegin("id", thrift.Thrift.Type.I32, 1);
            output.writeI32(this.id);
            output.writeFieldEnd();
        }
        if (this.bigID != null) {
            output.writeFieldBegin("bigID", thrift.Thrift.Type.I64, 2);
            output.writeI64(this.bigID);
            output.writeFieldEnd();
        }
        if (this.word != null) {
            output.writeFieldBegin("word", thrift.Thrift.Type.STRING, 3);
            output.writeString(this.word);
            output.writeFieldEnd();
        }
        if (this.field1 != null) {
            output.writeFieldBegin("field1", thrift.Thrift.Type.DOUBLE, 4);
            output.writeDouble(this.field1);
            output.writeFieldEnd();
        }
        if (this.blob != null) {
            output.writeFieldBegin("blob", thrift.Thrift.Type.STRING, 5);
            output.writeBinary(this.blob);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
    public static read(input: thrift.TProtocol): MyStruct {
        input.readStructBegin();
        let _args: any = {};
        while (true) {
            const ret: thrift.TField = input.readFieldBegin();
            const fieldType: thrift.Thrift.Type = ret.ftype;
            const fieldId: number = ret.fid;
            if (fieldType === thrift.Thrift.Type.STOP) {
                break;
            }
            switch (fieldId) {
                case 1:
                    if (fieldType === thrift.Thrift.Type.I32) {
                        const value_1: number = input.readI32();
                        _args.id = value_1;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.Thrift.Type.I64) {
                        const value_2: thrift.Int64 = input.readI64();
                        _args.bigID = value_2;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 3:
                    if (fieldType === thrift.Thrift.Type.STRING) {
                        const value_3: string = input.readString();
                        _args.word = value_3;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 4:
                    if (fieldType === thrift.Thrift.Type.DOUBLE) {
                        const value_4: number = input.readDouble();
                        _args.field1 = value_4;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 5:
                    if (fieldType === thrift.Thrift.Type.STRING) {
                        const value_5: Buffer = input.readBinary();
                        _args.blob = value_5;
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
        if (_args.id !== undefined && _args.bigID !== undefined && _args.word !== undefined) {
            return new MyStruct(_args);
        }
        else {
            throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.UNKNOWN, "Unable to read MyStruct from input");
        }
    }
}
