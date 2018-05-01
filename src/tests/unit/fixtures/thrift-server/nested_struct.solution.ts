export interface IUser {
    name: string;
    age?: thrift.Int64;
}
export interface IUser_Loose {
    name: string;
    age?: number | thrift.Int64;
}
export class User extends thrift.IStructLike  implements IUser_Loose {
    public name: string;
    public age?: number | thrift.Int64;
    constructor(args: IUser_Loose) {
        super();
        if (args.name != null) {
            this.name = args.name;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[name] is unset!");
        }
        if (args.age != null) {
            this.age = args.age;
        }
    }
    public static write(args: IUser_Loose, output: thrift.TProtocol): void {
        const obj = {
            name: args.name,
            age: (args.age != null ? (typeof args.age === "number" ? new thrift.Int64(args.age) : args.age) : thrift.Int64.fromDecimalString("45"))
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
            output.writeI64(obj.age);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
    public static read(input: thrift.TProtocol): IUser {
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
                        const value_2: thrift.Int64 = input.readI64();
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
                age: (_args.age != null ? _args.age : thrift.Int64.fromDecimalString("45"))
            };
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read User from input");
        }
    }
}
export interface IMyStruct {
    name: string;
    user: IUser;
}
export interface IMyStruct_Loose {
    name: string;
    user: IUser_Loose;
}
export class MyStruct extends thrift.IStructLike  implements IMyStruct_Loose {
    public name: string;
    public user: IUser_Loose;
    constructor(args: IMyStruct_Loose) {
        super();
        if (args.name != null) {
            this.name = args.name;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[name] is unset!");
        }
        if (args.user != null) {
            this.user = args.user;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[user] is unset!");
        }
    }
    public static write(args: IMyStruct_Loose, output: thrift.TProtocol): void {
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
            User.write(obj.user, output);
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[user] is unset!");
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
                        const value_4: IUser = User.read(input);
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
}
