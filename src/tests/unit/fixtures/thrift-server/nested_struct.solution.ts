export interface IUserArgs {
    name: string;
    age?: number;
}
export class User implements thrift.IStructLike {
    public name: string;
    public age: number;
    constructor(args?: IUserArgs) {
        if (args != null) {
            if (args.name != null) {
                this.name = args.name;
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field name is unset!");
            }
            if (args.age != null) {
                this.age = args.age;
            }
        }
    }
    public write(output: thrift.TProtocol): void {
        output.writeStructBegin("User");
        if (this.name != null) {
            output.writeFieldBegin("name", thrift.TType.STRING, 1);
            output.writeString(this.name);
            output.writeFieldEnd();
        }
        if (this.age != null) {
            output.writeFieldBegin("age", thrift.TType.I32, 2);
            output.writeI32(this.age);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
    public read(input: thrift.TProtocol): void {
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
                        this.name = value_1;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.I32) {
                        const value_2: number = input.readI32();
                        this.age = value_2;
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
        return;
    }
}
export interface IMyStructArgs {
    name: string;
    user: User;
}
export class MyStruct implements thrift.IStructLike {
    public name: string;
    public user: User;
    constructor(args?: IMyStructArgs) {
        if (args != null) {
            if (args.name != null) {
                this.name = args.name;
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field name is unset!");
            }
            if (args.user != null) {
                this.user = args.user;
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field user is unset!");
            }
        }
    }
    public write(output: thrift.TProtocol): void {
        output.writeStructBegin("MyStruct");
        if (this.name != null) {
            output.writeFieldBegin("name", thrift.TType.STRING, 1);
            output.writeString(this.name);
            output.writeFieldEnd();
        }
        if (this.user != null) {
            output.writeFieldBegin("user", thrift.TType.STRUCT, 2);
            this.user.write(output);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
    public read(input: thrift.TProtocol): void {
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
                        this.name = value_3;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.STRUCT) {
                        const value_4: User = new User();
                        value_4.read(input);
                        this.user = value_4;
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
        return;
    }
}
