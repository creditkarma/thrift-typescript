export interface IMyStructArgs {
    id: number;
    bigID: Int64;
    word: string;
    field1?: number;
}
export class MyStruct {
    public id: number = 45;
    public bigID: Int64 = new Int64(23948234);
    public word: string;
    public field1: number;
    constructor(args?: IMyStructArgs) {
        if (args != null) {
            if (args.id != null) {
                this.id = args.id;
            }
            else {
                throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, "Required field id is unset!");
            }
            if (args.bigID != null) {
                this.bigID = args.bigID;
            }
            else {
                throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, "Required field bigID is unset!");
            }
            if (args.word != null) {
                this.word = args.word;
            }
            else {
                throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, "Required field word is unset!");
            }
            if (args.field1 != null) {
                this.field1 = args.field1;
            }
        }
    }
    public write(output: TProtocol): void {
        output.writeStructBegin("MyStruct");
        if (this.id != null) {
            output.writeFieldBegin("id", Thrift.Type.I32, 1);
            output.writeI32(this.id);
            output.writeFieldEnd();
        }
        if (this.bigID != null) {
            output.writeFieldBegin("bigID", Thrift.Type.I64, 2);
            output.writeI64(this.bigID);
            output.writeFieldEnd();
        }
        if (this.word != null) {
            output.writeFieldBegin("word", Thrift.Type.STRING, 3);
            output.writeString(this.word);
            output.writeFieldEnd();
        }
        if (this.field1 != null) {
            output.writeFieldBegin("field1", Thrift.Type.DOUBLE, 4);
            output.writeDouble(this.field1);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
    public read(input: TProtocol): void {
        input.readStructBegin();
        while (true) {
            const ret: {
                fname: string;
                ftype: Thrift.Type;
                fid: number;
            } = input.readFieldBegin();
            const ftype: Thrift.Type = ret.ftype;
            const fid: number = ret.fid;
            if (ftype === Thrift.Type.STOP) {
                break;
            }
            switch (fid) {
                case 1:
                    if (ftype === Thrift.Type.I32) {
                        const value_1: number = input.readI32();
                        this.id = value_1;
                    }
                    else {
                        input.skip(ftype);
                    }
                    break;
                case 2:
                    if (ftype === Thrift.Type.I64) {
                        const value_2: Int64 = input.readI64();
                        this.bigID = value_2;
                    }
                    else {
                        input.skip(ftype);
                    }
                    break;
                case 3:
                    if (ftype === Thrift.Type.STRING) {
                        const value_3: string = input.readString();
                        this.word = value_3;
                    }
                    else {
                        input.skip(ftype);
                    }
                    break;
                case 4:
                    if (ftype === Thrift.Type.DOUBLE) {
                        const value_4: number = input.readDouble();
                        this.field1 = value_4;
                    }
                    else {
                        input.skip(ftype);
                    }
                    break;
                default: {
                    input.skip(ftype);
                }
            }
            input.readFieldEnd();
        }
        input.readStructEnd();
        return;
    }
}
