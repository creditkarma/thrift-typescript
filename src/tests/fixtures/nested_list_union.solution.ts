export interface IMyUnionArgs {
    field1?: string;
    field2?: Array<Array<string>>;
}
export class MyUnion {
    public field1: string;
    public field2: Array<Array<string>>;
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
            output.writeFieldBegin("field2", Thrift.Type.LIST, 2);
            output.writeListBegin(Thrift.Type.LIST, this.field2.length);
            this.field2.forEach((value_1: Array<string>): void => {
                output.writeListBegin(Thrift.Type.STRING, value_1.length);
                value_1.forEach((value_2: string): void => {
                    output.writeString(value_2);
                });
                output.writeListEnd();
            });
            output.writeListEnd();
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
            const ftype: Thrift.Type = ret.ftype;
            const fid: number = ret.fid;
            if (ftype === Thrift.Type.STOP) {
                break;
            }
            switch (fid) {
                case 1:
                    if (ftype === Thrift.Type.STRING) {
                        fieldsSet++;
                        const value_3: string = input.readString();
                        this.field1 = value_3;
                    }
                    else {
                        input.skip(ftype);
                    }
                    break;
                case 2:
                    if (ftype === Thrift.Type.LIST) {
                        fieldsSet++;
                        const value_4: Array<Array<string>> = new Array<Array<string>>();
                        const metadata_1: {
                            etype: Thrift.Type;
                            size: number;
                        } = input.readListBegin();
                        const size_1: number = metadata_1.size;
                        for (let i_1: number = 0; i_1 < size_1; i_1++) {
                            const value_5: Array<string> = new Array<string>();
                            const metadata_2: {
                                etype: Thrift.Type;
                                size: number;
                            } = input.readListBegin();
                            const size_2: number = metadata_2.size;
                            for (let i_2: number = 0; i_2 < size_2; i_2++) {
                                const value_6: string = input.readString();
                                value_5.push(value_6);
                            }
                            input.readListEnd();
                            value_4.push(value_5);
                        }
                        input.readListEnd();
                        this.field2 = value_4;
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
