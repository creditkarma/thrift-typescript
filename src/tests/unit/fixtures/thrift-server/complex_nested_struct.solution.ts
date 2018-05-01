export interface IOtherStruct {
    id: thrift.Int64;
    name: string;
}
export interface IOtherStruct_Loose {
    id: number | thrift.Int64;
    name?: string;
}
export class OtherStruct extends thrift.IStructLike  implements IOtherStruct_Loose {
    public id: number | thrift.Int64;
    public name: string;
    constructor(args: IOtherStruct_Loose) {
        super();
        if (args.id != null) {
            this.id = args.id;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[id] is unset!");
        }
        if (args.name != null) {
            this.name = args.name;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[name] is unset!");
        }
    }
    public static write(args: IOtherStruct_Loose, output: thrift.TProtocol): void {
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
    }
    public static read(input: thrift.TProtocol): IOtherStruct {
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
}
export interface IMyStruct {
    idList: Array<IOtherStruct>;
    idMap: Map<string, IOtherStruct>;
    idSet: Set<IOtherStruct>;
    idMapList: Map<string, Array<IOtherStruct>>;
}
export interface IMyStruct_Loose {
    idList: Array<IOtherStruct_Loose>;
    idMap: Map<string, IOtherStruct_Loose>;
    idSet: Set<IOtherStruct_Loose>;
    idMapList: Map<string, Array<IOtherStruct_Loose>>;
}
export class MyStruct extends thrift.IStructLike  implements IMyStruct_Loose {
    public idList: Array<IOtherStruct_Loose>;
    public idMap: Map<string, IOtherStruct_Loose>;
    public idSet: Set<IOtherStruct_Loose>;
    public idMapList: Map<string, Array<IOtherStruct_Loose>>;
    constructor(args: IMyStruct_Loose) {
        super();
        if (args.idList != null) {
            this.idList = args.idList;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[idList] is unset!");
        }
        if (args.idMap != null) {
            this.idMap = args.idMap;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[idMap] is unset!");
        }
        if (args.idSet != null) {
            this.idSet = args.idSet;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[idSet] is unset!");
        }
        if (args.idMapList != null) {
            this.idMapList = args.idMapList;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[idMapList] is unset!");
        }
    }
    public static write(args: IMyStruct_Loose, output: thrift.TProtocol): void {
        const obj = {
            idList: args.idList,
            idMap: args.idMap,
            idSet: args.idSet,
            idMapList: args.idMapList
        };
        output.writeStructBegin("MyStruct");
        if (obj.idList != null) {
            output.writeFieldBegin("idList", thrift.TType.LIST, 1);
            output.writeListBegin(thrift.TType.STRUCT, obj.idList.length);
            obj.idList.forEach((value_3: IOtherStruct_Loose): void => {
                OtherStruct.write(value_3, output);
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
            obj.idMap.forEach((value_4: IOtherStruct_Loose, key_1: string): void => {
                output.writeString(key_1);
                OtherStruct.write(value_4, output);
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
            obj.idSet.forEach((value_5: IOtherStruct_Loose): void => {
                OtherStruct.write(value_5, output);
            });
            output.writeSetEnd();
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[idSet] is unset!");
        }
        if (obj.idMapList != null) {
            output.writeFieldBegin("idMapList", thrift.TType.MAP, 4);
            output.writeMapBegin(thrift.TType.STRING, thrift.TType.LIST, obj.idMapList.size);
            obj.idMapList.forEach((value_6: Array<IOtherStruct_Loose>, key_2: string): void => {
                output.writeString(key_2);
                output.writeListBegin(thrift.TType.STRUCT, value_6.length);
                value_6.forEach((value_7: IOtherStruct_Loose): void => {
                    OtherStruct.write(value_7, output);
                });
                output.writeListEnd();
            });
            output.writeMapEnd();
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[idMapList] is unset!");
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
    public static read(input: thrift.TProtocol): IMyStruct {
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
                        const value_8: Array<IOtherStruct> = new Array<IOtherStruct>();
                        const metadata_1: thrift.IThriftList = input.readListBegin();
                        const size_1: number = metadata_1.size;
                        for (let i_1: number = 0; i_1 < size_1; i_1++) {
                            const value_9: IOtherStruct = OtherStruct.read(input);
                            value_8.push(value_9);
                        }
                        input.readListEnd();
                        _args.idList = value_8;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.MAP) {
                        const value_10: Map<string, IOtherStruct> = new Map<string, IOtherStruct>();
                        const metadata_2: thrift.IThriftMap = input.readMapBegin();
                        const size_2: number = metadata_2.size;
                        for (let i_2: number = 0; i_2 < size_2; i_2++) {
                            const key_3: string = input.readString();
                            const value_11: IOtherStruct = OtherStruct.read(input);
                            value_10.set(key_3, value_11);
                        }
                        input.readMapEnd();
                        _args.idMap = value_10;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 3:
                    if (fieldType === thrift.TType.SET) {
                        const value_12: Set<IOtherStruct> = new Set<IOtherStruct>();
                        const metadata_3: thrift.IThriftSet = input.readSetBegin();
                        const size_3: number = metadata_3.size;
                        for (let i_3: number = 0; i_3 < size_3; i_3++) {
                            const value_13: IOtherStruct = OtherStruct.read(input);
                            value_12.add(value_13);
                        }
                        input.readSetEnd();
                        _args.idSet = value_12;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 4:
                    if (fieldType === thrift.TType.MAP) {
                        const value_14: Map<string, Array<IOtherStruct>> = new Map<string, Array<IOtherStruct>>();
                        const metadata_4: thrift.IThriftMap = input.readMapBegin();
                        const size_4: number = metadata_4.size;
                        for (let i_4: number = 0; i_4 < size_4; i_4++) {
                            const key_4: string = input.readString();
                            const value_15: Array<IOtherStruct> = new Array<IOtherStruct>();
                            const metadata_5: thrift.IThriftList = input.readListBegin();
                            const size_5: number = metadata_5.size;
                            for (let i_5: number = 0; i_5 < size_5; i_5++) {
                                const value_16: IOtherStruct = OtherStruct.read(input);
                                value_15.push(value_16);
                            }
                            input.readListEnd();
                            value_14.set(key_4, value_15);
                        }
                        input.readMapEnd();
                        _args.idMapList = value_14;
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
        if (_args.idList !== undefined && _args.idMap !== undefined && _args.idSet !== undefined && _args.idMapList !== undefined) {
            return {
                idList: _args.idList,
                idMap: _args.idMap,
                idSet: _args.idSet,
                idMapList: _args.idMapList
            };
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read MyStruct from input");
        }
    }
}
