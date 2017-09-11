import { Thrift, TProtocol, TTransport } from "thrift";
export interface IMyStructArgs {
    field1: OtherStruct;
}
export class MyStruct {
    public field1: OtherStruct = null;
    constructor(args?: IMyStructArgs) {
        if (args != null) {
            if (args.field1 != null) {
                this.field1 = args.field1;
            }
            else {
                throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, "Required field field1 is unset!");
            }
        }
    }
    public write(output: TProtocol): void {
        output.writeStructBegin("MyStruct");
        if (this.field1 != null) {
            output.writeFieldBegin("field1", Thrift.Type.STRUCT, 1);
            this.field1.write(output);
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
        return;
    }
}
