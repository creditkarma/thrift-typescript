export interface IUser {
    __name: "User";
    name: string;
    id: number;
}
export interface IUserArgs {
    name: string;
    id: number;
}
export const UserCodec: thrift.IStructCodec<IUserArgs, IUser> = {
    encode(args: IUserArgs, output: thrift.TProtocol): void {
        const obj = {
            name: args.name,
            id: args.id
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
                    if (fieldType === thrift.TType.I32) {
                        const value_2: number = input.readI32();
                        _args.id = value_2;
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
                id: _args.id
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
    public readonly __name = "User";
    constructor(args: IUserArgs) {
        if (args.name != null) {
            const value_3: string = args.name;
            this.name = value_3;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[name] is unset!");
        }
        if (args.id != null) {
            const value_4: number = args.id;
            this.id = value_4;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[id] is unset!");
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
    annotations: {},
    methods: {
        getUser: {
            name: "getUser",
            annotations: {},
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
                        annotations: {},
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
                                annotations: {},
                                definitionType: {
                                    type: thrift.DefinitionMetadataType.BaseType
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
                        const value_5: number = input.readI32();
                        _args.id = value_5;
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
            const value_6: number = args.id;
            this.id = value_6;
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
                        const value_7: IUser = UserCodec.decode(input);
                        _args.user = value_7;
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
            const value_8: IUser = new User(args.user);
            this.user = value_8;
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
                        const value_9: IUser = UserCodec.decode(input);
                        _args.success = value_9;
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
            const value_10: IUser = new User(args.success);
            this.success = value_10;
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
            const value_11: void = undefined;
            this.success = value_11;
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
            const value_12: void = undefined;
            this.success = value_12;
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
            const reader: thrift.TTransport = this.transport.receiver(data);
            const input: thrift.TProtocol = new this.protocol(reader);
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
    public saveUser(user: IUserArgs, context: Context): Promise<void> {
        const writer: thrift.TTransport = new this.transport();
        const output: thrift.TProtocol = new this.protocol(writer);
        output.writeMessageBegin("saveUser", thrift.MessageType.CALL, this.incrementRequestId());
        const args: ISaveUser__ArgsArgs = { user };
        SaveUser__ArgsCodec.encode(args, output);
        output.writeMessageEnd();
        return this.connection.send(writer.flush(), context).then((data: Buffer) => {
            const reader: thrift.TTransport = this.transport.receiver(data);
            const input: thrift.TProtocol = new this.protocol(reader);
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
    public ping(context?: Context): Promise<void> {
        const writer: thrift.TTransport = new this.transport();
        const output: thrift.TProtocol = new this.protocol(writer);
        output.writeMessageBegin("ping", thrift.MessageType.CALL, this.incrementRequestId());
        const args: IPing__ArgsArgs = {};
        Ping__ArgsCodec.encode(args, output);
        output.writeMessageEnd();
        return this.connection.send(writer.flush(), context).then((data: Buffer) => {
            const reader: thrift.TTransport = this.transport.receiver(data);
            const input: thrift.TProtocol = new this.protocol(reader);
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
export interface IHandler<Context extends thrift.IThriftContext = thrift.IThriftContext> {
    getUser(this: Context, id: number): IUserArgs | Promise<IUserArgs>
    saveUser(user: IUser, context: Context): void | Promise<void>;
    ping(context: Context): void | Promise<void>;
}
export class Processor<Context extends thrift.IThriftContext = thrift.IThriftContext> implements thrift.IThriftProcessor<Context> {
    protected readonly handler: IHandler<Context>;
    protected readonly transport: thrift.ITransportConstructor;
    protected readonly protocol: thrift.IProtocolConstructor;
    public static readonly metadata: thrift.IServiceMetadata = metadata;
    public readonly __metadata: thrift.IServiceMetadata = metadata;
    constructor(handler: IHandler<Context>, transport: thrift.ITransportConstructor = thrift.BufferedTransport, protocol: thrift.IProtocolConstructor = thrift.BinaryProtocol) {
        this.handler = handler;
        this.transport = transport;
        this.protocol = protocol;
    }
    public process(data: Buffer, context: Context): Promise<Buffer> {
        const transportWithData: thrift.TTransport = this.transport.receiver(data);
        const input: thrift.TProtocol = new this.protocol(transportWithData);
        return new Promise<Buffer>((resolve, reject): void => {
            const metadata: thrift.IThriftMessage = input.readMessageBegin();
            const fieldName: string = metadata.fieldName;
            const requestId: number = metadata.requestId;
            switch (fieldName) {
                case "getUser": {
                    resolve(this.process_getUser(requestId, input, context));
                    break;
                }
                case "saveUser": {
                    resolve(this.process_saveUser(requestId, input, context));
                    break;
                }
                case "ping": {
                    resolve(this.process_ping(requestId, input, context));
                    break;
                }
                default: {
                    input.skip(thrift.TType.STRUCT);
                    input.readMessageEnd();
                    const errMessage = "Unknown function " + fieldName;
                    const err = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN_METHOD, errMessage);
                    const output: thrift.TProtocol = new this.protocol(new this.transport());
                    output.writeMessageBegin(fieldName, thrift.MessageType.EXCEPTION, requestId);
                    thrift.TApplicationExceptionCodec.encode(err, output);
                    output.writeMessageEnd();
                    resolve(output.flush());
                    break;
                }
            }
        });
    }
    public readRequest(methodName: "getUser", input: thrift.TProtocol | Buffer): IGetUser__Args
    public readRequest(methodName: "saveUser", input: thrift.TProtocol | Buffer): ISaveUser__Args
    public readRequest(methodName: "ping", input: thrift.TProtocol | Buffer): void
    public readRequest(methodName: string, input: thrift.TProtocol | Buffer): any {
        if (input instanceof Buffer) {
            const transportWithData: thrift.TTransport = this.transport.receiver(input);
            input = new this.protocol(transportWithData);
            input.readMessageBegin();
        }
        switch (methodName) {
            case "getUser": {
                const args: IGetUser__Args = GetUser__ArgsCodec.decode(input);
                input.readMessageEnd();
                return args;
            }
            case "saveUser": {
                const args: ISaveUser__Args = SaveUser__ArgsCodec.decode(input);
                input.readMessageEnd();
                return args;
            }
            case "ping": {
                return undefined;
            }
            default: {
                throw new Error("Unable to read request for unknown function " + methodName);
            }
        }
    }
    public writeResponse(methodName: "getUser" | "saveUser" | "ping", requestId: number, data: IUserArgs): Buffer {
        switch (methodName) {
            case "getUser": {
                const result: IGetUser__ResultArgs = { success: data };
                const output: thrift.TProtocol = new this.protocol(new this.transport());
                output.writeMessageBegin(methodName, thrift.MessageType.REPLY, requestId);
                GetUser__ResultCodec.encode(result, output);
                output.writeMessageEnd();
                return output.flush();
            }
            case "saveUser": {

            }
            case "ping": {
                const result: IPing__ResultArgs = { success: data };
                const output: thrift.TProtocol = new this.protocol(new this.transport());
                output.writeMessageBegin("ping", thrift.MessageType.REPLY, requestId);
                Ping__ResultCodec.encode(result, output);
                output.writeMessageEnd();
                return output.flush();
            }
            default: {
                throw new Error("Unable to write response for nknown function " + methodName);
            }
        }
    }
    public writeError(methodName: string, requestId: number, err: Error): Buffer {
        const result: thrift.TApplicationException = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, err.message);
        const output: thrift.TProtocol = new this.protocol(new this.transport());
        output.writeMessageBegin(methodName, thrift.MessageType.EXCEPTION, requestId);
        thrift.TApplicationExceptionCodec.encode(result, output);
        output.writeMessageEnd();
        return output.flush();
    }
    private process_getUser(requestId: number, input: thrift.TProtocol, context: Context): Promise<Buffer> {
        return new Promise<IUserArgs>((resolve, reject): void => {
            try {
                const args: IGetUser__Args = this.readRequest("getUser", input);
                resolve(this.handler.getUser.bind(context)(args.id, context));
            }
            catch (err) {
                reject(err);
            }
        }).then((data: IUserArgs): Buffer => {
            return this.writeResponse("getUser", requestId, data);
        }).catch((err: Error): Buffer => {
            return this.writeError("getUser", requestId, err);
        });
    }
    private process_saveUser(requestId: number, input: thrift.TProtocol, context: Context): Promise<Buffer> {
        return new Promise<void>((resolve, reject): void => {
            try {
                const args: ISaveUser__Args = SaveUser__ArgsCodec.decode(input);
                input.readMessageEnd();
                resolve(this.handler.saveUser(args.user, context));
            }
            catch (err) {
                reject(err);
            }
        }).then((data: void): Buffer => {
            const result: ISaveUser__ResultArgs = { success: data };
            output.writeMessageBegin("saveUser", thrift.MessageType.REPLY, requestId);
            SaveUser__ResultCodec.encode(result, output);
            output.writeMessageEnd();
            return output.flush();
        }).catch((err: Error): Buffer => {
            const result: thrift.TApplicationException = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, err.message);
            output.writeMessageBegin("saveUser", thrift.MessageType.EXCEPTION, requestId);
            thrift.TApplicationExceptionCodec.encode(result, output);
            output.writeMessageEnd();
            return output.flush();
        });
    }
    private process_ping(requestId: number, input: thrift.TProtocol, context: Context): Promise<Buffer> {
        return new Promise<void>((resolve, reject): void => {
            try {
                input.readMessageEnd();
                resolve(this.handler.ping(context));
            }
            catch (err) {
                reject(err);
            }
        }).then((data: void): Buffer => {
            return this.writeResponse("ping", requestId, data)
        }).catch((err: Error): Buffer => {
            const result: thrift.TApplicationException = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, err.message);
            output.writeMessageBegin("ping", thrift.MessageType.EXCEPTION, requestId);
            thrift.TApplicationExceptionCodec.encode(result, output);
            output.writeMessageEnd();
            return output.flush();
        });
    }
}
