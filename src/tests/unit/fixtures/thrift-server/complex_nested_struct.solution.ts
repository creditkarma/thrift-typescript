export interface IOtherStruct {
    __name: "OtherStruct";
    id: thrift.Int64;
    name: Buffer;
}
export interface IOtherStructArgs {
    id: number | string | thrift.Int64;
    name?: string | Buffer;
}
export const OtherStructCodec: thrift.IStructCodec<IOtherStructArgs, IOtherStruct> = {
    encode(args: IOtherStructArgs, output: thrift.TProtocol): void {
        const obj = {
            id: (typeof args.id === "number" ? new thrift.Int64(args.id) : typeof args.id === "string" ? thrift.Int64.fromDecimalString(args.id) : args.id),
            name: (args.name != null ? (typeof args.name === "string" ? Buffer.from(args.name) : args.name) : Buffer.from("John"))
        };
        output.writeStructBegin("OtherStruct");
        if (obj.id != null) {
            output.writeFieldBegin("id", thrift.TType.I64, 1);
            output.writeI64((typeof obj.id === "number" ? new thrift.Int64(obj.id) : typeof obj.id === "string" ? thrift.Int64.fromDecimalString(obj.id) : obj.id));
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
                __name: "OtherStruct",
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
    public readonly __name = "OtherStruct";
    public readonly _annotations: thrift.IThriftAnnotations = {};
    public readonly _fieldAnnotations: thrift.IFieldAnnotations = {};
    constructor(args: IOtherStructArgs) {
        super();
        if (args.id != null) {
            const value_3: thrift.Int64 = (typeof args.id === "number" ? new thrift.Int64(args.id) : typeof args.id === "string" ? thrift.Int64.fromDecimalString(args.id) : args.id);
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
    public static write(args: IOtherStructArgs, output: thrift.TProtocol): void {
        return OtherStructCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return OtherStructCodec.encode(this, output);
    }
}
export interface IMyStruct {
    __name: "MyStruct";
    idList: Array<IOtherStruct>;
    idMap: Map<string, IOtherStruct>;
    idMapList: Map<string, Array<IOtherStruct>>;
    idSet: Set<IOtherStruct>;
    intList: Array<thrift.Int64>;
    listList: Array<Array<IOtherStruct>>;
    listListString: Array<Array<string>>;
    i64KeyedMap: Map<thrift.Int64, thrift.Int64>;
}
export interface IMyStructArgs {
    idList: Array<IOtherStructArgs>;
    idMap: Map<string, IOtherStructArgs>;
    idMapList: Map<string, Array<IOtherStructArgs>>;
    idSet: Set<IOtherStructArgs>;
    intList: Array<number | string | thrift.Int64>;
    listList: Array<Array<IOtherStructArgs>>;
    listListString: Array<Array<string>>;
    i64KeyedMap: Map<number | string | thrift.Int64, number | string | thrift.Int64>;
}
export const MyStructCodec: thrift.IStructCodec<IMyStructArgs, IMyStruct> = {
    encode(args: IMyStructArgs, output: thrift.TProtocol): void {
        const obj = {
            idList: args.idList,
            idMap: args.idMap,
            idMapList: args.idMapList,
            idSet: args.idSet,
            intList: args.intList,
            listList: args.listList,
            listListString: args.listListString,
            i64KeyedMap: args.i64KeyedMap
        };
        output.writeStructBegin("MyStruct");
        if (obj.idList != null) {
            output.writeFieldBegin("idList", thrift.TType.LIST, 1);
            output.writeListBegin(thrift.TType.STRUCT, obj.idList.length);
            obj.idList.forEach((value_5: IOtherStructArgs): void => {
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
            obj.idMap.forEach((value_6: IOtherStructArgs, key_1: string): void => {
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
            obj.idMapList.forEach((value_7: Array<IOtherStructArgs>, key_2: string): void => {
                output.writeString(key_2);
                output.writeListBegin(thrift.TType.STRUCT, value_7.length);
                value_7.forEach((value_8: IOtherStructArgs): void => {
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
            obj.idSet.forEach((value_9: IOtherStructArgs): void => {
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
            obj.intList.forEach((value_10: number | string | thrift.Int64): void => {
                output.writeI64((typeof value_10 === "number" ? new thrift.Int64(value_10) : typeof value_10 === "string" ? thrift.Int64.fromDecimalString(value_10) : value_10));
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
            obj.listList.forEach((value_11: Array<IOtherStructArgs>): void => {
                output.writeListBegin(thrift.TType.STRUCT, value_11.length);
                value_11.forEach((value_12: IOtherStructArgs): void => {
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
        if (obj.i64KeyedMap != null) {
            output.writeFieldBegin("i64KeyedMap", thrift.TType.MAP, 8);
            output.writeMapBegin(thrift.TType.I64, thrift.TType.I64, obj.i64KeyedMap.size);
            obj.i64KeyedMap.forEach((value_15: number | string | thrift.Int64, key_3: number | string | thrift.Int64): void => {
                output.writeI64((typeof key_3 === "number" ? new thrift.Int64(key_3) : typeof key_3 === "string" ? thrift.Int64.fromDecimalString(key_3) : key_3));
                output.writeI64((typeof value_15 === "number" ? new thrift.Int64(value_15) : typeof value_15 === "string" ? thrift.Int64.fromDecimalString(value_15) : value_15));
            });
            output.writeMapEnd();
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[i64KeyedMap] is unset!");
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
                        const value_16: Array<IOtherStruct> = new Array<IOtherStruct>();
                        const metadata_1: thrift.IThriftList = input.readListBegin();
                        const size_1: number = metadata_1.size;
                        for (let i_1: number = 0; i_1 < size_1; i_1++) {
                            const value_17: IOtherStruct = OtherStructCodec.decode(input);
                            value_16.push(value_17);
                        }
                        input.readListEnd();
                        _args.idList = value_16;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.MAP) {
                        const value_18: Map<string, IOtherStruct> = new Map<string, IOtherStruct>();
                        const metadata_2: thrift.IThriftMap = input.readMapBegin();
                        const size_2: number = metadata_2.size;
                        for (let i_2: number = 0; i_2 < size_2; i_2++) {
                            const key_4: string = input.readString();
                            const value_19: IOtherStruct = OtherStructCodec.decode(input);
                            value_18.set(key_4, value_19);
                        }
                        input.readMapEnd();
                        _args.idMap = value_18;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 3:
                    if (fieldType === thrift.TType.MAP) {
                        const value_20: Map<string, Array<IOtherStruct>> = new Map<string, Array<IOtherStruct>>();
                        const metadata_3: thrift.IThriftMap = input.readMapBegin();
                        const size_3: number = metadata_3.size;
                        for (let i_3: number = 0; i_3 < size_3; i_3++) {
                            const key_5: string = input.readString();
                            const value_21: Array<IOtherStruct> = new Array<IOtherStruct>();
                            const metadata_4: thrift.IThriftList = input.readListBegin();
                            const size_4: number = metadata_4.size;
                            for (let i_4: number = 0; i_4 < size_4; i_4++) {
                                const value_22: IOtherStruct = OtherStructCodec.decode(input);
                                value_21.push(value_22);
                            }
                            input.readListEnd();
                            value_20.set(key_5, value_21);
                        }
                        input.readMapEnd();
                        _args.idMapList = value_20;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 4:
                    if (fieldType === thrift.TType.SET) {
                        const value_23: Set<IOtherStruct> = new Set<IOtherStruct>();
                        const metadata_5: thrift.IThriftSet = input.readSetBegin();
                        const size_5: number = metadata_5.size;
                        for (let i_5: number = 0; i_5 < size_5; i_5++) {
                            const value_24: IOtherStruct = OtherStructCodec.decode(input);
                            value_23.add(value_24);
                        }
                        input.readSetEnd();
                        _args.idSet = value_23;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 5:
                    if (fieldType === thrift.TType.LIST) {
                        const value_25: Array<thrift.Int64> = new Array<thrift.Int64>();
                        const metadata_6: thrift.IThriftList = input.readListBegin();
                        const size_6: number = metadata_6.size;
                        for (let i_6: number = 0; i_6 < size_6; i_6++) {
                            const value_26: thrift.Int64 = input.readI64();
                            value_25.push(value_26);
                        }
                        input.readListEnd();
                        _args.intList = value_25;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 6:
                    if (fieldType === thrift.TType.LIST) {
                        const value_27: Array<Array<IOtherStruct>> = new Array<Array<IOtherStruct>>();
                        const metadata_7: thrift.IThriftList = input.readListBegin();
                        const size_7: number = metadata_7.size;
                        for (let i_7: number = 0; i_7 < size_7; i_7++) {
                            const value_28: Array<IOtherStruct> = new Array<IOtherStruct>();
                            const metadata_8: thrift.IThriftList = input.readListBegin();
                            const size_8: number = metadata_8.size;
                            for (let i_8: number = 0; i_8 < size_8; i_8++) {
                                const value_29: IOtherStruct = OtherStructCodec.decode(input);
                                value_28.push(value_29);
                            }
                            input.readListEnd();
                            value_27.push(value_28);
                        }
                        input.readListEnd();
                        _args.listList = value_27;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 7:
                    if (fieldType === thrift.TType.LIST) {
                        const value_30: Array<Array<string>> = new Array<Array<string>>();
                        const metadata_9: thrift.IThriftList = input.readListBegin();
                        const size_9: number = metadata_9.size;
                        for (let i_9: number = 0; i_9 < size_9; i_9++) {
                            const value_31: Array<string> = new Array<string>();
                            const metadata_10: thrift.IThriftList = input.readListBegin();
                            const size_10: number = metadata_10.size;
                            for (let i_10: number = 0; i_10 < size_10; i_10++) {
                                const value_32: string = input.readString();
                                value_31.push(value_32);
                            }
                            input.readListEnd();
                            value_30.push(value_31);
                        }
                        input.readListEnd();
                        _args.listListString = value_30;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 8:
                    if (fieldType === thrift.TType.MAP) {
                        const value_33: Map<thrift.Int64, thrift.Int64> = new Map<thrift.Int64, thrift.Int64>();
                        const metadata_11: thrift.IThriftMap = input.readMapBegin();
                        const size_11: number = metadata_11.size;
                        for (let i_11: number = 0; i_11 < size_11; i_11++) {
                            const key_6: thrift.Int64 = input.readI64();
                            const value_34: thrift.Int64 = input.readI64();
                            value_33.set(key_6, value_34);
                        }
                        input.readMapEnd();
                        _args.i64KeyedMap = value_33;
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
        if (_args.idList !== undefined && _args.idMap !== undefined && _args.idMapList !== undefined && _args.idSet !== undefined && _args.intList !== undefined && _args.listList !== undefined && _args.listListString !== undefined && _args.i64KeyedMap !== undefined) {
            return {
                __name: "MyStruct",
                idList: _args.idList,
                idMap: _args.idMap,
                idMapList: _args.idMapList,
                idSet: _args.idSet,
                intList: _args.intList,
                listList: _args.listList,
                listListString: _args.listListString,
                i64KeyedMap: _args.i64KeyedMap
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
    public i64KeyedMap: Map<thrift.Int64, thrift.Int64>;
    public readonly __name = "MyStruct";
    public readonly _annotations: thrift.IThriftAnnotations = {};
    public readonly _fieldAnnotations: thrift.IFieldAnnotations = {};
    constructor(args: IMyStructArgs) {
        super();
        if (args.idList != null) {
            const value_35: Array<IOtherStruct> = new Array<IOtherStruct>();
            args.idList.forEach((value_43: IOtherStructArgs): void => {
                const value_44: IOtherStruct = new OtherStruct(value_43);
                value_35.push(value_44);
            });
            this.idList = value_35;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[idList] is unset!");
        }
        if (args.idMap != null) {
            const value_36: Map<string, IOtherStruct> = new Map<string, IOtherStruct>();
            args.idMap.forEach((value_45: IOtherStructArgs, key_7: string): void => {
                const value_46: IOtherStruct = new OtherStruct(value_45);
                const key_8: string = key_7;
                value_36.set(key_8, value_46);
            });
            this.idMap = value_36;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[idMap] is unset!");
        }
        if (args.idMapList != null) {
            const value_37: Map<string, Array<IOtherStruct>> = new Map<string, Array<IOtherStruct>>();
            args.idMapList.forEach((value_47: Array<IOtherStructArgs>, key_9: string): void => {
                const value_48: Array<IOtherStruct> = new Array<IOtherStruct>();
                value_47.forEach((value_49: IOtherStructArgs): void => {
                    const value_50: IOtherStruct = new OtherStruct(value_49);
                    value_48.push(value_50);
                });
                const key_10: string = key_9;
                value_37.set(key_10, value_48);
            });
            this.idMapList = value_37;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[idMapList] is unset!");
        }
        if (args.idSet != null) {
            const value_38: Set<IOtherStruct> = new Set<IOtherStruct>();
            args.idSet.forEach((value_51: IOtherStructArgs): void => {
                const value_52: IOtherStruct = new OtherStruct(value_51);
                value_38.add(value_52);
            });
            this.idSet = value_38;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[idSet] is unset!");
        }
        if (args.intList != null) {
            const value_39: Array<thrift.Int64> = new Array<thrift.Int64>();
            args.intList.forEach((value_53: number | string | thrift.Int64): void => {
                const value_54: thrift.Int64 = (typeof value_53 === "number" ? new thrift.Int64(value_53) : typeof value_53 === "string" ? thrift.Int64.fromDecimalString(value_53) : value_53);
                value_39.push(value_54);
            });
            this.intList = value_39;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[intList] is unset!");
        }
        if (args.listList != null) {
            const value_40: Array<Array<IOtherStruct>> = new Array<Array<IOtherStruct>>();
            args.listList.forEach((value_55: Array<IOtherStructArgs>): void => {
                const value_56: Array<IOtherStruct> = new Array<IOtherStruct>();
                value_55.forEach((value_57: IOtherStructArgs): void => {
                    const value_58: IOtherStruct = new OtherStruct(value_57);
                    value_56.push(value_58);
                });
                value_40.push(value_56);
            });
            this.listList = value_40;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[listList] is unset!");
        }
        if (args.listListString != null) {
            const value_41: Array<Array<string>> = new Array<Array<string>>();
            args.listListString.forEach((value_59: Array<string>): void => {
                const value_60: Array<string> = new Array<string>();
                value_59.forEach((value_61: string): void => {
                    const value_62: string = value_61;
                    value_60.push(value_62);
                });
                value_41.push(value_60);
            });
            this.listListString = value_41;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[listListString] is unset!");
        }
        if (args.i64KeyedMap != null) {
            const value_42: Map<thrift.Int64, thrift.Int64> = new Map<thrift.Int64, thrift.Int64>();
            args.i64KeyedMap.forEach((value_63: number | string | thrift.Int64, key_11: number | string | thrift.Int64): void => {
                const value_64: thrift.Int64 = (typeof value_63 === "number" ? new thrift.Int64(value_63) : typeof value_63 === "string" ? thrift.Int64.fromDecimalString(value_63) : value_63);
                const key_12: thrift.Int64 = (typeof key_11 === "number" ? new thrift.Int64(key_11) : typeof key_11 === "string" ? thrift.Int64.fromDecimalString(key_11) : key_11);
                value_42.set(key_12, value_64);
            });
            this.i64KeyedMap = value_42;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[i64KeyedMap] is unset!");
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
