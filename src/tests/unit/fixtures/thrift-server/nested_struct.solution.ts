export interface IUser {
    __name: "User";
    name: string;
    age?: bigint;
}
export interface IUserArgs {
    name: string;
    age?: number | string | bigint;
}
export const UserCodec: thrift.IStructCodec<IUserArgs, IUser> = {
    encode(args: IUserArgs, output: thrift.TProtocol): void {
        const obj = {
            name: args.name,
            age: (args.age != null ? (typeof args.age === "number" ? BigInt(args.age) : typeof args.age === "string" ? BigInt(args.age) : args.age) : BigInt("45"))
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
            output.writeFieldBegin("age", thrift.TType.I64, 2);
            output.writeI64((typeof obj.age === "number" ? BigInt(obj.age) : typeof obj.age === "string" ? BigInt(obj.age) : obj.age));
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): IUser {
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
                    if (fieldType === thrift.TType.I64) {
                        const value_2: bigint = input.readI64();
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
                __name: "User",
                name: _args.name,
                age: (_args.age != null ? _args.age : BigInt("45"))
            };
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read User from input");
        }
    }
};
export class User implements thrift.IStructLike, IUser {
    public name: string;
    public age?: bigint = BigInt("45");
    public readonly __name = "User";
    constructor(args: IUserArgs) {
        if (args.name != null) {
            const value_3: string = args.name;
            this.name = value_3;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[name] is unset!");
        }
        if (args.age != null) {
            const value_4: bigint = (typeof args.age === "number" ? BigInt(args.age) : typeof args.age === "string" ? BigInt(args.age) : args.age);
            this.age = value_4;
        }
    }
    public static read(input: thrift.TProtocol): User {
        return new User(UserCodec.decode(input));
    }
    public static write(args: IUserArgs, output: thrift.TProtocol): void {
        return UserCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return UserCodec.encode(this, output);
    }
}
export interface IMyStruct {
    __name: "MyStruct";
    name: string;
    user: IUser;
}
export interface IMyStructArgs {
    name: string;
    user: IUserArgs;
}
export const MyStructCodec: thrift.IStructCodec<IMyStructArgs, IMyStruct> = {
    encode(args: IMyStructArgs, output: thrift.TProtocol): void {
        const obj = {
            name: args.name,
            user: args.user
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
                    if (fieldType === thrift.TType.STRING) {
                        const value_5: string = input.readString();
                        _args.name = value_5;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.STRUCT) {
                        const value_6: IUser = UserCodec.decode(input);
                        _args.user = value_6;
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
                __name: "MyStruct",
                name: _args.name,
                user: _args.user
            };
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read MyStruct from input");
        }
    }
};
export class MyStruct implements thrift.IStructLike, IMyStruct {
    public name: string;
    public user: IUser;
    public readonly __name = "MyStruct";
    constructor(args: IMyStructArgs) {
        if (args.name != null) {
            const value_7: string = args.name;
            this.name = value_7;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[name] is unset!");
        }
        if (args.user != null) {
            const value_8: IUser = new User(args.user);
            this.user = value_8;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[user] is unset!");
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
