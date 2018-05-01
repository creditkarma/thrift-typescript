export namespace ParentService {
    export interface IPingArgs {
        status: number;
    }
    export interface IPingArgs_Loose {
        status: number;
    }
    export class PingArgs extends thrift.IStructLike  implements IPingArgs_Loose {
        public status: number;
        constructor(args: IPingArgs_Loose) {
            super();
            if (args.status != null) {
                this.status = args.status;
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[status] is unset!");
            }
        }
        public static write(args: IPingArgs_Loose, output: thrift.TProtocol): void {
            const obj = {
                status: args.status
            };
            output.writeStructBegin("PingArgs");
            if (obj.status != null) {
                output.writeFieldBegin("status", thrift.TType.I32, 1);
                output.writeI32(obj.status);
                output.writeFieldEnd();
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[status] is unset!");
            }
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        }
        public static read(input: thrift.TProtocol): IPingArgs {
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
                            const value_1: number = input.readI32();
                            _args.status = value_1;
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
            if (_args.status !== undefined) {
                return {
                    status: _args.status
                };
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read PingArgs from input");
            }
        }
    }
    export interface IPingResult {
        success?: string;
    }
    export interface IPingResult_Loose {
        success?: string;
    }
    export class PingResult extends thrift.IStructLike  implements IPingResult_Loose {
        public success?: string;
        constructor(args: IPingResult_Loose = {}) {
            super();
            if (args.success != null) {
                this.success = args.success;
            }
        }
        public static write(args: IPingResult_Loose, output: thrift.TProtocol): void {
            const obj = {
                success: args.success
            };
            output.writeStructBegin("PingResult");
            if (obj.success != null) {
                output.writeFieldBegin("success", thrift.TType.STRING, 0);
                output.writeString(obj.success);
                output.writeFieldEnd();
            }
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
                        if (fieldType === thrift.TType.STRING) {
                            const value_2: string = input.readString();
                            _args.success = value_2;
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
        public ping(status: number, context?: Context): Promise<string> {
            const writer: thrift.TTransport = new this.transport();
            const output: thrift.TProtocol = new this.protocol(writer);
            output.writeMessageBegin("ping", thrift.MessageType.CALL, this.incrementRequestId());
            const args: IPingArgs_Loose = { status };
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
                        if (result.success != null) {
                            return Promise.resolve(result.success);
                        }
                        else {
                            return Promise.reject(new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, "ping failed: unknown result"));
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
    export interface Handler<Context = any> {
        ping(status: number, context?: Context): string | Promise<string>;
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
        public process_ping(requestId: number, input: thrift.TProtocol, output: thrift.TProtocol, context: Context): Promise<Buffer> {
            return new Promise<string>((resolve, reject): void => {
                try {
                    const args: IPingArgs = PingArgs.read(input);
                    input.readMessageEnd();
                    resolve(this._handler.ping(args.status, context));
                }
                catch (err) {
                    reject(err);
                }
            }).then((data: string): Buffer => {
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
export namespace ChildService {
    export interface IPegArgs {
        name: string;
    }
    export interface IPegArgs_Loose {
        name: string;
    }
    export class PegArgs extends thrift.IStructLike  implements IPegArgs_Loose {
        public name: string;
        constructor(args: IPegArgs_Loose) {
            super();
            if (args.name != null) {
                this.name = args.name;
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[name] is unset!");
            }
        }
        public static write(args: IPegArgs_Loose, output: thrift.TProtocol): void {
            const obj = {
                name: args.name
            };
            output.writeStructBegin("PegArgs");
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
        }
        public static read(input: thrift.TProtocol): IPegArgs {
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
                    default: {
                        input.skip(fieldType);
                    }
                }
                input.readFieldEnd();
            }
            input.readStructEnd();
            if (_args.name !== undefined) {
                return {
                    name: _args.name
                };
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read PegArgs from input");
            }
        }
    }
    export interface IPongArgs {
        name?: string;
    }
    export interface IPongArgs_Loose {
        name?: string;
    }
    export class PongArgs extends thrift.IStructLike  implements IPongArgs_Loose {
        public name?: string;
        constructor(args: IPongArgs_Loose = {}) {
            super();
            if (args.name != null) {
                this.name = args.name;
            }
        }
        public static write(args: IPongArgs_Loose, output: thrift.TProtocol): void {
            const obj = {
                name: args.name
            };
            output.writeStructBegin("PongArgs");
            if (obj.name != null) {
                output.writeFieldBegin("name", thrift.TType.STRING, 1);
                output.writeString(obj.name);
                output.writeFieldEnd();
            }
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        }
        public static read(input: thrift.TProtocol): IPongArgs {
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
                            const value_4: string = input.readString();
                            _args.name = value_4;
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
                name: _args.name
            };
        }
    }
    export interface IPegResult {
        success?: string;
    }
    export interface IPegResult_Loose {
        success?: string;
    }
    export class PegResult extends thrift.IStructLike  implements IPegResult_Loose {
        public success?: string;
        constructor(args: IPegResult_Loose = {}) {
            super();
            if (args.success != null) {
                this.success = args.success;
            }
        }
        public static write(args: IPegResult_Loose, output: thrift.TProtocol): void {
            const obj = {
                success: args.success
            };
            output.writeStructBegin("PegResult");
            if (obj.success != null) {
                output.writeFieldBegin("success", thrift.TType.STRING, 0);
                output.writeString(obj.success);
                output.writeFieldEnd();
            }
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        }
        public static read(input: thrift.TProtocol): IPegResult {
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
                        if (fieldType === thrift.TType.STRING) {
                            const value_5: string = input.readString();
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
    export interface IPongResult {
        success?: string;
    }
    export interface IPongResult_Loose {
        success?: string;
    }
    export class PongResult extends thrift.IStructLike  implements IPongResult_Loose {
        public success?: string;
        constructor(args: IPongResult_Loose = {}) {
            super();
            if (args.success != null) {
                this.success = args.success;
            }
        }
        public static write(args: IPongResult_Loose, output: thrift.TProtocol): void {
            const obj = {
                success: args.success
            };
            output.writeStructBegin("PongResult");
            if (obj.success != null) {
                output.writeFieldBegin("success", thrift.TType.STRING, 0);
                output.writeString(obj.success);
                output.writeFieldEnd();
            }
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        }
        public static read(input: thrift.TProtocol): IPongResult {
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
                        if (fieldType === thrift.TType.STRING) {
                            const value_6: string = input.readString();
                            _args.success = value_6;
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
    export class Client<Context = any> extends ParentService.Client<Context> {
        protected _requestId: number;
        protected transport: thrift.ITransportConstructor;
        protected protocol: thrift.IProtocolConstructor;
        protected connection: thrift.IThriftConnection<Context>;
        constructor(connection: thrift.IThriftConnection<Context>) {
            super(connection);
            this._requestId = 0;
            this.transport = connection.Transport;
            this.protocol = connection.Protocol;
            this.connection = connection;
        }
        protected incrementRequestId(): number {
            return this._requestId += 1;
        }
        public peg(name: string, context?: Context): Promise<string> {
            const writer: thrift.TTransport = new this.transport();
            const output: thrift.TProtocol = new this.protocol(writer);
            output.writeMessageBegin("peg", thrift.MessageType.CALL, this.incrementRequestId());
            const args: IPegArgs_Loose = { name };
            PegArgs.write(args, output);
            output.writeMessageEnd();
            return this.connection.send(writer.flush(), context).then((data: Buffer) => {
                const reader: thrift.TTransport = this.transport.receiver(data);
                const input: thrift.TProtocol = new this.protocol(reader);
                try {
                    const { fieldName: fieldName, messageType: messageType }: thrift.IThriftMessage = input.readMessageBegin();
                    if (fieldName === "peg") {
                        if (messageType === thrift.MessageType.EXCEPTION) {
                            const err: thrift.TApplicationException = thrift.TApplicationException.read(input);
                            input.readMessageEnd();
                            return Promise.reject(err);
                        }
                        const result: IPegResult = PegResult.read(input);
                        input.readMessageEnd();
                        if (result.success != null) {
                            return Promise.resolve(result.success);
                        }
                        else {
                            return Promise.reject(new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, "peg failed: unknown result"));
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
        public pong(name?: string, context?: Context): Promise<string> {
            const writer: thrift.TTransport = new this.transport();
            const output: thrift.TProtocol = new this.protocol(writer);
            output.writeMessageBegin("pong", thrift.MessageType.CALL, this.incrementRequestId());
            const args: IPongArgs_Loose = { name };
            PongArgs.write(args, output);
            output.writeMessageEnd();
            return this.connection.send(writer.flush(), context).then((data: Buffer) => {
                const reader: thrift.TTransport = this.transport.receiver(data);
                const input: thrift.TProtocol = new this.protocol(reader);
                try {
                    const { fieldName: fieldName, messageType: messageType }: thrift.IThriftMessage = input.readMessageBegin();
                    if (fieldName === "pong") {
                        if (messageType === thrift.MessageType.EXCEPTION) {
                            const err: thrift.TApplicationException = thrift.TApplicationException.read(input);
                            input.readMessageEnd();
                            return Promise.reject(err);
                        }
                        const result: IPongResult = PongResult.read(input);
                        input.readMessageEnd();
                        if (result.success != null) {
                            return Promise.resolve(result.success);
                        }
                        else {
                            return Promise.reject(new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, "pong failed: unknown result"));
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
    export interface LocalHandler<Context = any> {
        peg(name: string, context?: Context): string | Promise<string>;
        pong(name?: string, context?: Context): string | Promise<string>;
    }
    export type Handler<Context = any> = LocalHandler<Context> & ParentService.Handler<Context>;
    export class Processor<Context = any> extends ParentService.Processor<Context> {
        public _handler: Handler<Context>;
        constructor(handler: Handler<Context>) {
            super({
                ping: handler.ping
            });
            this._handler = handler;
        }
        public process(input: thrift.TProtocol, output: thrift.TProtocol, context: Context): Promise<Buffer> {
            return new Promise<Buffer>((resolve, reject): void => {
                const metadata: thrift.IThriftMessage = input.readMessageBegin();
                const fieldName: string = metadata.fieldName;
                const requestId: number = metadata.requestId;
                const methodName: string = "process_" + fieldName;
                switch (methodName) {
                    case "process_ping": {
                        resolve(this.process_ping(requestId, input, output, context));
                    }
                    case "process_peg": {
                        resolve(this.process_peg(requestId, input, output, context));
                    }
                    case "process_pong": {
                        resolve(this.process_pong(requestId, input, output, context));
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
        public process_peg(requestId: number, input: thrift.TProtocol, output: thrift.TProtocol, context: Context): Promise<Buffer> {
            return new Promise<string>((resolve, reject): void => {
                try {
                    const args: IPegArgs = PegArgs.read(input);
                    input.readMessageEnd();
                    resolve(this._handler.peg(args.name, context));
                }
                catch (err) {
                    reject(err);
                }
            }).then((data: string): Buffer => {
                const result: IPegResult = { success: data };
                output.writeMessageBegin("peg", thrift.MessageType.REPLY, requestId);
                PegResult.write(result, output);
                output.writeMessageEnd();
                return output.flush();
            }).catch((err: Error): Buffer => {
                const result: thrift.TApplicationException = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, err.message);
                output.writeMessageBegin("peg", thrift.MessageType.EXCEPTION, requestId);
                thrift.TApplicationException.write(result, output);
                output.writeMessageEnd();
                return output.flush();
            });
        }
        public process_pong(requestId: number, input: thrift.TProtocol, output: thrift.TProtocol, context: Context): Promise<Buffer> {
            return new Promise<string>((resolve, reject): void => {
                try {
                    const args: IPongArgs = PongArgs.read(input);
                    input.readMessageEnd();
                    resolve(this._handler.pong(args.name, context));
                }
                catch (err) {
                    reject(err);
                }
            }).then((data: string): Buffer => {
                const result: IPongResult = { success: data };
                output.writeMessageBegin("pong", thrift.MessageType.REPLY, requestId);
                PongResult.write(result, output);
                output.writeMessageEnd();
                return output.flush();
            }).catch((err: Error): Buffer => {
                const result: thrift.TApplicationException = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, err.message);
                output.writeMessageBegin("pong", thrift.MessageType.EXCEPTION, requestId);
                thrift.TApplicationException.write(result, output);
                output.writeMessageEnd();
                return output.flush();
            });
        }
    }
}
