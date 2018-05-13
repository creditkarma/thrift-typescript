export namespace MyService {
    export interface ISendArgsArgs {
        code: number | thrift.Int64;
    }
    export class SendArgs implements thrift.StructLike {
        public code: thrift.Int64;
        constructor(args: ISendArgsArgs) {
            if (args != null && args.code != null) {
                if (typeof args.code === "number") {
                    this.code = new thrift.Int64(args.code);
                }
                else {
                    this.code = args.code;
                }
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field code is unset!");
            }
        }
        public write(output: thrift.TProtocol): void {
            output.writeStructBegin("SendArgs");
            if (this.code != null) {
                output.writeFieldBegin("code", thrift.TType.I64, 1);
                output.writeI64(this.code);
                output.writeFieldEnd();
            }
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        }
        public static read(input: thrift.TProtocol): SendArgs {
            input.readStructBegin();
            let _args: any = {};
            while (true) {
                const ret: thrift.IThriftField = input.readFieldBegin();
                const fieldType: thrift.TType = ret.fieldType;
                const fieldId: number = ret.fieldId;
                if (fieldType === thrift.TType.STOP) {
                    break;
                }
                switch (fieldId) {
                    case 1:
                        if (fieldType === thrift.TType.I64) {
                            const value_1: thrift.Int64 = input.readI64();
                            _args.code = value_1;
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
            if (_args.code !== undefined) {
                return new SendArgs(_args);
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read SendArgs from input");
            }
        }
    }
    export interface IPingArgsArgs {
    }
    export class PingArgs implements thrift.StructLike {
        constructor(args?: IPingArgsArgs) {
        }
        public write(output: thrift.TProtocol): void {
            output.writeStructBegin("PingArgs");
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        }
        public static read(input: thrift.TProtocol): PingArgs {
            input.readStructBegin();
            let _args: any = {};
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
            return new PingArgs(_args);
        }
    }
    export interface IStatusArgsArgs {
        code: string;
    }
    export class StatusArgs implements thrift.StructLike {
        public code: string;
        constructor(args: IStatusArgsArgs) {
            if (args != null && args.code != null) {
                this.code = args.code;
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field code is unset!");
            }
        }
        public write(output: thrift.TProtocol): void {
            output.writeStructBegin("StatusArgs");
            if (this.code != null) {
                output.writeFieldBegin("code", thrift.TType.STRING, 1);
                output.writeString(this.code);
                output.writeFieldEnd();
            }
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        }
        public static read(input: thrift.TProtocol): StatusArgs {
            input.readStructBegin();
            let _args: any = {};
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
                            const value_2: string = input.readString();
                            _args.code = value_2;
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
            if (_args.code !== undefined) {
                return new StatusArgs(_args);
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read StatusArgs from input");
            }
        }
    }
    export interface ISendResultArgs {
        success?: number | thrift.Int64;
    }
    export class SendResult implements thrift.StructLike {
        public success?: thrift.Int64;
        constructor(args?: ISendResultArgs) {
            if (args != null && args.success != null) {
                if (typeof args.success === "number") {
                    this.success = new thrift.Int64(args.success);
                }
                else {
                    this.success = args.success;
                }
            }
        }
        public write(output: thrift.TProtocol): void {
            output.writeStructBegin("SendResult");
            if (this.success != null) {
                output.writeFieldBegin("success", thrift.TType.I64, 0);
                output.writeI64(this.success);
                output.writeFieldEnd();
            }
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        }
        public static read(input: thrift.TProtocol): SendResult {
            input.readStructBegin();
            let _args: any = {};
            while (true) {
                const ret: thrift.IThriftField = input.readFieldBegin();
                const fieldType: thrift.TType = ret.fieldType;
                const fieldId: number = ret.fieldId;
                if (fieldType === thrift.TType.STOP) {
                    break;
                }
                switch (fieldId) {
                    case 0:
                        if (fieldType === thrift.TType.I64) {
                            const value_3: thrift.Int64 = input.readI64();
                            _args.success = value_3;
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
            return new SendResult(_args);
        }
    }
    export interface IPingResultArgs {
        success?: void;
    }
    export class PingResult implements thrift.StructLike {
        public success?: void;
        constructor(args?: IPingResultArgs) {
            if (args != null && args.success != null) {
                this.success = args.success;
            }
        }
        public write(output: thrift.TProtocol): void {
            output.writeStructBegin("PingResult");
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        }
        public static read(input: thrift.TProtocol): PingResult {
            input.readStructBegin();
            let _args: any = {};
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
            return new PingResult(_args);
        }
    }
    export interface IStatusResultArgs {
        success?: void;
    }
    export class StatusResult implements thrift.StructLike {
        public success?: void;
        constructor(args?: IStatusResultArgs) {
            if (args != null && args.success != null) {
                this.success = args.success;
            }
        }
        public write(output: thrift.TProtocol): void {
            output.writeStructBegin("StatusResult");
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        }
        public static read(input: thrift.TProtocol): StatusResult {
            input.readStructBegin();
            let _args: any = {};
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
            return new StatusResult(_args);
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
        public incrementRequestId(): number {
            return this._requestId += 1;
        }
        public send(code: thrift.Int64, context?: Context): Promise<thrift.Int64> {
            const writer: thrift.TTransport = new this.transport();
            const output: thrift.TProtocol = new this.protocol(writer);
            output.writeMessageBegin("send", thrift.MessageType.CALL, this.incrementRequestId());
            const args: SendArgs = new SendArgs({ code });
            args.write(output);
            output.writeMessageEnd();
            return this.connection.send(writer.flush(), context).then((data: Buffer) => {
                const reader: thrift.TTransport = this.transport.receiver(data);
                const input: thrift.TProtocol = new this.protocol(reader);
                try {
                    const { fieldName: fieldName, messageType: messageType }: thrift.IThriftMessage = input.readMessageBegin();
                    if (fieldName === "send") {
                        if (messageType === thrift.MessageType.EXCEPTION) {
                            const err: thrift.TApplicationException = thrift.TApplicationException.read(input);
                            input.readMessageEnd();
                            return Promise.reject(err);
                        }
                        const result: SendResult = SendResult.read(input);
                        input.readMessageEnd();
                        if (result.success != null) {
                            return Promise.resolve(result.success);
                        }
                        else {
                            return Promise.reject(new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, "send failed: unknown result"));
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
            const args: PingArgs = new PingArgs({});
            args.write(output);
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
                        const result: PingResult = PingResult.read(input);
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
        public status(code: string, context?: Context): Promise<void> {
            const writer: thrift.TTransport = new this.transport();
            const output: thrift.TProtocol = new this.protocol(writer);
            output.writeMessageBegin("status", thrift.MessageType.CALL, this.incrementRequestId());
            const args: StatusArgs = new StatusArgs({ code });
            args.write(output);
            output.writeMessageEnd();
            return this.connection.send(writer.flush(), context).then((data: Buffer) => {
                const reader: thrift.TTransport = this.transport.receiver(data);
                const input: thrift.TProtocol = new this.protocol(reader);
                try {
                    const { fieldName: fieldName, messageType: messageType }: thrift.IThriftMessage = input.readMessageBegin();
                    if (fieldName === "status") {
                        if (messageType === thrift.MessageType.EXCEPTION) {
                            const err: thrift.TApplicationException = thrift.TApplicationException.read(input);
                            input.readMessageEnd();
                            return Promise.reject(err);
                        }
                        const result: StatusResult = StatusResult.read(input);
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
        send(code: thrift.Int64, context?: Context): thrift.Int64 | Promise<thrift.Int64>;
        ping(context?: Context): void | Promise<void>;
        status(code: string, context?: Context): void | Promise<void>;
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
                    case "process_send": {
                        resolve(this.process_send(requestId, input, output, context));
                    }
                    case "process_ping": {
                        resolve(this.process_ping(requestId, input, output, context));
                    }
                    case "process_status": {
                        resolve(this.process_status(requestId, input, output, context));
                    }
                    default: {
                        input.skip(thrift.TType.STRUCT);
                        input.readMessageEnd();
                        const errMessage = "Unknown function " + fieldName;
                        const err = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN_METHOD, errMessage);
                        output.writeMessageBegin(fieldName, thrift.MessageType.EXCEPTION, requestId);
                        err.write(output);
                        output.writeMessageEnd();
                        resolve(output.flush());
                    }
                }
            });
        }
        public process_send(requestId: number, input: thrift.TProtocol, output: thrift.TProtocol, context: Context): Promise<Buffer> {
            return new Promise<thrift.Int64>((resolve, reject): void => {
                try {
                    const args: SendArgs = SendArgs.read(input);
                    input.readMessageEnd();
                    resolve(this._handler.send(args.code, context));
                }
                catch (err) {
                    reject(err);
                }
            }).then((data: thrift.Int64): Buffer => {
                const result: SendResult = new SendResult({ success: data });
                output.writeMessageBegin("send", thrift.MessageType.REPLY, requestId);
                result.write(output);
                output.writeMessageEnd();
                return output.flush();
            }).catch((err: Error): Buffer => {
                const result: thrift.TApplicationException = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, err.message);
                output.writeMessageBegin("send", thrift.MessageType.EXCEPTION, requestId);
                result.write(output);
                output.writeMessageEnd();
                return output.flush();
            });
        }
        public process_ping(requestId: number, input: thrift.TProtocol, output: thrift.TProtocol, context: Context): Promise<Buffer> {
            return new Promise<void>((resolve, reject): void => {
                try {
                    PingArgs.read(input);
                    input.readMessageEnd();
                    resolve(this._handler.ping(context));
                }
                catch (err) {
                    reject(err);
                }
            }).then((data: void): Buffer => {
                const result: PingResult = new PingResult({ success: data });
                output.writeMessageBegin("ping", thrift.MessageType.REPLY, requestId);
                result.write(output);
                output.writeMessageEnd();
                return output.flush();
            }).catch((err: Error): Buffer => {
                const result: thrift.TApplicationException = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, err.message);
                output.writeMessageBegin("ping", thrift.MessageType.EXCEPTION, requestId);
                result.write(output);
                output.writeMessageEnd();
                return output.flush();
            });
        }
        public process_status(requestId: number, input: thrift.TProtocol, output: thrift.TProtocol, context: Context): Promise<Buffer> {
            return new Promise<void>((resolve, reject): void => {
                try {
                    const args: StatusArgs = StatusArgs.read(input);
                    input.readMessageEnd();
                    resolve(this._handler.status(args.code, context));
                }
                catch (err) {
                    reject(err);
                }
            }).then((data: void): Buffer => {
                const result: StatusResult = new StatusResult({ success: data });
                output.writeMessageBegin("status", thrift.MessageType.REPLY, requestId);
                result.write(output);
                output.writeMessageEnd();
                return output.flush();
            }).catch((err: Error): Buffer => {
                const result: thrift.TApplicationException = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, err.message);
                output.writeMessageBegin("status", thrift.MessageType.EXCEPTION, requestId);
                result.write(output);
                output.writeMessageEnd();
                return output.flush();
            });
        }
    }
}
