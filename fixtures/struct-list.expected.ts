export interface IMyStruct {
    field1: Array<string>;
}
export class MyStruct {
    public field1: Array<string> = null;
    constructor(args?: IMyStruct) {
        if (args && (args.field1 !== null && args.field1 !== undefined)) {
            this.field1 = Array.from(args.field1);
        }
        else {
            throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, "Required field field1 is unset!");
        }
    }
    public write(output: TProtocol): void {
        output.writeStructBegin("MyStruct");
        if (this && (this.field1 !== null && this.field1 !== undefined)) {
            output.writeFieldBegin("field1", Thrift.Type.LIST, 1);
            output.writeListBegin(Thrift.Type.STRING, this.field1.length);
            this.field1.forEach((value_1: string): void => {
                output.writeString(value_1);
            });
            output.writeListEnd();
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
                    if (ftype === Thrift.Type.LIST) {
                        this.field1 = new Array<string>();
                        const metadata_1: {
                            etype: Thrift.Type;
                            size: number;
                        } = input.readListBegin();
                        const size_1: number = metadata_1.size;
                        for (let i_1: number = 0; i_1 < size_1; i_1++) {
                            const value_2: string = input.readString();
                            this.field1.push(value_2);
                        }
                        input.readListEnd();
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
