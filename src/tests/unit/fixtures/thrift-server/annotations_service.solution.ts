export { IUser as IPerson };
export { IUserArgs as IPersonArgs };
export { User as Person };
export { UserCodec as PersonCodec };
export interface IGroup {
    __name: "Group";
    name: string;
}
export interface IGroupArgs {
    name: string;
}
export const GroupCodec: thrift.IStructCodec<IGroupArgs, IGroup> = {
    encode(args: IGroupArgs, output: thrift.TProtocol): void {
        const obj = {
            name: args.name
        };
        output.writeStructBegin("Group");
        if (obj.name != null) {
            output.writeFieldBegin("name", thrift.TType.STRING, 1);
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
    decode(input: thrift.TProtocol): IGroup {
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
                default: {
                    input.skip(fieldType);
                }
            }
            input.readFieldEnd();
        }
        input.readStructEnd();
        if (_args.name !== undefined) {
            return {
                __name: "Group",
                name: _args.name
            };
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read Group from input");
        }
    }
};
export class Group implements thrift.IStructLike, IGroup {
    public name: string;
    public readonly __name = "Group";
    constructor(args: IGroupArgs) {
        if (args.name != null) {
            const value_2: string = args.name;
            this.name = value_2;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[name] is unset!");
        }
    }
    public static read(input: thrift.TProtocol): Group {
        return new Group(GroupCodec.decode(input));
    }
    public static write(args: IGroupArgs, output: thrift.TProtocol): void {
        return GroupCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return GroupCodec.encode(this, output);
    }
}
export interface IUser {
    __name: "User";
    name: string;
    id: number;
    group?: IGroup;
}
export interface IUserArgs {
    name: string;
    id: number;
    group?: IGroupArgs;
}
export const UserCodec: thrift.IStructCodec<IUserArgs, IUser> = {
    encode(args: IUserArgs, output: thrift.TProtocol): void {
        const obj = {
            name: args.name,
            id: args.id,
            group: args.group
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
        if (obj.id != null) {
            output.writeFieldBegin("id", thrift.TType.I32, 2);
            output.writeI32(obj.id);
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[id] is unset!");
        }
        if (obj.group != null) {
            output.writeFieldBegin("group", thrift.TType.STRUCT, 3);
            GroupCodec.encode(obj.group, output);
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
                        const value_3: string = input.readString();
                        _args.name = value_3;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.I32) {
                        const value_4: number = input.readI32();
                        _args.id = value_4;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 3:
                    if (fieldType === thrift.TType.STRUCT) {
                        const value_5: IGroup = GroupCodec.decode(input);
                        _args.group = value_5;
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
        if (_args.name !== undefined && _args.id !== undefined) {
            return {
                __name: "User",
                name: _args.name,
                id: _args.id,
                group: _args.group
            };
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read User from input");
        }
    }
};
export class User implements thrift.IStructLike, IUser {
    public name: string;
    public id: number;
    public group?: IGroup;
    public readonly __name = "User";
    constructor(args: IUserArgs) {
        if (args.name != null) {
            const value_6: string = args.name;
            this.name = value_6;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[name] is unset!");
        }
        if (args.id != null) {
            const value_7: number = args.id;
            this.id = value_7;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[id] is unset!");
        }
        if (args.group != null) {
            const value_8: IGroup = new Group(args.group);
            this.group = value_8;
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
export const metadata: thrift.IServiceMetadata = {
    name: "MyService",
    annotations: {
        foo: "bar",
        two: "three",
        alone: "",
        'dot.foo': "bar",
        'dot.lonely': ""
    },
    methods: {
        getUser: {
            name: "getUser",
            annotations: {
                foo: "bar",
                two: "three",
                lonely: "",
                'dot.foo': "bar",
                'dot.lonely': ""
            },
            arguments: [
                {
                    name: "id",
                    fieldId: 1,
                    annotations: {},
                    definitionType: {
                        type: thrift.DefinitionMetadataType.BaseType
                    }
                }
            ]
        },
        saveUser: {
            name: "saveUser",
            annotations: {},
            arguments: [
                {
                    name: "user",
                    fieldId: 1,
                    annotations: {},
                    definitionType: {
                        type: thrift.DefinitionMetadataType.StructType,
                        name: "User",
                        annotations: {
                            entity: ""
                        },
                        fields: {
                            name: {
                                name: "name",
                                fieldId: 1,
                                annotations: {},
                                definitionType: {
                                    type: thrift.DefinitionMetadataType.BaseType
                                }
                            },
                            id: {
                                name: "id",
                                fieldId: 2,
                                annotations: {
                                    sensitive: ""
                                },
                                definitionType: {
                                    type: thrift.DefinitionMetadataType.BaseType
                                }
                            },
                            group: {
                                name: "group",
                                fieldId: 3,
                                annotations: {
                                    entity: ""
                                },
                                definitionType: {
                                    type: thrift.DefinitionMetadataType.StructType,
                                    name: "Group",
                                    annotations: {},
                                    fields: {
                                        name: {
                                            name: "name",
                                            fieldId: 1,
                                            annotations: {},
                                            definitionType: {
                                                type: thrift.DefinitionMetadataType.BaseType
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            ]
        },
        deleteUser: {
            name: "deleteUser",
            annotations: {},
            arguments: [
                {
                    name: "user",
                    fieldId: 1,
                    annotations: {},
                    definitionType: {
                        type: thrift.DefinitionMetadataType.StructType,
                        name: "User",
                        annotations: {
                            entity: ""
                        },
                        fields: {
                            name: {
                                name: "name",
                                fieldId: 1,
                                annotations: {},
                                definitionType: {
                                    type: thrift.DefinitionMetadataType.BaseType
                                }
                            },
                            id: {
                                name: "id",
                                fieldId: 2,
                                annotations: {
                                    sensitive: ""
                                },
                                definitionType: {
                                    type: thrift.DefinitionMetadataType.BaseType
                                }
                            },
                            group: {
                                name: "group",
                                fieldId: 3,
                                annotations: {
                                    entity: ""
                                },
                                definitionType: {
                                    type: thrift.DefinitionMetadataType.StructType,
                                    name: "Group",
                                    annotations: {},
                                    fields: {
                                        name: {
                                            name: "name",
                                            fieldId: 1,
                                            annotations: {},
                                            definitionType: {
                                                type: thrift.DefinitionMetadataType.BaseType
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            ]
        },
        ping: {
            name: "ping",
            annotations: {},
            arguments: []
        }
    }
};
export interface IGetUser__Args {
    __name: "GetUser__Args";
    id: number;
}
export interface IGetUser__ArgsArgs {
    id: number;
}
export const GetUser__ArgsCodec: thrift.IStructCodec<IGetUser__ArgsArgs, IGetUser__Args> = {
    encode(args: IGetUser__ArgsArgs, output: thrift.TProtocol): void {
        const obj = {
            id: args.id
        };
        output.writeStructBegin("GetUser__Args");
        if (obj.id != null) {
            output.writeFieldBegin("id", thrift.TType.I32, 1);
            output.writeI32(obj.id);
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[id] is unset!");
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): IGetUser__Args {
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
                        const value_9: number = input.readI32();
                        _args.id = value_9;
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
        if (_args.id !== undefined) {
            return {
                __name: "GetUser__Args",
                id: _args.id
            };
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read GetUser__Args from input");
        }
    }
};
export class GetUser__Args implements thrift.IStructLike, IGetUser__Args {
    public id: number;
    public readonly __name = "GetUser__Args";
    constructor(args: IGetUser__ArgsArgs) {
        if (args.id != null) {
            const value_10: number = args.id;
            this.id = value_10;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[id] is unset!");
        }
    }
    public static read(input: thrift.TProtocol): GetUser__Args {
        return new GetUser__Args(GetUser__ArgsCodec.decode(input));
    }
    public static write(args: IGetUser__ArgsArgs, output: thrift.TProtocol): void {
        return GetUser__ArgsCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return GetUser__ArgsCodec.encode(this, output);
    }
}
export interface ISaveUser__Args {
    __name: "SaveUser__Args";
    user: IUser;
}
export interface ISaveUser__ArgsArgs {
    user: IUserArgs;
}
export const SaveUser__ArgsCodec: thrift.IStructCodec<ISaveUser__ArgsArgs, ISaveUser__Args> = {
    encode(args: ISaveUser__ArgsArgs, output: thrift.TProtocol): void {
        const obj = {
            user: args.user
        };
        output.writeStructBegin("SaveUser__Args");
        if (obj.user != null) {
            output.writeFieldBegin("user", thrift.TType.STRUCT, 1);
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
    decode(input: thrift.TProtocol): ISaveUser__Args {
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
                    if (fieldType === thrift.TType.STRUCT) {
                        const value_11: IUser = UserCodec.decode(input);
                        _args.user = value_11;
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
        if (_args.user !== undefined) {
            return {
                __name: "SaveUser__Args",
                user: _args.user
            };
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read SaveUser__Args from input");
        }
    }
};
export class SaveUser__Args implements thrift.IStructLike, ISaveUser__Args {
    public user: IUser;
    public readonly __name = "SaveUser__Args";
    constructor(args: ISaveUser__ArgsArgs) {
        if (args.user != null) {
            const value_12: IUser = new User(args.user);
            this.user = value_12;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[user] is unset!");
        }
    }
    public static read(input: thrift.TProtocol): SaveUser__Args {
        return new SaveUser__Args(SaveUser__ArgsCodec.decode(input));
    }
    public static write(args: ISaveUser__ArgsArgs, output: thrift.TProtocol): void {
        return SaveUser__ArgsCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return SaveUser__ArgsCodec.encode(this, output);
    }
}
export interface IDeleteUser__Args {
    __name: "DeleteUser__Args";
    user: IPerson;
}
export interface IDeleteUser__ArgsArgs {
    user: IPersonArgs;
}
export const DeleteUser__ArgsCodec: thrift.IStructCodec<IDeleteUser__ArgsArgs, IDeleteUser__Args> = {
    encode(args: IDeleteUser__ArgsArgs, output: thrift.TProtocol): void {
        const obj = {
            user: args.user
        };
        output.writeStructBegin("DeleteUser__Args");
        if (obj.user != null) {
            output.writeFieldBegin("user", thrift.TType.STRUCT, 1);
            PersonCodec.encode(obj.user, output);
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[user] is unset!");
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): IDeleteUser__Args {
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
                    if (fieldType === thrift.TType.STRUCT) {
                        const value_13: IPerson = PersonCodec.decode(input);
                        _args.user = value_13;
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
        if (_args.user !== undefined) {
            return {
                __name: "DeleteUser__Args",
                user: _args.user
            };
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read DeleteUser__Args from input");
        }
    }
};
export class DeleteUser__Args implements thrift.IStructLike, IDeleteUser__Args {
    public user: IPerson;
    public readonly __name = "DeleteUser__Args";
    constructor(args: IDeleteUser__ArgsArgs) {
        if (args.user != null) {
            const value_14: IPerson = new Person(args.user);
            this.user = value_14;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[user] is unset!");
        }
    }
    public static read(input: thrift.TProtocol): DeleteUser__Args {
        return new DeleteUser__Args(DeleteUser__ArgsCodec.decode(input));
    }
    public static write(args: IDeleteUser__ArgsArgs, output: thrift.TProtocol): void {
        return DeleteUser__ArgsCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return DeleteUser__ArgsCodec.encode(this, output);
    }
}
export interface IPing__Args {
    __name: "Ping__Args";
}
export interface IPing__ArgsArgs {
}
export const Ping__ArgsCodec: thrift.IStructCodec<IPing__ArgsArgs, IPing__Args> = {
    encode(args: IPing__ArgsArgs, output: thrift.TProtocol): void {
        output.writeStructBegin("Ping__Args");
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): IPing__Args {
        input.readStructBegin();
        while (true) {
            const ret: thrift.IThriftField = input.readFieldBegin();
            const fieldType: thrift.TType = ret.fieldType;
            const fieldId: number = ret.fieldId;
            if (fieldType === thrift.TType.STOP) {
                break;
            }
            switch (fieldId) {
                default: {
                    input.skip(fieldType);
                }
            }
            input.readFieldEnd();
        }
        input.readStructEnd();
        return {
            __name: "Ping__Args"
        };
    }
};
export class Ping__Args implements thrift.IStructLike, IPing__Args {
    public readonly __name = "Ping__Args";
    constructor(args: IPing__ArgsArgs = {}) {
    }
    public static read(input: thrift.TProtocol): Ping__Args {
        return new Ping__Args(Ping__ArgsCodec.decode(input));
    }
    public static write(args: IPing__ArgsArgs, output: thrift.TProtocol): void {
        return Ping__ArgsCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return Ping__ArgsCodec.encode(this, output);
    }
}
export interface IGetUser__Result {
    __name: "GetUser__Result";
    success?: IUser;
}
export interface IGetUser__ResultArgs {
    success?: IUserArgs;
}
export const GetUser__ResultCodec: thrift.IStructCodec<IGetUser__ResultArgs, IGetUser__Result> = {
    encode(args: IGetUser__ResultArgs, output: thrift.TProtocol): void {
        const obj = {
            success: args.success
        };
        output.writeStructBegin("GetUser__Result");
        if (obj.success != null) {
            output.writeFieldBegin("success", thrift.TType.STRUCT, 0);
            UserCodec.encode(obj.success, output);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): IGetUser__Result {
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
                case 0:
                    if (fieldType === thrift.TType.STRUCT) {
                        const value_15: IUser = UserCodec.decode(input);
                        _args.success = value_15;
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
        return {
            __name: "GetUser__Result",
            success: _args.success
        };
    }
};
export class GetUser__Result implements thrift.IStructLike, IGetUser__Result {
    public success?: IUser;
    public readonly __name = "GetUser__Result";
    constructor(args: IGetUser__ResultArgs = {}) {
        if (args.success != null) {
            const value_16: IUser = new User(args.success);
            this.success = value_16;
        }
    }
    public static read(input: thrift.TProtocol): GetUser__Result {
        return new GetUser__Result(GetUser__ResultCodec.decode(input));
    }
    public static write(args: IGetUser__ResultArgs, output: thrift.TProtocol): void {
        return GetUser__ResultCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return GetUser__ResultCodec.encode(this, output);
    }
}
export interface ISaveUser__Result {
    __name: "SaveUser__Result";
    success?: void;
}
export interface ISaveUser__ResultArgs {
    success?: void;
}
export const SaveUser__ResultCodec: thrift.IStructCodec<ISaveUser__ResultArgs, ISaveUser__Result> = {
    encode(args: ISaveUser__ResultArgs, output: thrift.TProtocol): void {
        output.writeStructBegin("SaveUser__Result");
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): ISaveUser__Result {
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
                case 0:
                    if (fieldType === thrift.TType.VOID) {
                        input.skip(fieldType);
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
        return {
            __name: "SaveUser__Result",
            success: _args.success
        };
    }
};
export class SaveUser__Result implements thrift.IStructLike, ISaveUser__Result {
    public success?: void;
    public readonly __name = "SaveUser__Result";
    constructor(args: ISaveUser__ResultArgs = {}) {
        if (args.success != null) {
            const value_17: void = undefined;
            this.success = value_17;
        }
    }
    public static read(input: thrift.TProtocol): SaveUser__Result {
        return new SaveUser__Result(SaveUser__ResultCodec.decode(input));
    }
    public static write(args: ISaveUser__ResultArgs, output: thrift.TProtocol): void {
        return SaveUser__ResultCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return SaveUser__ResultCodec.encode(this, output);
    }
}
export interface IDeleteUser__Result {
    __name: "DeleteUser__Result";
    success?: void;
}
export interface IDeleteUser__ResultArgs {
    success?: void;
}
export const DeleteUser__ResultCodec: thrift.IStructCodec<IDeleteUser__ResultArgs, IDeleteUser__Result> = {
    encode(args: IDeleteUser__ResultArgs, output: thrift.TProtocol): void {
        output.writeStructBegin("DeleteUser__Result");
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): IDeleteUser__Result {
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
                case 0:
                    if (fieldType === thrift.TType.VOID) {
                        input.skip(fieldType);
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
        return {
            __name: "DeleteUser__Result",
            success: _args.success
        };
    }
};
export class DeleteUser__Result implements thrift.IStructLike, IDeleteUser__Result {
    public success?: void;
    public readonly __name = "DeleteUser__Result";
    constructor(args: IDeleteUser__ResultArgs = {}) {
        if (args.success != null) {
            const value_18: void = undefined;
            this.success = value_18;
        }
    }
    public static read(input: thrift.TProtocol): DeleteUser__Result {
        return new DeleteUser__Result(DeleteUser__ResultCodec.decode(input));
    }
    public static write(args: IDeleteUser__ResultArgs, output: thrift.TProtocol): void {
        return DeleteUser__ResultCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return DeleteUser__ResultCodec.encode(this, output);
    }
}
export interface IPing__Result {
    __name: "Ping__Result";
    success?: void;
}
export interface IPing__ResultArgs {
    success?: void;
}
export const Ping__ResultCodec: thrift.IStructCodec<IPing__ResultArgs, IPing__Result> = {
    encode(args: IPing__ResultArgs, output: thrift.TProtocol): void {
        output.writeStructBegin("Ping__Result");
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): IPing__Result {
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
                case 0:
                    if (fieldType === thrift.TType.VOID) {
                        input.skip(fieldType);
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
        return {
            __name: "Ping__Result",
            success: _args.success
        };
    }
};
export class Ping__Result implements thrift.IStructLike, IPing__Result {
    public success?: void;
    public readonly __name = "Ping__Result";
    constructor(args: IPing__ResultArgs = {}) {
        if (args.success != null) {
            const value_19: void = undefined;
            this.success = value_19;
        }
    }
    public static read(input: thrift.TProtocol): Ping__Result {
        return new Ping__Result(Ping__ResultCodec.decode(input));
    }
    public static write(args: IPing__ResultArgs, output: thrift.TProtocol): void {
        return Ping__ResultCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return Ping__ResultCodec.encode(this, output);
    }
}
export class Client<Context extends thrift.IRequestContext = thrift.IRequestContext> implements thrift.IThriftClient {
    public static readonly metadata: thrift.IServiceMetadata = metadata;
    public readonly __metadata: thrift.IServiceMetadata = metadata;
    protected _requestId: number;
    protected transport: thrift.ITransportConstructor;
    protected protocol: thrift.IProtocolConstructor;
    protected connection: thrift.IThriftConnection<Context>;
    constructor(connection: thrift.IThriftConnection<Context>) {
        this._requestId = 0;
        this.transport = connection.Transport;
        this.protocol = connection.Protocol;
        this.connection = connection;
    }
    protected incrementRequestId(): number {
        return this._requestId += 1;
    }
    public getUser(id: number, context?: Context): Promise<IUser> {
        const writer: thrift.TTransport = new this.transport();
        const output: thrift.TProtocol = new this.protocol(writer);
        output.writeMessageBegin("getUser", thrift.MessageType.CALL, this.incrementRequestId());
        const args: IGetUser__ArgsArgs = { id };
        GetUser__ArgsCodec.encode(args, output);
        output.writeMessageEnd();
        return this.connection.send(writer.flush(), context).then((data: Buffer) => {
            const reader: thrift.TTransport = this.Transport.receiver(data);
            const input: thrift.TProtocol = new this.Protocol(reader);
            try {
                const { fieldName: fieldName, messageType: messageType }: thrift.IThriftMessage = input.readMessageBegin();
                if (fieldName === "getUser") {
                    if (messageType === thrift.MessageType.EXCEPTION) {
                        const err: thrift.TApplicationException = thrift.TApplicationExceptionCodec.decode(input);
                        input.readMessageEnd();
                        return Promise.reject(err);
                    }
                    else {
                        const result: IGetUser__Result = GetUser__ResultCodec.decode(input);
                        input.readMessageEnd();
                        if (result.success != null) {
                            return Promise.resolve(result.success);
                        }
                        else {
                            return Promise.reject(new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, "getUser failed: unknown result"));
                        }
                    }
                }
                else {
                    return Promise.reject(new thrift.TApplicationException(thrift.TApplicationExceptionType.WRONG_METHOD_NAME, "Received a response to an unknown RPC function: " + fieldName));
                }
            }
            catch (err) {
                return Promise.reject(err);
            }
        });
    }
    public saveUser(user: IUserArgs, context?: Context): Promise<void> {
        const writer: thrift.TTransport = new this.transport();
        const output: thrift.TProtocol = new this.protocol(writer);
        output.writeMessageBegin("saveUser", thrift.MessageType.CALL, this.incrementRequestId());
        const args: ISaveUser__ArgsArgs = { user };
        SaveUser__ArgsCodec.encode(args, output);
        output.writeMessageEnd();
        return this.connection.send(writer.flush(), context).then((data: Buffer) => {
            const reader: thrift.TTransport = this.Transport.receiver(data);
            const input: thrift.TProtocol = new this.Protocol(reader);
            try {
                const { fieldName: fieldName, messageType: messageType }: thrift.IThriftMessage = input.readMessageBegin();
                if (fieldName === "saveUser") {
                    if (messageType === thrift.MessageType.EXCEPTION) {
                        const err: thrift.TApplicationException = thrift.TApplicationExceptionCodec.decode(input);
                        input.readMessageEnd();
                        return Promise.reject(err);
                    }
                    else {
                        const result: ISaveUser__Result = SaveUser__ResultCodec.decode(input);
                        input.readMessageEnd();
                        return Promise.resolve(result.success);
                    }
                }
                else {
                    return Promise.reject(new thrift.TApplicationException(thrift.TApplicationExceptionType.WRONG_METHOD_NAME, "Received a response to an unknown RPC function: " + fieldName));
                }
            }
            catch (err) {
                return Promise.reject(err);
            }
        });
    }
    public deleteUser(user: IPersonArgs, context?: Context): Promise<void> {
        const writer: thrift.TTransport = new this.transport();
        const output: thrift.TProtocol = new this.protocol(writer);
        output.writeMessageBegin("deleteUser", thrift.MessageType.CALL, this.incrementRequestId());
        const args: IDeleteUser__ArgsArgs = { user };
        DeleteUser__ArgsCodec.encode(args, output);
        output.writeMessageEnd();
        return this.connection.send(writer.flush(), context).then((data: Buffer) => {
            const reader: thrift.TTransport = this.Transport.receiver(data);
            const input: thrift.TProtocol = new this.Protocol(reader);
            try {
                const { fieldName: fieldName, messageType: messageType }: thrift.IThriftMessage = input.readMessageBegin();
                if (fieldName === "deleteUser") {
                    if (messageType === thrift.MessageType.EXCEPTION) {
                        const err: thrift.TApplicationException = thrift.TApplicationExceptionCodec.decode(input);
                        input.readMessageEnd();
                        return Promise.reject(err);
                    }
                    else {
                        const result: IDeleteUser__Result = DeleteUser__ResultCodec.decode(input);
                        input.readMessageEnd();
                        return Promise.resolve(result.success);
                    }
                }
                else {
                    return Promise.reject(new thrift.TApplicationException(thrift.TApplicationExceptionType.WRONG_METHOD_NAME, "Received a response to an unknown RPC function: " + fieldName));
                }
            }
            catch (err) {
                return Promise.reject(err);
            }
        });
    }
    public ping(context?: Context): Promise<void> {
        const writer: thrift.TTransport = new this.transport();
        const output: thrift.TProtocol = new this.protocol(writer);
        output.writeMessageBegin("ping", thrift.MessageType.CALL, this.incrementRequestId());
        const args: IPing__ArgsArgs = {};
        Ping__ArgsCodec.encode(args, output);
        output.writeMessageEnd();
        return this.connection.send(writer.flush(), context).then((data: Buffer) => {
            const reader: thrift.TTransport = this.Transport.receiver(data);
            const input: thrift.TProtocol = new this.Protocol(reader);
            try {
                const { fieldName: fieldName, messageType: messageType }: thrift.IThriftMessage = input.readMessageBegin();
                if (fieldName === "ping") {
                    if (messageType === thrift.MessageType.EXCEPTION) {
                        const err: thrift.TApplicationException = thrift.TApplicationExceptionCodec.decode(input);
                        input.readMessageEnd();
                        return Promise.reject(err);
                    }
                    else {
                        const result: IPing__Result = Ping__ResultCodec.decode(input);
                        input.readMessageEnd();
                        return Promise.resolve(result.success);
                    }
                }
                else {
                    return Promise.reject(new thrift.TApplicationException(thrift.TApplicationExceptionType.WRONG_METHOD_NAME, "Received a response to an unknown RPC function: " + fieldName));
                }
            }
            catch (err) {
                return Promise.reject(err);
            }
        });
    }
}
export interface IHandler<Context extends object = {}> {
    getUser(id: number, context: thrift.ThriftContext<Context>): IUserArgs | Promise<IUserArgs>;
    saveUser(user: IUser, context: thrift.ThriftContext<Context>): void | Promise<void>;
    deleteUser(user: IPerson, context: thrift.ThriftContext<Context>): void | Promise<void>;
    ping(context: thrift.ThriftContext<Context>): void | Promise<void>;
}
export type ReadRequestData = {
    methodName: "getUser";
    requestId: number;
    data: IGetUser__Args;
} | {
    methodName: "saveUser";
    requestId: number;
    data: ISaveUser__Args;
} | {
    methodName: "deleteUser";
    requestId: number;
    data: IDeleteUser__Args;
} | {
    methodName: "ping";
    requestId: number;
    data: IPing__Args;
};
export class Processor<Context extends object = {}> implements thrift.IThriftProcessor<Context> {
    protected readonly handler: IHandler<Context>;
    public static readonly metadata: thrift.IServiceMetadata = metadata;
    public readonly __metadata: thrift.IServiceMetadata = metadata;
    public readonly Transport: thrift.ITransportConstructor;
    public readonly Protocol: thrift.IProtocolConstructor;
    constructor(handler: IHandler<Context>, Transport: thrift.ITransportConstructor = thrift.BufferedTransport, Protocol: thrift.IProtocolConstructor = thrift.BinaryProtocol) {
        this.handler = handler;
        this.Transport = Transport;
        this.Protocol = Protocol;
    }
    public process(data: Buffer, context: thrift.ThriftContext<Context>): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject): void => {
            const metadata: ReadRequestData = this.readRequest(data);
            switch (metadata.methodName) {
                case "getUser": {
                    resolve(this.process_getUser(metadata.data, metadata.requestId, context));
                    break;
                }
                case "saveUser": {
                    resolve(this.process_saveUser(metadata.data, metadata.requestId, context));
                    break;
                }
                case "deleteUser": {
                    resolve(this.process_deleteUser(metadata.data, metadata.requestId, context));
                    break;
                }
                case "ping": {
                    resolve(this.process_ping(metadata.data, metadata.requestId, context));
                    break;
                }
                default: {
                    const failed: any = metadata;
                    const errMessage: string = "Unknown function " + failed.methodName;
                    const err: Error = new Error(errMessage);
                    resolve(this.writeError(failed.methodName, failed.requestId, err));
                    break;
                }
            }
        });
    }
    public readRequest(data: Buffer): ReadRequestData {
        const transportWithData: thrift.TTransport = this.Transport.receiver(data);
        const input: thrift.TProtocol = new this.Protocol(transportWithData);
        const metadata: thrift.IThriftMessage = input.readMessageBegin();
        const fieldName: string = metadata.fieldName;
        const requestId: number = metadata.requestId;
        switch (fieldName) {
            case "getUser": {
                const data: IGetUser__Args = GetUser__ArgsCodec.decode(input);
                input.readMessageEnd();
                return {
                    methodName: fieldName,
                    requestId: requestId,
                    data: data
                };
            }
            case "saveUser": {
                const data: ISaveUser__Args = SaveUser__ArgsCodec.decode(input);
                input.readMessageEnd();
                return {
                    methodName: fieldName,
                    requestId: requestId,
                    data: data
                };
            }
            case "deleteUser": {
                const data: IDeleteUser__Args = DeleteUser__ArgsCodec.decode(input);
                input.readMessageEnd();
                return {
                    methodName: fieldName,
                    requestId: requestId,
                    data: data
                };
            }
            case "ping": {
                const data: IPing__Args = Ping__ArgsCodec.decode(input);
                input.readMessageEnd();
                return {
                    methodName: fieldName,
                    requestId: requestId,
                    data: data
                };
            }
            default: {
                input.skip(thrift.TType.STRUCT);
                input.readMessageEnd();
                throw new Error("Unable to read request for unknown function " + fieldName);
            }
        }
    }
    public writeResponse(methodName: string, data: any, requestId: number): Buffer {
        const output: thrift.TProtocol = new this.Protocol(new this.Transport());
        switch (methodName) {
            case "getUser": {
                const result: IGetUser__ResultArgs = { success: data };
                output.writeMessageBegin("getUser", thrift.MessageType.REPLY, requestId);
                GetUser__ResultCodec.encode(result, output);
                output.writeMessageEnd();
                return output.flush();
            }
            case "saveUser": {
                const result: ISaveUser__ResultArgs = { success: data };
                output.writeMessageBegin("saveUser", thrift.MessageType.REPLY, requestId);
                SaveUser__ResultCodec.encode(result, output);
                output.writeMessageEnd();
                return output.flush();
            }
            case "deleteUser": {
                const result: IDeleteUser__ResultArgs = { success: data };
                output.writeMessageBegin("deleteUser", thrift.MessageType.REPLY, requestId);
                DeleteUser__ResultCodec.encode(result, output);
                output.writeMessageEnd();
                return output.flush();
            }
            case "ping": {
                const result: IPing__ResultArgs = { success: data };
                output.writeMessageBegin("ping", thrift.MessageType.REPLY, requestId);
                Ping__ResultCodec.encode(result, output);
                output.writeMessageEnd();
                return output.flush();
            }
            default: {
                throw new Error("Unable to write response for unknown function " + methodName);
            }
        }
    }
    public writeError(methodName: string, requestId: number, err: Error): Buffer {
        const output: thrift.TProtocol = new this.Protocol(new this.Transport());
        const result: thrift.TApplicationException = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, err.message);
        output.writeMessageBegin(methodName, thrift.MessageType.EXCEPTION, requestId);
        thrift.TApplicationExceptionCodec.encode(result, output);
        output.writeMessageEnd();
        return output.flush();
    }
    private process_getUser(args: IGetUser__Args, requestId: number, context: thrift.ThriftContext<Context>): Promise<Buffer> {
        return new Promise<IUserArgs>((resolve, reject): void => {
            try {
                resolve(this.handler.getUser(args.id, context));
            }
            catch (err) {
                reject(err);
            }
        }).then((data: IUserArgs): Buffer => {
            return this.writeResponse("getUser", data, requestId);
        }).catch((err: Error): Buffer => {
            return this.writeError("getUser", requestId, err);
        });
    }
    private process_saveUser(args: ISaveUser__Args, requestId: number, context: thrift.ThriftContext<Context>): Promise<Buffer> {
        return new Promise<void>((resolve, reject): void => {
            try {
                resolve(this.handler.saveUser(args.user, context));
            }
            catch (err) {
                reject(err);
            }
        }).then((data: void): Buffer => {
            return this.writeResponse("saveUser", data, requestId);
        }).catch((err: Error): Buffer => {
            return this.writeError("saveUser", requestId, err);
        });
    }
    private process_deleteUser(args: IDeleteUser__Args, requestId: number, context: thrift.ThriftContext<Context>): Promise<Buffer> {
        return new Promise<void>((resolve, reject): void => {
            try {
                resolve(this.handler.deleteUser(args.user, context));
            }
            catch (err) {
                reject(err);
            }
        }).then((data: void): Buffer => {
            return this.writeResponse("deleteUser", data, requestId);
        }).catch((err: Error): Buffer => {
            return this.writeError("deleteUser", requestId, err);
        });
    }
    private process_ping(args: IPing__Args, requestId: number, context: thrift.ThriftContext<Context>): Promise<Buffer> {
        return new Promise<void>((resolve, reject): void => {
            try {
                resolve(this.handler.ping(context));
            }
            catch (err) {
                reject(err);
            }
        }).then((data: void): Buffer => {
            return this.writeResponse("ping", data, requestId);
        }).catch((err: Error): Buffer => {
            return this.writeError("ping", requestId, err);
        });
    }
}
