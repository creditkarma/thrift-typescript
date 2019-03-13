export interface IMyStruct {
    id: number;
    bigID: thrift.Int64;
    word: string;
    field1?: number;
    blob?: Buffer;
}
export interface IMyStructArgs {
    id?: number;
    bigID?: number | string | thrift.Int64;
    word: string;
    field1?: number;
    blob?: string | Buffer;
}
export const MyStructCodec: thrift.IStructCodec<IMyStructArgs, IMyStruct> = {
    encode(args: IMyStructArgs, output: thrift.TProtocol): void {
        const obj = {
            id: (args.id != null ? args.id : 45),
            bigID: (args.bigID != null ? (typeof args.bigID === "number" ? new thrift.Int64(args.bigID) : typeof args.bigID === "string" ? thrift.Int64.fromDecimalString(args.bigID) : args.bigID) : thrift.Int64.fromDecimalString("23948234")),
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
        if (obj.bigID != null) {
            output.writeFieldBegin("bigID", thrift.TType.I64, 2);
            output.writeI64((typeof obj.bigID === "number" ? new thrift.Int64(obj.bigID) : typeof obj.bigID === "string" ? thrift.Int64.fromDecimalString(obj.bigID) : obj.bigID));
            output.writeFieldEnd();
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
export class MyStruct extends thrift.StructLike implements IMyStruct {
    public id: number = 45;
    public bigID: thrift.Int64 = thrift.Int64.fromDecimalString("23948234");
    public word: string;
    public field1?: number;
    public blob?: Buffer = Buffer.from("binary");
    public readonly _annotations: thrift.IThriftAnnotations = {};
    public readonly _fieldAnnotations: thrift.IFieldAnnotations = {};
    constructor(args: IMyStructArgs) {
        super();
        if (args.id != null) {
            const value_6: number = args.id;
            this.id = value_6;
        }
        if (args.bigID != null) {
            const value_7: thrift.Int64 = (typeof args.bigID === "number" ? new thrift.Int64(args.bigID) : typeof args.bigID === "string" ? thrift.Int64.fromDecimalString(args.bigID) : args.bigID);
            this.bigID = value_7;
        }
        if (args.word != null) {
            const value_8: string = args.word;
            this.word = value_8;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[word] is unset!");
        }
        if (args.field1 != null) {
            const value_9: number = args.field1;
            this.field1 = value_9;
        }
        if (args.blob != null) {
            const value_10: Buffer = (typeof args.blob === "string" ? Buffer.from(args.blob) : args.blob);
            this.blob = value_10;
        }
    }
    public static read(input: thrift.TProtocol): MyStruct {
        return new MyStruct(MyStructCodec.decode(input));
    }
    public static write(args: IMyStructArgs, output: thrift.TProtocol): void {
        return MyStructCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return MyStructCodec.encode(this, output);
    }
}
