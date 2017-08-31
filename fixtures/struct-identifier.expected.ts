export interface IMyStruct {
    field1: OtherStruct;
}
export class MyStruct {
    public field1: OtherStruct = null;
    constructor(args?: IMyStruct) {
        if (args && (args.field1 !== null && args.field1 !== undefined)) {
            this.field1 = args.field1;
        }
        else {
            throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, "Required field field1 is unset!");
        }
    }
    public write(output: TProtocol): void {
        output.writeStructBegin("MyStruct");
        if (this && (this.field1 !== null && this.field1 !== undefined)) {
            output.writeFieldBegin("field1", Thrift.Type.STRUCT, 1);
            this.field1.write(output);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
    }
    public read(input: TProtocol): void {
        input.readStructBegin();
        while (true) {
            const ret: {
                fname: string;
                ftype: Thrift.Type;
                fid: number;
            } = input.readFieldBegin();
            const fname: string = ret.fname;
            const ftype: Thrift.Type = ret.ftype;
            const fid: number = ret.fid;
            if (ftype === Thrift.Type.STOP) {
                break;
            }
            switch (fid) {
                case 1:
                    if (ftype === Thrift.Type.STRUCT) {
                        this.field1 = new OtherStruct();
                        this.field1.read(input);
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
    }
};
