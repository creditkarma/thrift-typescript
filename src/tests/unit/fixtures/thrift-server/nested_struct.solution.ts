export interface User {
    name: string;
    age?: number;
}
export const UserCodec: thrift.IStructCodec<User> = {
    encode(val: User, output: thrift.TProtocol): void {
        const obj = {
            name: val.name,
            age: val.age
        };
        output.writeStructBegin("User");
        if (obj.name != null) {
            output.writeFieldBegin("name", thrift.TType.STRING, 1);
            output.writeString(obj.name);
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[name] is unset!");
        }
        if (obj.age != null) {
            output.writeFieldBegin("age", thrift.TType.I32, 2);
            output.writeI32(obj.age);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): User {
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
                    if (fieldType === thrift.TType.STRING) {
                        const value_1: string = input.readString();
                        _args.name = value_1;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.I32) {
                        const value_2: number = input.readI32();
                        _args.age = value_2;
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
            return {
                name: _args.name,
                age: _args.age
            };
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read User from input");
        }
    }
};
export interface MyStruct {
    name: string;
    user: User;
}
export const MyStructCodec: thrift.IStructCodec<MyStruct> = {
    encode(val: MyStruct, output: thrift.TProtocol): void {
        const obj = {
            name: val.name,
            user: val.user
        };
        output.writeStructBegin("MyStruct");
        if (obj.name != null) {
            output.writeFieldBegin("name", thrift.TType.STRING, 1);
            output.writeString(obj.name);
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[name] is unset!");
        }
        if (obj.user != null) {
            output.writeFieldBegin("user", thrift.TType.STRUCT, 2);
            UserCodec.encode(obj.user, output);
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[user] is unset!");
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
                    if (fieldType === thrift.TType.STRING) {
                        const value_3: string = input.readString();
                        _args.name = value_3;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.STRUCT) {
                        const value_4: User = UserCodec.decode(input);
                        _args.user = value_4;
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
        if (_args.name !== undefined && _args.user !== undefined) {
            return {
                name: _args.name,
                user: _args.user
            };
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read MyStruct from input");
        }
    }
};
