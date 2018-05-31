export interface IOtherStruct {
    id: thrift.Int64;
    name: Buffer;
}
export interface IOtherStruct_Loose {
    id: number | thrift.Int64;
    name?: string | Buffer;
}
export const OtherStructCodec: thrift.IStructCodec<IOtherStruct_Loose, IOtherStruct> = {
    encode(args: IOtherStruct_Loose, output: thrift.TProtocol): void {
        const obj = {
            id: (typeof args.id === "number" ? new thrift.Int64(args.id) : args.id),
            name: (args.name != null ? (typeof args.name === "string" ? Buffer.from(args.name) : args.name) : Buffer.from("John"))
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
            output.writeBinary(obj.name);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): IOtherStruct {
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
                        const value_2: Buffer = input.readBinary();
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
                name: (_args.name != null ? _args.name : Buffer.from("John"))
            };
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read OtherStruct from input");
        }
    }
};
export class OtherStruct extends thrift.StructLike implements IOtherStruct {
    public id: thrift.Int64;
    public name: Buffer = Buffer.from("John");
    constructor(args: IOtherStruct_Loose) {
        super();
        if (args.id != null) {
            const value_3: thrift.Int64 = (typeof args.id === "number" ? new thrift.Int64(args.id) : args.id);
            this.id = value_3;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[id] is unset!");
        }
        if (args.name != null) {
            const value_4: Buffer = (typeof args.name === "string" ? Buffer.from(args.name) : args.name);
            this.name = value_4;
        }
    }
    public static read(input: thrift.TProtocol): OtherStruct {
        return new OtherStruct(OtherStructCodec.decode(input));
    }
    public write(output: thrift.TProtocol): void {
        return OtherStructCodec.encode(this, output);
    }
}
export interface IMyStruct {
    idList: Array<IOtherStruct>;
    idMap: Map<string, IOtherStruct>;
    idMapList: Map<string, Array<IOtherStruct>>;
    idSet: Set<IOtherStruct>;
    intList: Array<thrift.Int64>;
    listList: Array<Array<IOtherStruct>>;
    listListString: Array<Array<string>>;
}
export interface IMyStruct_Loose {
    idList: Array<IOtherStruct_Loose>;
    idMap: Map<string, IOtherStruct_Loose>;
    idMapList: Map<string, Array<IOtherStruct_Loose>>;
    idSet: Set<IOtherStruct_Loose>;
    intList: Array<number | thrift.Int64>;
    listList: Array<Array<IOtherStruct_Loose>>;
    listListString: Array<Array<string>>;
}
export const MyStructCodec: thrift.IStructCodec<IMyStruct_Loose, IMyStruct> = {
    encode(args: IMyStruct_Loose, output: thrift.TProtocol): void {
        const obj = {
            idList: args.idList,
            idMap: args.idMap,
            idMapList: args.idMapList,
            idSet: args.idSet,
            intList: args.intList,
            listList: args.listList,
            listListString: args.listListString
        };
        output.writeStructBegin("MyStruct");
        if (obj.idList != null) {
            output.writeFieldBegin("idList", thrift.TType.LIST, 1);
            output.writeListBegin(thrift.TType.STRUCT, obj.idList.length);
            obj.idList.forEach((value_5: IOtherStruct_Loose): void => {
                OtherStructCodec.encode(value_5, output);
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
            obj.idMap.forEach((value_6: IOtherStruct_Loose, key_1: string): void => {
                output.writeString(key_1);
                OtherStructCodec.encode(value_6, output);
            });
            output.writeMapEnd();
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[idMap] is unset!");
        }
        if (obj.idMapList != null) {
            output.writeFieldBegin("idMapList", thrift.TType.MAP, 3);
            output.writeMapBegin(thrift.TType.STRING, thrift.TType.LIST, obj.idMapList.size);
            obj.idMapList.forEach((value_7: Array<IOtherStruct_Loose>, key_2: string): void => {
                output.writeString(key_2);
                output.writeListBegin(thrift.TType.STRUCT, value_7.length);
                value_7.forEach((value_8: IOtherStruct_Loose): void => {
                    OtherStructCodec.encode(value_8, output);
                });
                output.writeListEnd();
            });
            output.writeMapEnd();
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[idMapList] is unset!");
        }
        if (obj.idSet != null) {
            output.writeFieldBegin("idSet", thrift.TType.SET, 4);
            output.writeSetBegin(thrift.TType.STRUCT, obj.idSet.size);
            obj.idSet.forEach((value_9: IOtherStruct_Loose): void => {
                OtherStructCodec.encode(value_9, output);
            });
            output.writeSetEnd();
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[idSet] is unset!");
        }
        if (obj.intList != null) {
            output.writeFieldBegin("intList", thrift.TType.LIST, 5);
            output.writeListBegin(thrift.TType.I64, obj.intList.length);
            obj.intList.forEach((value_10: number | thrift.Int64): void => {
                output.writeI64(value_10);
            });
            output.writeListEnd();
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[intList] is unset!");
        }
        if (obj.listList != null) {
            output.writeFieldBegin("listList", thrift.TType.LIST, 6);
            output.writeListBegin(thrift.TType.LIST, obj.listList.length);
            obj.listList.forEach((value_11: Array<IOtherStruct_Loose>): void => {
                output.writeListBegin(thrift.TType.STRUCT, value_11.length);
                value_11.forEach((value_12: IOtherStruct_Loose): void => {
                    OtherStructCodec.encode(value_12, output);
                });
                output.writeListEnd();
            });
            output.writeListEnd();
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[listList] is unset!");
        }
        if (obj.listListString != null) {
            output.writeFieldBegin("listListString", thrift.TType.LIST, 7);
            output.writeListBegin(thrift.TType.LIST, obj.listListString.length);
            obj.listListString.forEach((value_13: Array<string>): void => {
                output.writeListBegin(thrift.TType.STRING, value_13.length);
                value_13.forEach((value_14: string): void => {
                    output.writeString(value_14);
                });
                output.writeListEnd();
            });
            output.writeListEnd();
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[listListString] is unset!");
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
                    if (fieldType === thrift.TType.LIST) {
                        const value_15: Array<IOtherStruct> = new Array<IOtherStruct>();
                        const metadata_1: thrift.IThriftList = input.readListBegin();
                        const size_1: number = metadata_1.size;
                        for (let i_1: number = 0; i_1 < size_1; i_1++) {
                            const value_16: IOtherStruct = OtherStructCodec.decode(input);
                            value_15.push(value_16);
                        }
                        input.readListEnd();
                        _args.idList = value_15;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.MAP) {
                        const value_17: Map<string, IOtherStruct> = new Map<string, IOtherStruct>();
                        const metadata_2: thrift.IThriftMap = input.readMapBegin();
                        const size_2: number = metadata_2.size;
                        for (let i_2: number = 0; i_2 < size_2; i_2++) {
                            const key_3: string = input.readString();
                            const value_18: IOtherStruct = OtherStructCodec.decode(input);
                            value_17.set(key_3, value_18);
                        }
                        input.readMapEnd();
                        _args.idMap = value_17;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 3:
                    if (fieldType === thrift.TType.MAP) {
                        const value_19: Map<string, Array<IOtherStruct>> = new Map<string, Array<IOtherStruct>>();
                        const metadata_3: thrift.IThriftMap = input.readMapBegin();
                        const size_3: number = metadata_3.size;
                        for (let i_3: number = 0; i_3 < size_3; i_3++) {
                            const key_4: string = input.readString();
                            const value_20: Array<IOtherStruct> = new Array<IOtherStruct>();
                            const metadata_4: thrift.IThriftList = input.readListBegin();
                            const size_4: number = metadata_4.size;
                            for (let i_4: number = 0; i_4 < size_4; i_4++) {
                                const value_21: IOtherStruct = OtherStructCodec.decode(input);
                                value_20.push(value_21);
                            }
                            input.readListEnd();
                            value_19.set(key_4, value_20);
                        }
                        input.readMapEnd();
                        _args.idMapList = value_19;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 4:
                    if (fieldType === thrift.TType.SET) {
                        const value_22: Set<IOtherStruct> = new Set<IOtherStruct>();
                        const metadata_5: thrift.IThriftSet = input.readSetBegin();
                        const size_5: number = metadata_5.size;
                        for (let i_5: number = 0; i_5 < size_5; i_5++) {
                            const value_23: IOtherStruct = OtherStructCodec.decode(input);
                            value_22.add(value_23);
                        }
                        input.readSetEnd();
                        _args.idSet = value_22;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 5:
                    if (fieldType === thrift.TType.LIST) {
                        const value_24: Array<thrift.Int64> = new Array<thrift.Int64>();
                        const metadata_6: thrift.IThriftList = input.readListBegin();
                        const size_6: number = metadata_6.size;
                        for (let i_6: number = 0; i_6 < size_6; i_6++) {
                            const value_25: thrift.Int64 = input.readI64();
                            value_24.push(value_25);
                        }
                        input.readListEnd();
                        _args.intList = value_24;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 6:
                    if (fieldType === thrift.TType.LIST) {
                        const value_26: Array<Array<IOtherStruct>> = new Array<Array<IOtherStruct>>();
                        const metadata_7: thrift.IThriftList = input.readListBegin();
                        const size_7: number = metadata_7.size;
                        for (let i_7: number = 0; i_7 < size_7; i_7++) {
                            const value_27: Array<IOtherStruct> = new Array<IOtherStruct>();
                            const metadata_8: thrift.IThriftList = input.readListBegin();
                            const size_8: number = metadata_8.size;
                            for (let i_8: number = 0; i_8 < size_8; i_8++) {
                                const value_28: IOtherStruct = OtherStructCodec.decode(input);
                                value_27.push(value_28);
                            }
                            input.readListEnd();
                            value_26.push(value_27);
                        }
                        input.readListEnd();
                        _args.listList = value_26;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 7:
                    if (fieldType === thrift.TType.LIST) {
                        const value_29: Array<Array<string>> = new Array<Array<string>>();
                        const metadata_9: thrift.IThriftList = input.readListBegin();
                        const size_9: number = metadata_9.size;
                        for (let i_9: number = 0; i_9 < size_9; i_9++) {
                            const value_30: Array<string> = new Array<string>();
                            const metadata_10: thrift.IThriftList = input.readListBegin();
                            const size_10: number = metadata_10.size;
                            for (let i_10: number = 0; i_10 < size_10; i_10++) {
                                const value_31: string = input.readString();
                                value_30.push(value_31);
                            }
                            input.readListEnd();
                            value_29.push(value_30);
                        }
                        input.readListEnd();
                        _args.listListString = value_29;
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
        if (_args.idList !== undefined && _args.idMap !== undefined && _args.idMapList !== undefined && _args.idSet !== undefined && _args.intList !== undefined && _args.listList !== undefined && _args.listListString !== undefined) {
            return {
                idList: _args.idList,
                idMap: _args.idMap,
                idMapList: _args.idMapList,
                idSet: _args.idSet,
                intList: _args.intList,
                listList: _args.listList,
                listListString: _args.listListString
            };
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read MyStruct from input");
        }
    }
};
export class MyStruct extends thrift.StructLike implements IMyStruct {
    public idList: Array<IOtherStruct>;
    public idMap: Map<string, IOtherStruct>;
    public idMapList: Map<string, Array<IOtherStruct>>;
    public idSet: Set<IOtherStruct>;
    public intList: Array<thrift.Int64>;
    public listList: Array<Array<IOtherStruct>>;
    public listListString: Array<Array<string>>;
    constructor(args: IMyStruct_Loose) {
        super();
        if (args.idList != null) {
            const value_32: Array<IOtherStruct> = new Array<IOtherStruct>();
            args.idList.forEach((value_39: IOtherStruct_Loose): void => {
                const value_40: IOtherStruct = new OtherStruct(value_39);
                value_32.push(value_40);
            });
            this.idList = value_32;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[idList] is unset!");
        }
        if (args.idMap != null) {
            const value_33: Map<string, IOtherStruct> = new Map<string, IOtherStruct>();
            args.idMap.forEach((value_41: IOtherStruct_Loose, key_5: string): void => {
                const value_42: IOtherStruct = new OtherStruct(value_41);
                value_33.set(key_5, value_42);
            });
            this.idMap = value_33;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[idMap] is unset!");
        }
        if (args.idMapList != null) {
            const value_34: Map<string, Array<IOtherStruct>> = new Map<string, Array<IOtherStruct>>();
            args.idMapList.forEach((value_43: Array<IOtherStruct_Loose>, key_6: string): void => {
                const value_44: Array<IOtherStruct> = new Array<IOtherStruct>();
                value_43.forEach((value_45: IOtherStruct_Loose): void => {
                    const value_46: IOtherStruct = new OtherStruct(value_45);
                    value_44.push(value_46);
                });
                value_34.set(key_6, value_44);
            });
            this.idMapList = value_34;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[idMapList] is unset!");
        }
        if (args.idSet != null) {
            const value_35: Set<IOtherStruct> = new Set<IOtherStruct>();
            args.idSet.forEach((value_47: IOtherStruct_Loose): void => {
                const value_48: IOtherStruct = new OtherStruct(value_47);
                value_35.add(value_48);
            });
            this.idSet = value_35;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[idSet] is unset!");
        }
        if (args.intList != null) {
            const value_36: Array<thrift.Int64> = new Array<thrift.Int64>();
            args.intList.forEach((value_49: number | thrift.Int64): void => {
                const value_50: thrift.Int64 = (typeof value_49 === "number" ? new thrift.Int64(value_49) : value_49);
                value_36.push(value_50);
            });
            this.intList = value_36;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[intList] is unset!");
        }
        if (args.listList != null) {
            const value_37: Array<Array<IOtherStruct>> = new Array<Array<IOtherStruct>>();
            args.listList.forEach((value_51: Array<IOtherStruct_Loose>): void => {
                const value_52: Array<IOtherStruct> = new Array<IOtherStruct>();
                value_51.forEach((value_53: IOtherStruct_Loose): void => {
                    const value_54: IOtherStruct = new OtherStruct(value_53);
                    value_52.push(value_54);
                });
                value_37.push(value_52);
            });
            this.listList = value_37;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[listList] is unset!");
        }
        if (args.listListString != null) {
            const value_38: Array<Array<string>> = new Array<Array<string>>();
            args.listListString.forEach((value_55: Array<string>): void => {
                const value_56: Array<string> = new Array<string>();
                value_55.forEach((value_57: string): void => {
                    const value_58: string = value_57;
                    value_56.push(value_58);
                });
                value_38.push(value_56);
            });
            this.listListString = value_38;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[listListString] is unset!");
        }
    }
    public static read(input: thrift.TProtocol): MyStruct {
        return new MyStruct(MyStructCodec.decode(input));
    }
    public write(output: thrift.TProtocol): void {
        return MyStructCodec.encode(this, output);
    }
}
