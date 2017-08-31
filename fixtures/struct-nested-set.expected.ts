export interface IMyStruct {
    field1: Set<Set<string>>;
}
export class MyStruct {
    public field1: Set<Set<string>> = null;
    constructor(args?: IMyStruct) {
        if (!args)
            return;
        if (args.field1 != null) {
            this.field1 = new Set(args.field1);
        }
        else {
            throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, "Required field field1 is unset!");
        }
    }
    public write(output: TProtocol): void {
        output.writeStructBegin("MyStruct");
        if (this.field1 != null) {
            output.writeFieldBegin("field1", Thrift.Type.SET, 1);
            output.writeSetBegin(Thrift.Type.SET, this.field1.size);
            this.field1.forEach((value_1: Set<string>): void => {
                output.writeSetBegin(Thrift.Type.STRING, value_1.size);
                value_1.forEach((value_2: string): void => {
                    output.writeString(value_2);
                });
                output.writeSetEnd();
            });
            output.writeSetEnd();
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
                    if (ftype === Thrift.Type.SET) {
                        this.field1 = new Set<Set<string>>();
                        const metadata_1: {
                            etype: Thrift.Type;
                            size: number;
                        } = input.readSetBegin();
                        const size_1: number = metadata_1.size;
                        for (let i_1: number = 0; i_1 < size_1; i_1++) {
                            const value_3: Set<string> = new Set<string>();
                            const metadata_2: {
                                etype: Thrift.Type;
                                size: number;
                            } = input.readSetBegin();
                            const size_2: number = metadata_2.size;
                            for (let i_2: number = 0; i_2 < size_2; i_2++) {
                                const value_4: string = input.readString();
                                value_3.add(value_4);
                            }
                            input.readSetEnd();
                            this.field1.add(value_3);
                        }
                        input.readSetEnd();
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
