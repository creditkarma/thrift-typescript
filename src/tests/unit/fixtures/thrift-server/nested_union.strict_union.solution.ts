export enum InnerUnionType {
    InnerUnionWithName = "name",
    InnerUnionWithId = "id"
}
export type InnerUnion = IInnerUnionWithName | IInnerUnionWithId;
export interface IInnerUnionWithName {
    __type: InnerUnionType.InnerUnionWithName;
    name: string;
    id?: undefined;
}
export interface IInnerUnionWithId {
    __type: InnerUnionType.InnerUnionWithId;
    name?: undefined;
    id: number;
}
export type InnerUnionArgs = IInnerUnionWithNameArgs | IInnerUnionWithIdArgs;
export interface IInnerUnionWithNameArgs {
    name: string;
    id?: undefined;
}
export interface IInnerUnionWithIdArgs {
    name?: undefined;
    id: number;
}
export const InnerUnionCodec: thrift.IStructToolkit<InnerUnionArgs, InnerUnion> = {
    create(args: InnerUnionArgs): InnerUnion {
        let _fieldsSet: number = 0;
        let _returnValue: any = null;
        if (args.name != null) {
            _fieldsSet++;
            const value_1: string = args.name;
            _returnValue = { name: value_1 };
        }
        if (args.id != null) {
            _fieldsSet++;
            const value_2: number = args.id;
            _returnValue = { id: value_2 };
        }
        if (_fieldsSet > 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion cannot have more than one value");
        }
        else if (_fieldsSet < 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion must have one value set");
        }
        if (_returnValue !== null) {
            if (_returnValue.name) {
                return {
                    __type: InnerUnionType.InnerUnionWithName,
                    name: _returnValue.name
                };
            }
            else {
                return {
                    __type: InnerUnionType.InnerUnionWithId,
                    id: _returnValue.id
                };
            }
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read data for TUnion");
        }
    },
    encode(args: InnerUnionArgs, output: thrift.TProtocol): void {
        let _fieldsSet: number = 0;
        const obj = {
            name: args.name,
            id: args.id
        };
        output.writeStructBegin("InnerUnion");
        if (obj.name != null) {
            _fieldsSet++;
            output.writeFieldBegin("name", thrift.TType.STRING, 1);
            output.writeString(obj.name);
            output.writeFieldEnd();
        }
        if (obj.id != null) {
            _fieldsSet++;
            output.writeFieldBegin("id", thrift.TType.I32, 2);
            output.writeI32(obj.id);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        if (_fieldsSet > 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion cannot have more than one value");
        }
        else if (_fieldsSet < 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion must have one value set");
        }
        return;
    },
    decode(input: thrift.TProtocol): InnerUnion {
        let _fieldsSet: number = 0;
        let _returnValue: any = null;
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
                    if (fieldType === thrift.TType.STRING) {
                        _fieldsSet++;
                        const value_3: string = input.readString();
                        _returnValue = { name: value_3 };
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.I32) {
                        _fieldsSet++;
                        const value_4: number = input.readI32();
                        _returnValue = { id: value_4 };
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
        if (_fieldsSet > 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion cannot have more than one value");
        }
        else if (_fieldsSet < 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion must have one value set");
        }
        if (_returnValue !== null) {
            if (_returnValue.name) {
                return {
                    __type: InnerUnionType.InnerUnionWithName,
                    name: _returnValue.name
                };
            }
            else {
                return {
                    __type: InnerUnionType.InnerUnionWithId,
                    id: _returnValue.id
                };
            }
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read data for TUnion");
        }
    }
};
export enum MyUnionType {
    MyUnionWithUser = "user",
    MyUnionWithField2 = "field2"
}
export type MyUnion = IMyUnionWithUser | IMyUnionWithField2;
export interface IMyUnionWithUser {
    __type: MyUnionType.MyUnionWithUser;
    user: InnerUnion;
    field2?: undefined;
}
export interface IMyUnionWithField2 {
    __type: MyUnionType.MyUnionWithField2;
    user?: undefined;
    field2: string;
}
export type MyUnionArgs = IMyUnionWithUserArgs | IMyUnionWithField2Args;
export interface IMyUnionWithUserArgs {
    user: InnerUnionArgs;
    field2?: undefined;
}
export interface IMyUnionWithField2Args {
    user?: undefined;
    field2: string;
}
export const MyUnionCodec: thrift.IStructToolkit<MyUnionArgs, MyUnion> = {
    create(args: MyUnionArgs): MyUnion {
        let _fieldsSet: number = 0;
        let _returnValue: any = null;
        if (args.user != null) {
            _fieldsSet++;
            const value_5: InnerUnion = InnerUnionCodec.create(args.user);
            _returnValue = { user: value_5 };
        }
        if (args.field2 != null) {
            _fieldsSet++;
            const value_6: string = args.field2;
            _returnValue = { field2: value_6 };
        }
        if (_fieldsSet > 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion cannot have more than one value");
        }
        else if (_fieldsSet < 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion must have one value set");
        }
        if (_returnValue !== null) {
            if (_returnValue.user) {
                return {
                    __type: MyUnionType.MyUnionWithUser,
                    user: _returnValue.user
                };
            }
            else {
                return {
                    __type: MyUnionType.MyUnionWithField2,
                    field2: _returnValue.field2
                };
            }
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read data for TUnion");
        }
    },
    encode(args: MyUnionArgs, output: thrift.TProtocol): void {
        let _fieldsSet: number = 0;
        const obj = {
            user: args.user,
            field2: args.field2
        };
        output.writeStructBegin("MyUnion");
        if (obj.user != null) {
            _fieldsSet++;
            output.writeFieldBegin("user", thrift.TType.STRUCT, 1);
            InnerUnionCodec.encode(obj.user, output);
            output.writeFieldEnd();
        }
        if (obj.field2 != null) {
            _fieldsSet++;
            output.writeFieldBegin("field2", thrift.TType.STRING, 2);
            output.writeString(obj.field2);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        if (_fieldsSet > 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion cannot have more than one value");
        }
        else if (_fieldsSet < 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion must have one value set");
        }
        return;
    },
    decode(input: thrift.TProtocol): MyUnion {
        let _fieldsSet: number = 0;
        let _returnValue: any = null;
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
                    if (fieldType === thrift.TType.STRUCT) {
                        _fieldsSet++;
                        const value_7: InnerUnion = InnerUnionCodec.decode(input);
                        _returnValue = { user: value_7 };
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.STRING) {
                        _fieldsSet++;
                        const value_8: string = input.readString();
                        _returnValue = { field2: value_8 };
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
        if (_fieldsSet > 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion cannot have more than one value");
        }
        else if (_fieldsSet < 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion must have one value set");
        }
        if (_returnValue !== null) {
            if (_returnValue.user) {
                return {
                    __type: MyUnionType.MyUnionWithUser,
                    user: _returnValue.user
                };
            }
            else {
                return {
                    __type: MyUnionType.MyUnionWithField2,
                    field2: _returnValue.field2
                };
            }
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read data for TUnion");
        }
    }
};
