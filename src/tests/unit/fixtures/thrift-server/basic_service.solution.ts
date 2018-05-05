export interface IUser {
    name: string;
    id: number;
}
export interface IUser_Loose {
    name: string;
    id: number;
}
export const UserCodec: thrift.IStructCodec<IUser_Loose, IUser> = {
    encode(args: IUser_Loose, output: thrift.TProtocol): void {
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
                name: _args.name,
                id: _args.id
            };
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read User from input");
        }
    }
};
export class User extends thrift.StructLike  implements IUser {
    public name: string;
    public id: number;
    constructor(args: IUser_Loose) {
        super();
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
    public write(output: thrift.TProtocol): void {
        return UserCodec.encode(this, output);
    }
}
export namespace MyService {
    export interface IGetUserArgs {
        id: number;
    }
    export interface IGetUserArgs_Loose {
        id: number;
    }
    export const GetUserArgsCodec: thrift.IStructCodec<IGetUserArgs_Loose, IGetUserArgs> = {
        encode(args: IGetUserArgs_Loose, output: thrift.TProtocol): void {
            const obj = {
                id: args.id
            };
            output.writeStructBegin("GetUserArgs");
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
        decode(input: thrift.TProtocol): IGetUserArgs {
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
                    id: _args.id
                };
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read GetUserArgs from input");
            }
        }
    };
    export class GetUserArgs extends thrift.StructLike  implements IGetUserArgs {
        public id: number;
        constructor(args: IGetUserArgs_Loose) {
            super();
            if (args.id != null) {
                const value_6: number = args.id;
                this.id = value_6;
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[id] is unset!");
            }
        }
        public static read(input: thrift.TProtocol): GetUserArgs {
            return new GetUserArgs(GetUserArgsCodec.decode(input));
        }
        public write(output: thrift.TProtocol): void {
            return GetUserArgsCodec.encode(this, output);
        }
    }
    export interface ISaveUserArgs {
        user: IUser;
    }
    export interface ISaveUserArgs_Loose {
        user: IUser_Loose;
    }
    export const SaveUserArgsCodec: thrift.IStructCodec<ISaveUserArgs_Loose, ISaveUserArgs> = {
        encode(args: ISaveUserArgs_Loose, output: thrift.TProtocol): void {
            const obj = {
                user: args.user
            };
            output.writeStructBegin("SaveUserArgs");
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
        decode(input: thrift.TProtocol): ISaveUserArgs {
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
                    user: _args.user
                };
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read SaveUserArgs from input");
            }
        }
    };
    export class SaveUserArgs extends thrift.StructLike  implements ISaveUserArgs {
        public user: IUser;
        constructor(args: ISaveUserArgs_Loose) {
            super();
            if (args.user != null) {
                const value_8: IUser = new User(args.user);
                this.user = value_8;
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[user] is unset!");
            }
        }
        public static read(input: thrift.TProtocol): SaveUserArgs {
            return new SaveUserArgs(SaveUserArgsCodec.decode(input));
        }
        public write(output: thrift.TProtocol): void {
            return SaveUserArgsCodec.encode(this, output);
        }
    }
    export interface IPingArgs {
    }
    export interface IPingArgs_Loose {
    }
    export const PingArgsCodec: thrift.IStructCodec<IPingArgs_Loose, IPingArgs> = {
        encode(args: IPingArgs_Loose, output: thrift.TProtocol): void {
            output.writeStructBegin("PingArgs");
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        },
        decode(input: thrift.TProtocol): IPingArgs {
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
            return {};
        }
    };
    export class PingArgs extends thrift.StructLike  implements IPingArgs {
        constructor(args: IPingArgs_Loose = {}) {
            super();
        }
        public static read(input: thrift.TProtocol): PingArgs {
            return new PingArgs(PingArgsCodec.decode(input));
        }
        public write(output: thrift.TProtocol): void {
            return PingArgsCodec.encode(this, output);
        }
    }
    export interface IGetUserResult {
        success?: IUser;
    }
    export interface IGetUserResult_Loose {
        success?: IUser_Loose;
    }
    export const GetUserResultCodec: thrift.IStructCodec<IGetUserResult_Loose, IGetUserResult> = {
        encode(args: IGetUserResult_Loose, output: thrift.TProtocol): void {
            const obj = {
                success: args.success
            };
            output.writeStructBegin("GetUserResult");
            if (obj.success != null) {
                output.writeFieldBegin("success", thrift.TType.STRUCT, 0);
                UserCodec.encode(obj.success, output);
                output.writeFieldEnd();
            }
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        },
        decode(input: thrift.TProtocol): IGetUserResult {
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
                success: _args.success
            };
        }
    };
    export class GetUserResult extends thrift.StructLike  implements IGetUserResult {
        public success?: IUser;
        constructor(args: IGetUserResult_Loose = {}) {
            super();
            if (args.success != null) {
                const value_10: IUser = new User(args.success);
                this.success = value_10;
            }
        }
        public static read(input: thrift.TProtocol): GetUserResult {
            return new GetUserResult(GetUserResultCodec.decode(input));
        }
        public write(output: thrift.TProtocol): void {
            return GetUserResultCodec.encode(this, output);
        }
    }
    export interface ISaveUserResult {
        success?: void;
    }
    export interface ISaveUserResult_Loose {
        success?: void;
    }
    export const SaveUserResultCodec: thrift.IStructCodec<ISaveUserResult_Loose, ISaveUserResult> = {
        encode(args: ISaveUserResult_Loose, output: thrift.TProtocol): void {
            output.writeStructBegin("SaveUserResult");
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        },
        decode(input: thrift.TProtocol): ISaveUserResult {
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
                success: _args.success
            };
        }
    };
    export class SaveUserResult extends thrift.StructLike  implements ISaveUserResult {
        public success?: void;
        constructor(args: ISaveUserResult_Loose = {}) {
            super();
            if (args.success != null) {
                const value_11: void = undefined;
                this.success = value_11;
            }
        }
        public static read(input: thrift.TProtocol): SaveUserResult {
            return new SaveUserResult(SaveUserResultCodec.decode(input));
        }
        public write(output: thrift.TProtocol): void {
            return SaveUserResultCodec.encode(this, output);
        }
    }
    export interface IPingResult {
        success?: void;
    }
    export interface IPingResult_Loose {
        success?: void;
    }
    export const PingResultCodec: thrift.IStructCodec<IPingResult_Loose, IPingResult> = {
        encode(args: IPingResult_Loose, output: thrift.TProtocol): void {
            output.writeStructBegin("PingResult");
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        },
        decode(input: thrift.TProtocol): IPingResult {
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
                success: _args.success
            };
        }
    };
    export class PingResult extends thrift.StructLike  implements IPingResult {
        public success?: void;
        constructor(args: IPingResult_Loose = {}) {
            super();
            if (args.success != null) {
                const value_12: void = undefined;
                this.success = value_12;
            }
        }
        public static read(input: thrift.TProtocol): PingResult {
            return new PingResult(PingResultCodec.decode(input));
        }
        public write(output: thrift.TProtocol): void {
            return PingResultCodec.encode(this, output);
        }
    }
    export class Client<Context = any> {
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
            const args: IGetUserArgs_Loose = { id };
            GetUserArgsCodec.encode(args, output);
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
                        const result: IGetUserResult = GetUserResultCodec.decode(input);
                        input.readMessageEnd();
                        if (result.success != null) {
                            return Promise.resolve(result.success);
                        }
                        else {
                            return Promise.reject(new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, "getUser failed: unknown result"));
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
        public saveUser(user: IUser_Loose, context?: Context): Promise<void> {
            const writer: thrift.TTransport = new this.transport();
            const output: thrift.TProtocol = new this.protocol(writer);
            output.writeMessageBegin("saveUser", thrift.MessageType.CALL, this.incrementRequestId());
            const args: ISaveUserArgs_Loose = { user };
            SaveUserArgsCodec.encode(args, output);
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
                        const result: ISaveUserResult = SaveUserResultCodec.decode(input);
                        input.readMessageEnd();
                        return Promise.resolve(result.success);
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
            const args: IPingArgs_Loose = {};
            PingArgsCodec.encode(args, output);
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
                        const result: IPingResult = PingResultCodec.decode(input);
                        input.readMessageEnd();
                        return Promise.resolve(result.success);
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
    export interface IHandler<Context = any> {
        getUser(id: number, context?: Context): IUser | Promise<IUser>;
        saveUser(user: IUser, context?: Context): void | Promise<void>;
        ping(context?: Context): void | Promise<void>;
    }
    export class Processor<Context = any> {
        public _handler: IHandler<Context>;
        constructor(handler: IHandler<Context>) {
            this._handler = handler;
        }
        public process(input: thrift.TProtocol, output: thrift.TProtocol, context: Context): Promise<Buffer> {
            return new Promise<Buffer>((resolve, reject): void => {
                const metadata: thrift.IThriftMessage = input.readMessageBegin();
                const fieldName: string = metadata.fieldName;
                const requestId: number = metadata.requestId;
                const methodName: string = "process_" + fieldName;
                switch (methodName) {
                    case "process_getUser": {
                        resolve(this.process_getUser(requestId, input, output, context));
                    }
                    case "process_saveUser": {
                        resolve(this.process_saveUser(requestId, input, output, context));
                    }
                    case "process_ping": {
                        resolve(this.process_ping(requestId, input, output, context));
                    }
                    default: {
                        input.skip(thrift.TType.STRUCT);
                        input.readMessageEnd();
                        const errMessage = "Unknown function " + fieldName;
                        const err = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN_METHOD, errMessage);
                        output.writeMessageBegin(fieldName, thrift.MessageType.EXCEPTION, requestId);
                        thrift.TApplicationExceptionCodec.encode(err, output);
                        output.writeMessageEnd();
                        resolve(output.flush());
                    }
                }
            });
        }
        public process_getUser(requestId: number, input: thrift.TProtocol, output: thrift.TProtocol, context: Context): Promise<Buffer> {
            return new Promise<IUser>((resolve, reject): void => {
                try {
                    const args: IGetUserArgs = GetUserArgsCodec.decode(input);
                    input.readMessageEnd();
                    resolve(this._handler.getUser(args.id, context));
                }
                catch (err) {
                    reject(err);
                }
            }).then((data: IUser): Buffer => {
                const result: IGetUserResult = { success: data };
                output.writeMessageBegin("getUser", thrift.MessageType.REPLY, requestId);
                GetUserResultCodec.encode(result, output);
                output.writeMessageEnd();
                return output.flush();
            }).catch((err: Error): Buffer => {
                const result: thrift.TApplicationException = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, err.message);
                output.writeMessageBegin("getUser", thrift.MessageType.EXCEPTION, requestId);
                thrift.TApplicationExceptionCodec.encode(result, output);
                output.writeMessageEnd();
                return output.flush();
            });
        }
        public process_saveUser(requestId: number, input: thrift.TProtocol, output: thrift.TProtocol, context: Context): Promise<Buffer> {
            return new Promise<void>((resolve, reject): void => {
                try {
                    const args: ISaveUserArgs = SaveUserArgsCodec.decode(input);
                    input.readMessageEnd();
                    resolve(this._handler.saveUser(args.user, context));
                }
                catch (err) {
                    reject(err);
                }
            }).then((data: void): Buffer => {
                const result: ISaveUserResult = { success: data };
                output.writeMessageBegin("saveUser", thrift.MessageType.REPLY, requestId);
                SaveUserResultCodec.encode(result, output);
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
        public process_ping(requestId: number, input: thrift.TProtocol, output: thrift.TProtocol, context: Context): Promise<Buffer> {
            return new Promise<void>((resolve, reject): void => {
                try {
                    input.readMessageEnd();
                    resolve(this._handler.ping(context));
                }
                catch (err) {
                    reject(err);
                }
            }).then((data: void): Buffer => {
                const result: IPingResult = { success: data };
                output.writeMessageBegin("ping", thrift.MessageType.REPLY, requestId);
                PingResultCodec.encode(result, output);
                output.writeMessageEnd();
                return output.flush();
            }).catch((err: Error): Buffer => {
                const result: thrift.TApplicationException = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, err.message);
                output.writeMessageBegin("ping", thrift.MessageType.EXCEPTION, requestId);
                thrift.TApplicationExceptionCodec.encode(result, output);
                output.writeMessageEnd();
                return output.flush();
            });
        }
    }
}
