export namespace MyService {
    export interface IPingArgsArgs {
    }
    export class PingArgs implements thrift.StructLike {
        constructor(args?: IPingArgsArgs) {
            if (args != null) {
            }
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
    export interface IPingResultArgs {
        success?: void;
    }
    export class PingResult implements thrift.StructLike {
        public success: void;
        constructor(args?: IPingResultArgs) {
            if (args != null) {
                if (args.success != null) {
                    this.success = args.success;
                }
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
    export class Client<Context = any> {
        public _seqid: number;
        public _reqs: {
            [name: number]: (err: Error | object | undefined, val?: any) => void;
        };
        public output: thrift.TTransport;
        public protocol: new (trans: thrift.TTransport) => thrift.TProtocol;
        protected onSend: (data: Buffer, seqid: number, context?: Context) => void;
        constructor(output: thrift.TTransport, protocol: new (trans: thrift.TTransport) => thrift.TProtocol, callback: (data: Buffer, seqid: number, context?: Context) => void) {
            this._seqid = 0;
            this._reqs = {};
            this.output = output;
            this.protocol = protocol;
            this.onSend = callback;
        }
        public incrementSeqId(): number {
            return this._seqid += 1;
        }
        public ping(context?: Context): Promise<void> {
            const requestId: number = this.incrementSeqId();
            return new Promise<void>((resolve, reject): void => {
                this._reqs[requestId] = (error, result) => {
                    delete this._reqs[requestId];
                    if (error != null) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                };
                this.send_ping(requestId, context);
            });
        }
        public send_ping(requestId: number, context?: Context): void {
            const output: thrift.TProtocol = new this.protocol(this.output);
            output.writeMessageBegin("ping", thrift.MessageType.CALL, requestId);
            const args: PingArgs = new PingArgs({});
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
            return callback(undefined, result.success);
        }
    }
    export interface IHandler<Context = any> {
        ping: (context?: Context) => void | Promise<void>;
    }
    export class Processor<Context = any> {
        public _handler: IHandler<Context>;
        constructor(handler: IHandler<Context>) {
            this._handler = handler;
        }
        public process(input: thrift.TProtocol, output: thrift.TProtocol, context?: Context): Promise<Buffer> {
            return new Promise<Buffer>((resolve, reject): void => {
                const metadata: {
                    fieldName: string;
                    messageType: thrift.MessageType;
                    requestId: number;
                } = input.readMessageBegin();
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
            return new Promise<void>((resolve, reject): void => {
                try {
                    input.readMessageEnd();
                    resolve(this._handler.ping(context));
                }
                catch (err) {
                    reject(err);
                }
            }).then((data: void): Buffer => {
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
