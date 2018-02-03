export namespace MyService {
    export interface IPingArgsArgs {
    }
    export class PingArgs {
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
                const ret: thrift.TField = input.readFieldBegin();
                const fieldType: thrift.Thrift.Type = ret.ftype;
                const fieldId: number = ret.fid;
                if (fieldType === thrift.Thrift.Type.STOP) {
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
    export class PingResult {
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
                const ret: thrift.TField = input.readFieldBegin();
                const fieldType: thrift.Thrift.Type = ret.ftype;
                const fieldId: number = ret.fid;
                if (fieldType === thrift.Thrift.Type.STOP) {
                    break;
                }
                switch (fieldId) {
                    case 0:
                        if (fieldType === thrift.Thrift.Type.VOID) {
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
    export class Client {
        public _seqid: number;
        public _reqs: {
            [name: number]: (err: Error | object | undefined, val?: any) => void;
        };
        public output: thrift.TTransport;
        public protocol: new (trans: thrift.TTransport) => thrift.TProtocol;
        constructor(output: thrift.TTransport, protocol: new (trans: thrift.TTransport) => thrift.TProtocol) {
            this._seqid = 0;
            this._reqs = {};
            this.output = output;
            this.protocol = protocol;
        }
        public incrementSeqId(): number {
            return this._seqid += 1;
        }
        public ping(): Promise<void> {
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
                this.send_ping(requestId);
            });
        }
        public send_ping(requestId: number): void {
            const output: thrift.TProtocol = new this.protocol(this.output);
            output.writeMessageBegin("ping", thrift.Thrift.MessageType.CALL, requestId);
            const args: PingArgs = new PingArgs({});
            args.write(output);
            output.writeMessageEnd();
            this.output.flush();
            return;
        }
        public recv_ping(input: thrift.TProtocol, mtype: thrift.Thrift.MessageType, requestId: number): void {
            const noop = (): any => null;
            const callback = this._reqs[requestId] || noop;
            if (mtype === thrift.Thrift.MessageType.EXCEPTION) {
                const x: thrift.Thrift.TApplicationException = new thrift.Thrift.TApplicationException();
                x.read(input);
                input.readMessageEnd();
                return callback(x);
            }
            input.readMessageEnd();
            return callback(undefined);
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
        public process(input: thrift.TProtocol, output: thrift.TProtocol, context?: Context): void {
            const metadata: thrift.TMessage = input.readMessageBegin();
            const fname: string = metadata.fname;
            const requestId: number = metadata.rseqid;
            const methodName: string = "process_" + fname;
            switch (methodName) {
                case "process_ping": {
                    this.process_ping(requestId, input, output, context);
                    return;
                }
                default: {
                    input.skip(thrift.Thrift.Type.STRUCT);
                    input.readMessageEnd();
                    const errMessage = "Unknown function " + fname;
                    const err = new thrift.Thrift.TApplicationException(thrift.Thrift.TApplicationExceptionType.UNKNOWN_METHOD, errMessage);
                    output.writeMessageBegin(fname, thrift.Thrift.MessageType.EXCEPTION, requestId);
                    err.write(output);
                    output.writeMessageEnd();
                    output.flush();
                    return;
                }
            }
        }
        public process_ping(requestId: number, input: thrift.TProtocol, output: thrift.TProtocol, context?: Context): void {
            new Promise<void>((resolve, reject): void => {
                try {
                    input.readMessageEnd();
                    resolve(this._handler.ping(context));
                }
                catch (err) {
                    reject(err);
                }
            }).then((data: void): void => {
                const result: PingResult = new PingResult({ success: data });
                output.writeMessageBegin("ping", thrift.Thrift.MessageType.REPLY, requestId);
                result.write(output);
                output.writeMessageEnd();
                output.flush();
                return;
            }).catch((err: Error): void => {
                const result: thrift.Thrift.TApplicationException = new thrift.Thrift.TApplicationException(thrift.Thrift.TApplicationExceptionType.UNKNOWN, err.message);
                output.writeMessageBegin("ping", thrift.Thrift.MessageType.EXCEPTION, requestId);
                result.write(output);
                output.writeMessageEnd();
                output.flush();
                return;
            });
        }
    }
}
