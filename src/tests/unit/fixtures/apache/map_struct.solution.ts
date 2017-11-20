export interface IMyStructArgs {
    field1: Map<string, string>;
}
export class MyStruct implements thrift.TStructLike {
    public field1: Map<string, string>;
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
            output.writeFieldBegin("field1", thrift.Thrift.Type.MAP, 1);
            output.writeMapBegin(thrift.Thrift.Type.STRING, thrift.Thrift.Type.STRING, this.field1.size);
            this.field1.forEach((value_1: string, key_1: string): void => {
                output.writeString(key_1);
                output.writeString(value_1);
            });
            output.writeMapEnd();
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
                    if (ftype === thrift.Thrift.Type.MAP) {
                        const value_2: Map<string, string> = new Map<string, string>();
                        const metadata_1: {
                            ktype: thrift.Thrift.Type;
                            vtype: thrift.Thrift.Type;
                            size: number;
                        } = input.readMapBegin();
                        const size_1: number = metadata_1.size;
                        for (let i_1: number = 0; i_1 < size_1; i_1++) {
                            const key_2: string = input.readString();
                            const value_3: string = input.readString();
                            value_2.set(key_2, value_3);
                        }
                        input.readMapEnd();
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
