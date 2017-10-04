export interface IMyStructArgs {
    field1: Set<string>;
}
export class MyStruct {
    public field1: Set<string>;
    constructor(args?: IMyStructArgs) {
        if (args != null) {
            if (args.field1 != null) {
                this.field1 = args.field1;
            }
            else {
                throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.UNKNOWN, "Required field field1 is unset!");
            }
        }
    }
    public write(output: thrift.TProtocol): void {
        output.writeStructBegin("MyStruct");
        if (this.field1 != null) {
            output.writeFieldBegin("field1", thrift.Thrift.Type.SET, 1);
            output.writeSetBegin(thrift.Thrift.Type.STRING, this.field1.size);
            this.field1.forEach((value_1: string): void => {
                output.writeString(value_1);
            });
            output.writeSetEnd();
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
    public read(input: thrift.TProtocol): void {
        input.readStructBegin();
        while (true) {
            const ret: {
                fname: string;
                ftype: thrift.Thrift.Type;
                fid: number;
            } = input.readFieldBegin();
            const ftype: thrift.Thrift.Type = ret.ftype;
            const fid: number = ret.fid;
            if (ftype === thrift.Thrift.Type.STOP) {
                break;
            }
            switch (fid) {
                case 1:
                    if (ftype === thrift.Thrift.Type.SET) {
                        const value_2: Set<string> = new Set<string>();
                        const metadata_1: {
                            etype: thrift.Thrift.Type;
                            size: number;
                        } = input.readSetBegin();
                        const size_1: number = metadata_1.size;
                        for (let i_1: number = 0; i_1 < size_1; i_1++) {
                            const value_3: string = input.readString();
                            value_2.add(value_3);
                        }
                        input.readSetEnd();
                        this.field1 = value_2;
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
