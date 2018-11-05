export interface ICode {
    status?: thrift.Int64;
}
export interface ICodeArgs {
    status?: number | thrift.Int64;
}
export const CodeCodec: thrift.IStructCodec<ICodeArgs, ICode> = {
    encode(args: ICodeArgs, output: thrift.TProtocol): void {
        const obj = {
            status: (typeof args.status === "number" ? new thrift.Int64(args.status) : args.status)
        };
        output.writeStructBegin("Code");
        if (obj.status != null) {
            output.writeFieldBegin("status", thrift.TType.I64, 1);
            output.writeI64(obj.status);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): ICode {
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
                    if (fieldType === thrift.TType.I64) {
                        const value_1: thrift.Int64 = input.readI64();
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
        return {
            status: _args.status
        };
    }
};
export class Code extends thrift.StructLike implements ICode {
    public status?: thrift.Int64;
    constructor(args: ICodeArgs = {}) {
        super();
        if (args.status != null) {
            const value_2: thrift.Int64 = (typeof args.status === "number" ? new thrift.Int64(args.status) : args.status);
            this.status = value_2;
        }
    }
    public static read(input: thrift.TProtocol): Code {
        return new Code(CodeCodec.decode(input));
    }
    public static write(args: ICodeArgs, output: thrift.TProtocol): void {
        return CodeCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return CodeCodec.encode(this, output);
    }
}
export namespace MyService {
    export const serviceName: string = "MyService";
    export interface IPegArgs {
        name: string;
    }
    export interface IPegArgsArgs {
        name: string;
    }
    export const PegArgsCodec: thrift.IStructCodec<IPegArgsArgs, IPegArgs> = {
        encode(args: IPegArgsArgs, output: thrift.TProtocol): void {
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
        },
        decode(input: thrift.TProtocol): IPegArgs {
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
    };
    export class PegArgs extends thrift.StructLike implements IPegArgs {
        public name: string;
        constructor(args: IPegArgsArgs) {
            super();
            if (args.name != null) {
                const value_4: string = args.name;
                this.name = value_4;
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[name] is unset!");
            }
        }
        public static read(input: thrift.TProtocol): PegArgs {
            return new PegArgs(PegArgsCodec.decode(input));
        }
        public static write(args: IPegArgsArgs, output: thrift.TProtocol): void {
            return PegArgsCodec.encode(args, output);
        }
        public write(output: thrift.TProtocol): void {
            return PegArgsCodec.encode(this, output);
        }
    }
    export interface IPongArgs {
        code?: ICode;
    }
    export interface IPongArgsArgs {
        code?: ICodeArgs;
    }
    export const PongArgsCodec: thrift.IStructCodec<IPongArgsArgs, IPongArgs> = {
        encode(args: IPongArgsArgs, output: thrift.TProtocol): void {
            const obj = {
                code: args.code
            };
            output.writeStructBegin("PongArgs");
            if (obj.code != null) {
                output.writeFieldBegin("code", thrift.TType.STRUCT, 1);
                CodeCodec.encode(obj.code, output);
                output.writeFieldEnd();
            }
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        },
        decode(input: thrift.TProtocol): IPongArgs {
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
                            const value_5: ICode = CodeCodec.decode(input);
                            _args.code = value_5;
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
                code: _args.code
            };
        }
    };
    export class PongArgs extends thrift.StructLike implements IPongArgs {
        public code?: ICode;
        constructor(args: IPongArgsArgs = {}) {
            super();
            if (args.code != null) {
                const value_6: ICode = new Code(args.code);
                this.code = value_6;
            }
        }
        public static read(input: thrift.TProtocol): PongArgs {
            return new PongArgs(PongArgsCodec.decode(input));
        }
        public static write(args: IPongArgsArgs, output: thrift.TProtocol): void {
            return PongArgsCodec.encode(args, output);
        }
        public write(output: thrift.TProtocol): void {
            return PongArgsCodec.encode(this, output);
        }
    }
    export interface IPegResult {
        success?: string;
    }
    export interface IPegResultArgs {
        success?: string;
    }
    export const PegResultCodec: thrift.IStructCodec<IPegResultArgs, IPegResult> = {
        encode(args: IPegResultArgs, output: thrift.TProtocol): void {
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
        },
        decode(input: thrift.TProtocol): IPegResult {
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
                            const value_7: string = input.readString();
                            _args.success = value_7;
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
    export class PegResult extends thrift.StructLike implements IPegResult {
        public success?: string;
        constructor(args: IPegResultArgs = {}) {
            super();
            if (args.success != null) {
                const value_8: string = args.success;
                this.success = value_8;
            }
        }
        public static read(input: thrift.TProtocol): PegResult {
            return new PegResult(PegResultCodec.decode(input));
        }
        public static write(args: IPegResultArgs, output: thrift.TProtocol): void {
            return PegResultCodec.encode(args, output);
        }
        public write(output: thrift.TProtocol): void {
            return PegResultCodec.encode(this, output);
        }
    }
    export interface IPongResult {
        success?: thrift.Int64;
    }
    export interface IPongResultArgs {
        success?: number | thrift.Int64;
    }
    export const PongResultCodec: thrift.IStructCodec<IPongResultArgs, IPongResult> = {
        encode(args: IPongResultArgs, output: thrift.TProtocol): void {
            const obj = {
                success: (typeof args.success === "number" ? new thrift.Int64(args.success) : args.success)
            };
            output.writeStructBegin("PongResult");
            if (obj.success != null) {
                output.writeFieldBegin("success", thrift.TType.I64, 0);
                output.writeI64(obj.success);
                output.writeFieldEnd();
            }
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        },
        decode(input: thrift.TProtocol): IPongResult {
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
                        if (fieldType === thrift.TType.I64) {
                            const value_9: thrift.Int64 = input.readI64();
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
    export class PongResult extends thrift.StructLike implements IPongResult {
        public success?: thrift.Int64;
        constructor(args: IPongResultArgs = {}) {
            super();
            if (args.success != null) {
                const value_10: thrift.Int64 = (typeof args.success === "number" ? new thrift.Int64(args.success) : args.success);
                this.success = value_10;
            }
        }
        public static read(input: thrift.TProtocol): PongResult {
            return new PongResult(PongResultCodec.decode(input));
        }
        public static write(args: IPongResultArgs, output: thrift.TProtocol): void {
            return PongResultCodec.encode(args, output);
        }
        public write(output: thrift.TProtocol): void {
            return PongResultCodec.encode(this, output);
        }
    }
    export class Client<Context = any> {
        public readonly serviceName: string = serviceName;
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
        public peg(name: string, context?: Context): Promise<string> {
            const writer: thrift.TTransport = new this.transport();
            const output: thrift.TProtocol = new this.protocol(writer);
            output.writeMessageBegin("peg", thrift.MessageType.CALL, this.incrementRequestId());
            const args: IPegArgsArgs = { name };
            PegArgsCodec.encode(args, output);
            output.writeMessageEnd();
            return this.connection.send(writer.flush(), context).then((data: Buffer) => {
                const reader: thrift.TTransport = this.transport.receiver(data);
                const input: thrift.TProtocol = new this.protocol(reader);
                try {
                    const { fieldName: fieldName, messageType: messageType }: thrift.IThriftMessage = input.readMessageBegin();
                    if (fieldName === "peg") {
                        if (messageType === thrift.MessageType.EXCEPTION) {
                            const err: thrift.TApplicationException = thrift.TApplicationExceptionCodec.decode(input);
                            input.readMessageEnd();
                            return Promise.reject(err);
                        }
                        else {
                            const result: IPegResult = PegResultCodec.decode(input);
                            input.readMessageEnd();
                            if (result.success != null) {
                                return Promise.resolve(result.success);
                            }
                            else {
                                return Promise.reject(new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, "peg failed: unknown result"));
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
        public pong(code?: ICodeArgs, context?: Context): Promise<thrift.Int64> {
            const writer: thrift.TTransport = new this.transport();
            const output: thrift.TProtocol = new this.protocol(writer);
            output.writeMessageBegin("pong", thrift.MessageType.CALL, this.incrementRequestId());
            const args: IPongArgsArgs = { code };
            PongArgsCodec.encode(args, output);
            output.writeMessageEnd();
            return this.connection.send(writer.flush(), context).then((data: Buffer) => {
                const reader: thrift.TTransport = this.transport.receiver(data);
                const input: thrift.TProtocol = new this.protocol(reader);
                try {
                    const { fieldName: fieldName, messageType: messageType }: thrift.IThriftMessage = input.readMessageBegin();
                    if (fieldName === "pong") {
                        if (messageType === thrift.MessageType.EXCEPTION) {
                            const err: thrift.TApplicationException = thrift.TApplicationExceptionCodec.decode(input);
                            input.readMessageEnd();
                            return Promise.reject(err);
                        }
                        else {
                            const result: IPongResult = PongResultCodec.decode(input);
                            input.readMessageEnd();
                            if (result.success != null) {
                                return Promise.resolve(result.success);
                            }
                            else {
                                return Promise.reject(new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, "pong failed: unknown result"));
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
    }
    export interface IHandler<Context = any> {
        peg(name: string, context?: Context): string | Promise<string>;
        pong(code?: ICode, context?: Context): thrift.Int64 | Promise<thrift.Int64>;
    }
    export class Processor<Context = any> {
        public readonly serviceName: string = serviceName;
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
                    case "process_peg": {
                        resolve(this.process_peg(requestId, input, output, context));
                        break;
                    }
                    case "process_pong": {
                        resolve(this.process_pong(requestId, input, output, context));
                        break;
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
                        break;
                    }
                }
            });
        }
        public process_peg(requestId: number, input: thrift.TProtocol, output: thrift.TProtocol, context: Context): Promise<Buffer> {
            return new Promise<string>((resolve, reject): void => {
                try {
                    const args: IPegArgs = PegArgsCodec.decode(input);
                    input.readMessageEnd();
                    resolve(this._handler.peg(args.name, context));
                }
                catch (err) {
                    reject(err);
                }
            }).then((data: string): Buffer => {
                const result: IPegResult = { success: data };
                output.writeMessageBegin("peg", thrift.MessageType.REPLY, requestId);
                PegResultCodec.encode(result, output);
                output.writeMessageEnd();
                return output.flush();
            }).catch((err: Error): Buffer => {
                const result: thrift.TApplicationException = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, err.message);
                output.writeMessageBegin("peg", thrift.MessageType.EXCEPTION, requestId);
                thrift.TApplicationExceptionCodec.encode(result, output);
                output.writeMessageEnd();
                return output.flush();
            });
        }
        public process_pong(requestId: number, input: thrift.TProtocol, output: thrift.TProtocol, context: Context): Promise<Buffer> {
            return new Promise<thrift.Int64>((resolve, reject): void => {
                try {
                    const args: IPongArgs = PongArgsCodec.decode(input);
                    input.readMessageEnd();
                    resolve(this._handler.pong(args.code, context));
                }
                catch (err) {
                    reject(err);
                }
            }).then((data: thrift.Int64): Buffer => {
                const result: IPongResult = { success: data };
                output.writeMessageBegin("pong", thrift.MessageType.REPLY, requestId);
                PongResultCodec.encode(result, output);
                output.writeMessageEnd();
                return output.flush();
            }).catch((err: Error): Buffer => {
                const result: thrift.TApplicationException = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, err.message);
                output.writeMessageBegin("pong", thrift.MessageType.EXCEPTION, requestId);
                thrift.TApplicationExceptionCodec.encode(result, output);
                output.writeMessageEnd();
                return output.flush();
            });
        }
    }
}
