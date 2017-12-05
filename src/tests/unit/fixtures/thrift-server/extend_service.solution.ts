export namespace ParentService {
    export interface IPingArgsArgs {
        status: number;
    }
    export class PingArgs implements thrift.StructLike {
        public status: number;
        constructor(args: IPingArgsArgs) {
            if (args != null) {
                if (args.status != null) {
                    this.status = args.status;
                }
            }
        }
        public write(output: thrift.TProtocol): void {
            output.writeStructBegin("PingArgs");
            if (this.status != null) {
                output.writeFieldBegin("status", thrift.TType.I32, 1);
                output.writeI32(this.status);
                output.writeFieldEnd();
            }
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
                return new PingArgs(_args);
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read PingArgs from input");
            }
        }
    }
    export interface IPingResultArgs {
        success?: string;
    }
    export class PingResult implements thrift.StructLike {
        public success: string;
        constructor(args?: IPingResultArgs) {
            if (args != null) {
                if (args.success != null) {
                    this.success = args.success;
                }
            }
        }
        public write(output: thrift.TProtocol): void {
            output.writeStructBegin("PingResult");
            if (this.success != null) {
                output.writeFieldBegin("success", thrift.TType.STRING, 0);
                output.writeString(this.success);
                output.writeFieldEnd();
            }
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
            return new PingResult(_args);
        }
    }
    export class Client<Context = any> {
        public _seqid: number;
        public _reqs: thrift.IRequestCallbackMap;
        public output: thrift.TTransport;
        public protocol: thrift.IProtocolConstructor;
        protected onSend: (data: Buffer, seqid: number, context?: Context) => void;
        constructor(output: thrift.TTransport, protocol: thrift.IProtocolConstructor, callback: (data: Buffer, seqid: number, context?: Context) => void) {
            this._seqid = 0;
            this._reqs = {};
            this.output = output;
            this.protocol = protocol;
            this.onSend = callback;
        }
        public incrementSeqId(): number {
            return this._seqid += 1;
        }
        public ping(status: number, context?: Context): Promise<string> {
            const requestId: number = this.incrementSeqId();
            return new Promise<string>((resolve, reject): void => {
                this._reqs[requestId] = (error, result) => {
                    delete this._reqs[requestId];
                    if (error != null) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                };
                this.send_ping(status, requestId, context);
            });
        }
        public send_ping(status: number, requestId: number, context?: Context): void {
            const output: thrift.TProtocol = new this.protocol(this.output);
            output.writeMessageBegin("ping", thrift.MessageType.CALL, requestId);
            const args: PingArgs = new PingArgs({ status });
            args.write(output);
            output.writeMessageEnd();
            this.onSend(this.output.flush(), requestId, context);
        }
        public recv_ping(input: thrift.TProtocol, messageType: thrift.MessageType, requestId: number): void {
            const noop = (): any => null;
            const callback = this._reqs[requestId] || noop;
            if (messageType === thrift.MessageType.EXCEPTION) {
                const x: thrift.TApplicationException = thrift.TApplicationException.read(input);
                input.readMessageEnd();
                return callback(x);
            }
            const result: PingResult = PingResult.read(input);
            input.readMessageEnd();
            if (result.success != null) {
                return callback(undefined, result.success);
            }
            else {
                return callback(new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, "ping failed: unknown result"));
            }
        }
    }
    export interface IHandler<Context = any> {
        ping: (status: number, context?: Context) => string | Promise<string>;
    }
    export class Processor<Context = any> {
        public _handler: IHandler<Context>;
        constructor(handler: IHandler<Context>) {
            this._handler = handler;
        }
        public process(input: thrift.TProtocol, output: thrift.TProtocol, context?: Context): Promise<Buffer> {
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
                        err.write(output);
                        output.writeMessageEnd();
                        resolve(output.flush());
                    }
                }
            });
        }
        public process_ping(seqid: number, input: thrift.TProtocol, output: thrift.TProtocol, context?: Context): Promise<Buffer> {
            return new Promise<string>((resolve, reject): void => {
                try {
                    const args: PingArgs = PingArgs.read(input);
                    input.readMessageEnd();
                    resolve(this._handler.ping(args.status, context));
                }
                catch (err) {
                    reject(err);
                }
            }).then((data: string): Buffer => {
                const result: PingResult = new PingResult({ success: data });
                output.writeMessageBegin("ping", thrift.MessageType.REPLY, seqid);
                result.write(output);
                output.writeMessageEnd();
                return output.flush();
            }).catch((err: Error): Buffer => {
                const result: thrift.TApplicationException = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, err.message);
                output.writeMessageBegin("ping", thrift.MessageType.EXCEPTION, seqid);
                result.write(output);
                output.writeMessageEnd();
                return output.flush();
            });
        }
    }
}
export namespace ChildService {
    export interface IPegArgsArgs {
        name: string;
    }
    export class PegArgs implements thrift.StructLike {
        public name: string;
        constructor(args: IPegArgsArgs) {
            if (args != null) {
                if (args.name != null) {
                    this.name = args.name;
                }
            }
        }
        public write(output: thrift.TProtocol): void {
            output.writeStructBegin("PegArgs");
            if (this.name != null) {
                output.writeFieldBegin("name", thrift.TType.STRING, 1);
                output.writeString(this.name);
                output.writeFieldEnd();
            }
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        }
        public static read(input: thrift.TProtocol): PegArgs {
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
                return new PegArgs(_args);
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read PegArgs from input");
            }
        }
    }
    export interface IPegResultArgs {
        success?: string;
    }
    export class PegResult implements thrift.StructLike {
        public success: string;
        constructor(args?: IPegResultArgs) {
            if (args != null) {
                if (args.success != null) {
                    this.success = args.success;
                }
            }
        }
        public write(output: thrift.TProtocol): void {
            output.writeStructBegin("PegResult");
            if (this.success != null) {
                output.writeFieldBegin("success", thrift.TType.STRING, 0);
                output.writeString(this.success);
                output.writeFieldEnd();
            }
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        }
        public static read(input: thrift.TProtocol): PegResult {
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
                        if (fieldType === thrift.TType.STRING) {
                            const value_4: string = input.readString();
                            _args.success = value_4;
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
            return new PegResult(_args);
        }
    }
    export class Client<Context = any> extends ParentService.Client<Context> {
        public _seqid: number;
        public _reqs: thrift.IRequestCallbackMap;
        public output: thrift.TTransport;
        public protocol: thrift.IProtocolConstructor;
        protected onSend: (data: Buffer, seqid: number, context?: Context) => void;
        constructor(output: thrift.TTransport, protocol: thrift.IProtocolConstructor, callback: (data: Buffer, seqid: number, context?: Context) => void) {
            super(output, protocol, callback);
            this._seqid = 0;
            this._reqs = {};
            this.output = output;
            this.protocol = protocol;
            this.onSend = callback;
        }
        public incrementSeqId(): number {
            return this._seqid += 1;
        }
        public peg(name: string, context?: Context): Promise<string> {
            const requestId: number = this.incrementSeqId();
            return new Promise<string>((resolve, reject): void => {
                this._reqs[requestId] = (error, result) => {
                    delete this._reqs[requestId];
                    if (error != null) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                };
                this.send_peg(name, requestId, context);
            });
        }
        public send_peg(name: string, requestId: number, context?: Context): void {
            const output: thrift.TProtocol = new this.protocol(this.output);
            output.writeMessageBegin("peg", thrift.MessageType.CALL, requestId);
            const args: PegArgs = new PegArgs({ name });
            args.write(output);
            output.writeMessageEnd();
            this.onSend(this.output.flush(), requestId, context);
        }
        public recv_peg(input: thrift.TProtocol, messageType: thrift.MessageType, requestId: number): void {
            const noop = (): any => null;
            const callback = this._reqs[requestId] || noop;
            if (messageType === thrift.MessageType.EXCEPTION) {
                const x: thrift.TApplicationException = thrift.TApplicationException.read(input);
                input.readMessageEnd();
                return callback(x);
            }
            const result: PegResult = PegResult.read(input);
            input.readMessageEnd();
            if (result.success != null) {
                return callback(undefined, result.success);
            }
            else {
                return callback(new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, "peg failed: unknown result"));
            }
        }
    }
    export interface ILocalHandler<Context = any> {
        peg: (name: string, context?: Context) => string | Promise<string>;
    }
    export type IHandler<Context = any> = ILocalHandler<Context> & ParentService.IHandler<Context>;
    export class Processor<Context = any> extends ParentService.Processor<Context> {
        public _handler: IHandler<Context>;
        constructor(handler: IHandler<Context>) {
            super({
                ping: handler.ping
            });
            this._handler = handler;
        }
        public process(input: thrift.TProtocol, output: thrift.TProtocol, context?: Context): Promise<Buffer> {
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
        public process_peg(seqid: number, input: thrift.TProtocol, output: thrift.TProtocol, context?: Context): Promise<Buffer> {
            return new Promise<string>((resolve, reject): void => {
                try {
                    const args: PegArgs = PegArgs.read(input);
                    input.readMessageEnd();
                    resolve(this._handler.peg(args.name, context));
                }
                catch (err) {
                    reject(err);
                }
            }).then((data: string): Buffer => {
                const result: PegResult = new PegResult({ success: data });
                output.writeMessageBegin("peg", thrift.MessageType.REPLY, seqid);
                result.write(output);
                output.writeMessageEnd();
                return output.flush();
            }).catch((err: Error): Buffer => {
                const result: thrift.TApplicationException = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, err.message);
                output.writeMessageBegin("peg", thrift.MessageType.EXCEPTION, seqid);
                result.write(output);
                output.writeMessageEnd();
                return output.flush();
            });
        }
    }
}
