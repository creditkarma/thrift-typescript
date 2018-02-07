export interface IOtherStructArgs {
    name: string;
}
export class OtherStruct {
    public name: string;
    constructor(args: IOtherStructArgs) {
        if (args != null && args.name != null) {
            this.name = args.name;
        }
        else {
            throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.UNKNOWN, "Required field[name] is unset!");
        }
    }
    public write(output: thrift.TProtocol): void {
        output.writeStructBegin("OtherStruct");
        if (this.name != null) {
            output.writeFieldBegin("name", thrift.Thrift.Type.STRING, 1);
            output.writeString(this.name);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
    public static read(input: thrift.TProtocol): OtherStruct {
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
                    if (fieldType === thrift.Thrift.Type.STRING) {
                        const value_1: string = input.readString();
                        _args.name = value_1;
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
        if (_args.name !== undefined) {
            return new OtherStruct(_args);
        }
        else {
            throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.UNKNOWN, "Unable to read OtherStruct from input");
        }
    }
}
export interface IMyStructArgs {
    field1: Set<OtherStruct>;
}
export class MyStruct {
    public field1: Set<OtherStruct>;
    constructor(args: IMyStructArgs) {
        if (args != null && args.field1 != null) {
            this.field1 = args.field1;
        }
        else {
            throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.UNKNOWN, "Required field[field1] is unset!");
        }
    }
    public write(output: thrift.TProtocol): void {
        output.writeStructBegin("MyStruct");
        if (this.field1 != null) {
            output.writeFieldBegin("field1", thrift.Thrift.Type.SET, 1);
            output.writeSetBegin(thrift.Thrift.Type.STRUCT, this.field1.size);
            this.field1.forEach((value_2: OtherStruct): void => {
                value_2.write(output);
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
                        const value_3: Set<OtherStruct> = new Set<OtherStruct>();
                        const metadata_1: thrift.TSet = input.readSetBegin();
                        const size_1: number = metadata_1.size;
                        for (let i_1: number = 0; i_1 < size_1; i_1++) {
                            const value_4: OtherStruct = OtherStruct.read(input);
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
