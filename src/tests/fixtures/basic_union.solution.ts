import { Thrift, TProtocol, TTransport } from "thrift";
export interface IMyUnionArgs {
    field1?: string;
    field2?: string;
}
export class MyUnion {
    public field1: string = null;
    public field2: string = null;
    constructor(args?: IMyUnionArgs) {
        let fieldsSet: number = 0;
        if (args != null) {
            if (args.field1 != null) {
                fieldsSet++;
                this.field1 = args.field1;
            }
            if (args.field2 != null) {
                fieldsSet++;
                this.field2 = args.field2;
            }
            if (fieldsSet > 1) {
                throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with more than one set value!");
            }
            else if (fieldsSet < 1) {
                throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with no set value!");
            }
        }
    }
    public write(output: TProtocol): void {
        output.writeStructBegin("MyUnion");
        if (this.field1 != null) {
            output.writeFieldBegin("field1", Thrift.Type.STRING, 1);
            output.writeString(this.field1);
            output.writeFieldEnd();
        }
        if (this.field2 != null) {
            output.writeFieldBegin("field2", Thrift.Type.STRING, 2);
            output.writeString(this.field2);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
    public read(input: TProtocol): void {
        let fieldsSet: number = 0;
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
                    if (ftype === Thrift.Type.STRING) {
                        fieldsSet++;
                        this.field1 = input.readString();
                    }
                    else {
                        input.skip(ftype);
                    }
                    break;
                case 2:
                    if (ftype === Thrift.Type.STRING) {
                        fieldsSet++;
                        this.field2 = input.readString();
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
        if (fieldsSet > 1) {
            throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with more than one set value!");
        }
        else if (fieldsSet < 1) {
            throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with no set value!");
        }
    }
}
