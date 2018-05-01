export interface OtherStruct {
    id: thrift.Int64;
    name: string;
}
export interface OtherStruct_Loose {
    id: number | thrift.Int64;
    name?: string;
}
export const OtherStructCodec: thrift.IStructCodec<OtherStruct_Loose, OtherStruct> = {
    encode(args: OtherStruct_Loose, output: thrift.TProtocol): void {
        const obj = {
            id: (typeof args.id === "number" ? new thrift.Int64(args.id) : args.id),
            name: (args.name != null ? args.name : "John")
        };
        output.writeStructBegin("OtherStruct");
        if (obj.id != null) {
            output.writeFieldBegin("id", thrift.TType.I64, 1);
            output.writeI64(obj.id);
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[id] is unset!");
        }
        if (obj.name != null) {
            output.writeFieldBegin("name", thrift.TType.STRING, 2);
            output.writeString(obj.name);
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[name] is unset!");
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): OtherStruct {
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
                    if (fieldType === thrift.TType.I64) {
                        const value_1: thrift.Int64 = input.readI64();
                        _args.id = value_1;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.STRING) {
                        const value_2: string = input.readString();
                        _args.name = value_2;
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
        if (_args.id !== undefined && _args.name !== undefined) {
            return {
                id: _args.id,
                name: (_args.name != null ? _args.name : "John")
            };
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read OtherStruct from input");
        }
    }
};
export interface MyStruct {
    idList: Array<OtherStruct>;
    idMap: Map<string, OtherStruct>;
    idSet: Set<OtherStruct>;
}
export interface MyStruct_Loose {
    idList: Array<OtherStruct_Loose>;
    idMap: Map<string, OtherStruct_Loose>;
    idSet: Set<OtherStruct_Loose>;
}
export const MyStructCodec: thrift.IStructCodec<MyStruct_Loose, MyStruct> = {
    encode(args: MyStruct_Loose, output: thrift.TProtocol): void {
        const obj = {
            idList: args.idList,
            idMap: args.idMap,
            idSet: args.idSet
        };
        output.writeStructBegin("MyStruct");
        if (obj.idList != null) {
            output.writeFieldBegin("idList", thrift.TType.LIST, 1);
            output.writeListBegin(thrift.TType.STRUCT, obj.idList.length);
            obj.idList.forEach((value_3: OtherStruct_Loose): void => {
                OtherStructCodec.encode(value_3, output);
            });
            output.writeListEnd();
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[idList] is unset!");
        }
        if (obj.idMap != null) {
            output.writeFieldBegin("idMap", thrift.TType.MAP, 2);
            output.writeMapBegin(thrift.TType.STRING, thrift.TType.STRUCT, obj.idMap.size);
            obj.idMap.forEach((value_4: OtherStruct_Loose, key_1: string): void => {
                output.writeString(key_1);
                OtherStructCodec.encode(value_4, output);
            });
            output.writeMapEnd();
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[idMap] is unset!");
        }
        if (obj.idSet != null) {
            output.writeFieldBegin("idSet", thrift.TType.SET, 3);
            output.writeSetBegin(thrift.TType.STRUCT, obj.idSet.size);
            obj.idSet.forEach((value_5: OtherStruct_Loose): void => {
                OtherStructCodec.encode(value_5, output);
            });
            output.writeSetEnd();
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[idSet] is unset!");
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
                    if (fieldType === thrift.TType.LIST) {
                        const value_6: Array<OtherStruct> = new Array<OtherStruct>();
                        const metadata_1: thrift.IThriftList = input.readListBegin();
                        const size_1: number = metadata_1.size;
                        for (let i_1: number = 0; i_1 < size_1; i_1++) {
                            const value_7: OtherStruct = OtherStructCodec.decode(input);
                            value_6.push(value_7);
                        }
                        input.readListEnd();
                        _args.idList = value_6;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.MAP) {
                        const value_8: Map<string, OtherStruct> = new Map<string, OtherStruct>();
                        const metadata_2: thrift.IThriftMap = input.readMapBegin();
                        const size_2: number = metadata_2.size;
                        for (let i_2: number = 0; i_2 < size_2; i_2++) {
                            const key_2: string = input.readString();
                            const value_9: OtherStruct = OtherStructCodec.decode(input);
                            value_8.set(key_2, value_9);
                        }
                        input.readMapEnd();
                        _args.idMap = value_8;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 3:
                    if (fieldType === thrift.TType.SET) {
                        const value_10: Set<OtherStruct> = new Set<OtherStruct>();
                        const metadata_3: thrift.IThriftSet = input.readSetBegin();
                        const size_3: number = metadata_3.size;
                        for (let i_3: number = 0; i_3 < size_3; i_3++) {
                            const value_11: OtherStruct = OtherStructCodec.decode(input);
                            value_10.add(value_11);
                        }
                        input.readSetEnd();
                        _args.idSet = value_10;
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
        if (_args.idList !== undefined && _args.idMap !== undefined && _args.idSet !== undefined) {
            return {
                idList: _args.idList,
                idMap: _args.idMap,
                idSet: _args.idSet
            };
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read MyStruct from input");
        }
    }
};
