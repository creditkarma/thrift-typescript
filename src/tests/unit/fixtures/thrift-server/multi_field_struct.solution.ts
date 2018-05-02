export interface IMyStruct {
    id: number;
    bigID: thrift.Int64;
    word: string;
    field1?: number;
    blob?: Buffer;
}
export interface IMyStruct_Loose {
    id?: number;
    bigID?: number | thrift.Int64;
    word: string;
    field1?: number;
    blob?: string | Buffer;
}
export const MyStructCodec: thrift.IStructCodec<IMyStruct_Loose, IMyStruct> = {
    encode(args: IMyStruct_Loose, output: thrift.TProtocol): void {
        const obj = {
            id: (args.id != null ? args.id : 45),
            bigID: (args.bigID != null ? (typeof args.bigID === "number" ? new thrift.Int64(args.bigID) : args.bigID) : thrift.Int64.fromDecimalString("23948234")),
            word: args.word,
            field1: args.field1,
            blob: (args.blob != null ? (typeof args.blob === "string" ? Buffer.from(args.blob) : args.blob) : Buffer.from("binary"))
        };
        output.writeStructBegin("MyStruct");
        if (obj.id != null) {
            output.writeFieldBegin("id", thrift.TType.I32, 1);
            output.writeI32(obj.id);
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[id] is unset!");
        }
        if (obj.bigID != null) {
            output.writeFieldBegin("bigID", thrift.TType.I64, 2);
            output.writeI64(obj.bigID);
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[bigID] is unset!");
        }
        if (obj.word != null) {
            output.writeFieldBegin("word", thrift.TType.STRING, 3);
            output.writeString(obj.word);
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[word] is unset!");
        }
        if (obj.field1 != null) {
            output.writeFieldBegin("field1", thrift.TType.DOUBLE, 4);
            output.writeDouble(obj.field1);
            output.writeFieldEnd();
        }
        if (obj.blob != null) {
            output.writeFieldBegin("blob", thrift.TType.STRING, 5);
            output.writeBinary(obj.blob);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): IMyStruct {
        let _args: any = {};
        input.readStructBegin();
        while (true) {
            const ret: thrift.IThriftField = input.readFieldBegin();
            const fieldType: thrift.TType = ret.fieldType;
            const fieldId: number = ret.fieldId;
            if (fieldType === thrift.TType.STOP) {
                break;
            }
            switch (fieldId) {
                case 1:
                    if (fieldType === thrift.TType.I32) {
                        const value_1: number = input.readI32();
                        _args.id = value_1;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.I64) {
                        const value_2: thrift.Int64 = input.readI64();
                        _args.bigID = value_2;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 3:
                    if (fieldType === thrift.TType.STRING) {
                        const value_3: string = input.readString();
                        _args.word = value_3;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 4:
                    if (fieldType === thrift.TType.DOUBLE) {
                        const value_4: number = input.readDouble();
                        _args.field1 = value_4;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 5:
                    if (fieldType === thrift.TType.STRING) {
                        const value_5: Buffer = input.readBinary();
                        _args.blob = value_5;
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
        if (_args.id !== undefined && _args.bigID !== undefined && _args.word !== undefined) {
            return {
                id: (_args.id != null ? _args.id : 45),
                bigID: (_args.bigID != null ? _args.bigID : thrift.Int64.fromDecimalString("23948234")),
                word: _args.word,
                field1: _args.field1,
                blob: (_args.blob != null ? _args.blob : Buffer.from("binary"))
            };
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read MyStruct from input");
        }
    }
};
export class MyStruct extends thrift.StructLike  implements IMyStruct_Loose {
    public id: number = 45;
    public bigID: number | thrift.Int64 = thrift.Int64.fromDecimalString("23948234");
    public word: string;
    public field1?: number;
    public blob?: string | Buffer = Buffer.from("binary");
    constructor(args: IMyStruct_Loose) {
        super();
        if (args.id != null) {
            this.id = args.id;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[id] is unset!");
        }
        if (args.bigID != null) {
            this.bigID = args.bigID;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[bigID] is unset!");
        }
        if (args.word != null) {
            this.word = args.word;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[word] is unset!");
        }
        if (args.field1 != null) {
            this.field1 = args.field1;
        }
        if (args.blob != null) {
            this.blob = args.blob;
        }
    }
    public static read(input: thrift.TProtocol): MyStruct {
        return new MyStruct(MyStructCodec.decode(input));
    }
    public write(output: thrift.TProtocol): void {
        return MyStructCodec.encode(this, output);
    }
}
