export interface IUser {
    name: string;
    id: number;
}
export interface IUser_Loose {
    name: string;
    id: number;
}
export class User extends thrift.IStructLike  implements IUser_Loose {
    public name: string;
    public id: number;
    constructor(args: IUser_Loose) {
        super();
        if (args.name != null) {
            this.name = args.name;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[name] is unset!");
        }
        if (args.id != null) {
            this.id = args.id;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[id] is unset!");
        }
    }
    public static write(args: IUser_Loose, output: thrift.TProtocol): void {
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
}
export namespace MyService {
    export interface IGetUserArgs {
        id: number;
    }
    export interface IGetUserArgs_Loose {
        id: number;
    }
    export class GetUserArgs extends thrift.IStructLike  implements IGetUserArgs_Loose {
        public id: number;
        constructor(args: IGetUserArgs_Loose) {
            super();
            if (args.id != null) {
                this.id = args.id;
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[id] is unset!");
            }
        }
        public static write(args: IGetUserArgs_Loose, output: thrift.TProtocol): void {
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
        }
        public static read(input: thrift.TProtocol): IGetUserArgs {
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
                            const value_3: number = input.readI32();
                            _args.id = value_3;
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
    }
    export interface ISaveUserArgs {
        user: IUser;
    }
    export interface ISaveUserArgs_Loose {
        user: IUser_Loose;
    }
    export class SaveUserArgs extends thrift.IStructLike  implements ISaveUserArgs_Loose {
        public user: IUser_Loose;
        constructor(args: ISaveUserArgs_Loose) {
            super();
            if (args.user != null) {
                this.user = args.user;
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[user] is unset!");
            }
        }
        public static write(args: ISaveUserArgs_Loose, output: thrift.TProtocol): void {
            const obj = {
                user: args.user
            };
            output.writeStructBegin("SaveUserArgs");
            if (obj.user != null) {
                output.writeFieldBegin("user", thrift.TType.STRUCT, 1);
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
        public static read(input: thrift.TProtocol): ISaveUserArgs {
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
            if (_args.user !== undefined) {
                return {
                    user: _args.user
                };
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read SaveUserArgs from input");
            }
        }
    }
    export interface IPingArgs {
    }
    export interface IPingArgs_Loose {
    }
    export class PingArgs extends thrift.IStructLike  implements IPingArgs_Loose {
        constructor(args: IPingArgs_Loose = {}) {
            super();
        }
        public static write(args: IPingArgs_Loose, output: thrift.TProtocol): void {
            output.writeStructBegin("PingArgs");
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        }
        public static read(input: thrift.TProtocol): IPingArgs {
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
    }
    export interface IGetUserResult {
        success?: IUser;
    }
    export interface IGetUserResult_Loose {
        success?: IUser_Loose;
    }
    export class GetUserResult extends thrift.IStructLike  implements IGetUserResult_Loose {
        public success?: IUser_Loose;
        constructor(args: IGetUserResult_Loose = {}) {
            super();
            if (args.success != null) {
                this.success = args.success;
            }
        }
        public static write(args: IGetUserResult_Loose, output: thrift.TProtocol): void {
            const obj = {
                success: args.success
            };
            output.writeStructBegin("GetUserResult");
            if (obj.success != null) {
                output.writeFieldBegin("success", thrift.TType.STRUCT, 0);
                User.write(obj.success, output);
                output.writeFieldEnd();
            }
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        }
        public static read(input: thrift.TProtocol): IGetUserResult {
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
                            const value_5: IUser = User.read(input);
                            _args.success = value_5;
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
    }
    export interface ISaveUserResult {
        success?: void;
    }
    export interface ISaveUserResult_Loose {
        success?: void;
    }
    export class SaveUserResult extends thrift.IStructLike  implements ISaveUserResult_Loose {
        public success?: void;
        constructor(args: ISaveUserResult_Loose = {}) {
            super();
            if (args.success != null) {
                this.success = args.success;
            }
        }
        public static write(args: ISaveUserResult_Loose, output: thrift.TProtocol): void {
            output.writeStructBegin("SaveUserResult");
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        }
        public static read(input: thrift.TProtocol): ISaveUserResult {
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
    }
    export interface IPingResult {
        success?: void;
    }
    export interface IPingResult_Loose {
        success?: void;
    }
    export class PingResult extends thrift.IStructLike  implements IPingResult_Loose {
        public success?: void;
        constructor(args: IPingResult_Loose = {}) {
            super();
            if (args.success != null) {
                this.success = args.success;
            }
        }
        public static write(args: IPingResult_Loose, output: thrift.TProtocol): void {
            output.writeStructBegin("PingResult");
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        }
        public static read(input: thrift.TProtocol): IPingResult {
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
            GetUserArgs.write(args, output);
            output.writeMessageEnd();
            return this.connection.send(writer.flush(), context).then((data: Buffer) => {
                const reader: thrift.TTransport = this.transport.receiver(data);
                const input: thrift.TProtocol = new this.protocol(reader);
                try {
                    const { fieldName: fieldName, messageType: messageType }: thrift.IThriftMessage = input.readMessageBegin();
                    if (fieldName === "getUser") {
                        if (messageType === thrift.MessageType.EXCEPTION) {
                            const err: thrift.TApplicationException = thrift.TApplicationException.read(input);
                            input.readMessageEnd();
                            return Promise.reject(err);
                        }
                        const result: IGetUserResult = GetUserResult.read(input);
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
            SaveUserArgs.write(args, output);
            output.writeMessageEnd();
            return this.connection.send(writer.flush(), context).then((data: Buffer) => {
                const reader: thrift.TTransport = this.transport.receiver(data);
                const input: thrift.TProtocol = new this.protocol(reader);
                try {
                    const { fieldName: fieldName, messageType: messageType }: thrift.IThriftMessage = input.readMessageBegin();
                    if (fieldName === "saveUser") {
                        if (messageType === thrift.MessageType.EXCEPTION) {
                            const err: thrift.TApplicationException = thrift.TApplicationException.read(input);
                            input.readMessageEnd();
                            return Promise.reject(err);
                        }
                        const result: ISaveUserResult = SaveUserResult.read(input);
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
            PingArgs.write(args, output);
            output.writeMessageEnd();
            return this.connection.send(writer.flush(), context).then((data: Buffer) => {
                const reader: thrift.TTransport = this.transport.receiver(data);
                const input: thrift.TProtocol = new this.protocol(reader);
                try {
                    const { fieldName: fieldName, messageType: messageType }: thrift.IThriftMessage = input.readMessageBegin();
                    if (fieldName === "ping") {
                        if (messageType === thrift.MessageType.EXCEPTION) {
                            const err: thrift.TApplicationException = thrift.TApplicationException.read(input);
                            input.readMessageEnd();
                            return Promise.reject(err);
                        }
                        const result: IPingResult = PingResult.read(input);
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
    export interface Handler<Context = any> {
        getUser(id: number, context?: Context): IUser | Promise<IUser>;
        saveUser(user: IUser, context?: Context): void | Promise<void>;
        ping(context?: Context): void | Promise<void>;
    }
    export class Processor<Context = any> {
        public _handler: Handler<Context>;
        constructor(handler: Handler<Context>) {
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
                        thrift.TApplicationException.write(err, output);
                        output.writeMessageEnd();
                        resolve(output.flush());
                    }
                }
            });
        }
        public process_getUser(requestId: number, input: thrift.TProtocol, output: thrift.TProtocol, context: Context): Promise<Buffer> {
            return new Promise<IUser>((resolve, reject): void => {
                try {
                    const args: IGetUserArgs = GetUserArgs.read(input);
                    input.readMessageEnd();
                    resolve(this._handler.getUser(args.id, context));
                }
                catch (err) {
                    reject(err);
                }
            }).then((data: IUser): Buffer => {
                const result: IGetUserResult = { success: data };
                output.writeMessageBegin("getUser", thrift.MessageType.REPLY, requestId);
                GetUserResult.write(result, output);
                output.writeMessageEnd();
                return output.flush();
            }).catch((err: Error): Buffer => {
                const result: thrift.TApplicationException = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, err.message);
                output.writeMessageBegin("getUser", thrift.MessageType.EXCEPTION, requestId);
                thrift.TApplicationException.write(result, output);
                output.writeMessageEnd();
                return output.flush();
            });
        }
        public process_saveUser(requestId: number, input: thrift.TProtocol, output: thrift.TProtocol, context: Context): Promise<Buffer> {
            return new Promise<void>((resolve, reject): void => {
                try {
                    const args: ISaveUserArgs = SaveUserArgs.read(input);
                    input.readMessageEnd();
                    resolve(this._handler.saveUser(args.user, context));
                }
                catch (err) {
                    reject(err);
                }
            }).then((data: void): Buffer => {
                const result: ISaveUserResult = { success: data };
                output.writeMessageBegin("saveUser", thrift.MessageType.REPLY, requestId);
                SaveUserResult.write(result, output);
                output.writeMessageEnd();
                return output.flush();
            }).catch((err: Error): Buffer => {
                const result: thrift.TApplicationException = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, err.message);
                output.writeMessageBegin("saveUser", thrift.MessageType.EXCEPTION, requestId);
                thrift.TApplicationException.write(result, output);
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
                PingResult.write(result, output);
                output.writeMessageEnd();
                return output.flush();
            }).catch((err: Error): Buffer => {
                const result: thrift.TApplicationException = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, err.message);
                output.writeMessageBegin("ping", thrift.MessageType.EXCEPTION, requestId);
                thrift.TApplicationException.write(result, output);
                output.writeMessageEnd();
                return output.flush();
            });
        }
    }
}
