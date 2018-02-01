export interface IMyStructArgs {
    field1: Set<Set<string>>;
}
export class MyStruct {
    public field1: Set<Set<string>>;
    constructor(args: IMyStructArgs) {
        if (args != null && args.field1 != null) {
            this.field1 = args.field1;
        }
        else {
            throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.UNKNOWN, "Required field field1 is unset!");
        }
    }
    public write(output: thrift.TProtocol): void {
        output.writeStructBegin("MyStruct");
        if (this.field1 != null) {
            output.writeFieldBegin("field1", thrift.Thrift.Type.SET, 1);
            output.writeSetBegin(thrift.Thrift.Type.SET, this.field1.size);
            this.field1.forEach((value_1: Set<string>): void => {
                output.writeSetBegin(thrift.Thrift.Type.STRING, value_1.size);
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
                    if (fieldType === thrift.Thrift.Type.SET) {
                        const value_3: Set<Set<string>> = new Set<Set<string>>();
                        const metadata_1: thrift.TSet = input.readSetBegin();
                        const size_1: number = metadata_1.size;
                        for (let i_1: number = 0; i_1 < size_1; i_1++) {
                            const value_4: Set<string> = new Set<string>();
                            const metadata_2: thrift.TSet = input.readSetBegin();
                            const size_2: number = metadata_2.size;
                            for (let i_2: number = 0; i_2 < size_2; i_2++) {
                                const value_5: string = input.readString();
                                value_4.add(value_5);
                            }
                            input.readSetEnd();
                            value_3.add(value_4);
                        }
                        input.readSetEnd();
                        _args.field1 = value_3;
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
        if (_args.field1 !== undefined) {
            return new MyStruct(_args);
        }
        else {
            throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.UNKNOWN, "Unable to read MyStruct from input");
        }
    }
}
