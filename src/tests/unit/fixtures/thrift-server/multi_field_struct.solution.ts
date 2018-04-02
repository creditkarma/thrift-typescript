export interface MyStruct {
    id: number;
    bigID: thrift.Int64;
    word: string;
    field1?: number;
    blob?: Buffer;
}
export interface MyStruct_Loose {
    id?: number;
    bigID?: number | thrift.Int64;
    word: string;
    field1?: number;
    blob?: string | Buffer;
}
export const MyStructCodec: thrift.IStructCodec<MyStruct_Loose, MyStruct> = {
    encode(val: MyStruct_Loose, output: thrift.TProtocol): void {
        const obj = {
            id: (val.id != null ? val.id : 45),
            bigID: (val.bigID != null ? (typeof val.bigID === "number" ? new thrift.Int64(val.bigID) : val.bigID) : new thrift.Int64(23948234)),
            word: val.word,
            field1: val.field1,
            blob: (val.blob != null ? (typeof val.blob === "string" ? Buffer.from(val.blob) : val.blob) : Buffer.from("binary"))
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
    decode(input: thrift.TProtocol): MyStruct {
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
                bigID: (_args.bigID != null ? _args.bigID : new thrift.Int64(23948234)),
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
