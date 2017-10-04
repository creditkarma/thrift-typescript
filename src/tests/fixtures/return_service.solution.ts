export interface IMyExceptionArgs {
    message: string;
}
export class MyException {
    public message: string;
    constructor(args?: IMyExceptionArgs) {
        if (args != null) {
            if (args.message != null) {
                this.message = args.message;
            }
        }
    }
    public write(output: thrift.TProtocol): void {
        output.writeStructBegin("MyException");
        if (this.message != null) {
            output.writeFieldBegin("message", thrift.Thrift.Type.STRING, 1);
            output.writeString(this.message);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
    public read(input: thrift.TProtocol): void {
        input.readStructBegin();
        while (true) {
            const ret: {
                fname: string;
                ftype: thrift.Thrift.Type;
                fid: number;
            } = input.readFieldBegin();
            const ftype: thrift.Thrift.Type = ret.ftype;
            const fid: number = ret.fid;
            if (ftype === thrift.Thrift.Type.STOP) {
                break;
            }
            switch (fid) {
                case 1:
                    if (ftype === thrift.Thrift.Type.STRING) {
                        const value_1: string = input.readString();
                        this.message = value_1;
                    }
                    else {
                        input.skip(ftype);
                    }
                    break;
                default: {
                    input.skip(ftype);
                }
            }
            input.readFieldEnd();
        }
        input.readStructEnd();
        return;
    }
}
export namespace MyService {
    export interface IPingArgsArgs {
        status: number;
    }
    export class PingArgs {
        public status: number;
        constructor(args?: IPingArgsArgs) {
            if (args != null) {
                if (args.status != null) {
                    this.status = args.status;
                }
            }
        }
        public write(output: thrift.TProtocol): void {
            output.writeStructBegin("PingArgs");
            if (this.status != null) {
                output.writeFieldBegin("status", thrift.Thrift.Type.I32, 1);
                output.writeI32(this.status);
                output.writeFieldEnd();
            }
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        }
        public read(input: thrift.TProtocol): void {
            input.readStructBegin();
            while (true) {
                const ret: {
                    fname: string;
                    ftype: thrift.Thrift.Type;
                    fid: number;
                } = input.readFieldBegin();
                const ftype: thrift.Thrift.Type = ret.ftype;
                const fid: number = ret.fid;
                if (ftype === thrift.Thrift.Type.STOP) {
                    break;
                }
                switch (fid) {
                    case 1:
                        if (ftype === thrift.Thrift.Type.I32) {
                            const value_2: number = input.readI32();
                            this.status = value_2;
                        }
                        else {
                            input.skip(ftype);
                        }
                        break;
                    default: {
                        input.skip(ftype);
                    }
                }
                input.readFieldEnd();
            }
            input.readStructEnd();
            return;
        }
    }
    export interface IPingResultArgs {
        success?: string;
        exp?: MyException;
    }
    export class PingResult {
        public success: string;
        public exp: MyException;
        constructor(args?: IPingResultArgs) {
            if (args != null) {
                if (args.success != null) {
                    this.success = args.success;
                }
                if (args.exp != null) {
                    this.exp = args.exp;
                }
            }
        }
        public write(output: thrift.TProtocol): void {
            output.writeStructBegin("PingResult");
            if (this.success != null) {
                output.writeFieldBegin("success", thrift.Thrift.Type.STRING, 0);
                output.writeString(this.success);
                output.writeFieldEnd();
            }
            if (this.exp != null) {
                output.writeFieldBegin("exp", thrift.Thrift.Type.STRUCT, 1);
                this.exp.write(output);
                output.writeFieldEnd();
            }
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        }
        public read(input: thrift.TProtocol): void {
            input.readStructBegin();
            while (true) {
                const ret: {
                    fname: string;
                    ftype: thrift.Thrift.Type;
                    fid: number;
                } = input.readFieldBegin();
                const ftype: thrift.Thrift.Type = ret.ftype;
                const fid: number = ret.fid;
                if (ftype === thrift.Thrift.Type.STOP) {
                    break;
                }
                switch (fid) {
                    case 0:
                        if (ftype === thrift.Thrift.Type.STRING) {
                            const value_3: string = input.readString();
                            this.success = value_3;
                        }
                        else {
                            input.skip(ftype);
                        }
                        break;
                    case 1:
                        if (ftype === thrift.Thrift.Type.STRUCT) {
                            const value_4: MyException = new MyException();
                            value_4.read(input);
                            this.exp = value_4;
                        }
                        else {
                            input.skip(ftype);
                        }
                        break;
                    default: {
                        input.skip(ftype);
                    }
                }
                input.readFieldEnd();
            }
            input.readStructEnd();
            return;
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
        public ping(status: number): Promise<string> {
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
                this.send_ping(status, requestId);
            });
        }
        public send_ping(status: number, requestId: number): void {
            const output: thrift.TProtocol = new this.protocol(this.output);
            output.writeMessageBegin("ping", thrift.Thrift.MessageType.CALL, requestId);
            const args: PingArgs = new PingArgs({ status });
            args.write(output);
            output.writeMessageEnd();
            return this.output.flush();
        }
        public recv_ping(input: thrift.TProtocol, mtype: thrift.Thrift.MessageType, rseqid: number): void {
            const noop = (): any => null;
            const callback = this._reqs[rseqid] || noop;
            if (mtype === thrift.Thrift.MessageType.EXCEPTION) {
                const x: thrift.Thrift.TApplicationException = new thrift.Thrift.TApplicationException();
                x.read(input);
                input.readMessageEnd();
                return callback(x);
            }
            const result: PingResult = new PingResult();
            result.read(input);
            input.readMessageEnd();
            if (result.exp != null) {
                return callback(result.exp);
            }
            if (result.success != null) {
                return callback(undefined, result.success);
            }
            else {
                return callback(new thrift.Thrift.TApplicationException(thrift.Thrift.TApplicationExceptionType.UNKNOWN, "ping failed: unknown result"));
            }
        }
    }
    export interface IHandler<Context> {
        ping: (status: number, context: Context) => string;
    }
    export class Processor<Context> {
        public _handler: IHandler<Context>;
        constructor(handler: IHandler<Context>) {
            this._handler = handler;
        }
        public process(input: thrift.TProtocol, output: thrift.TProtocol, context: Context): void {
            const metadata: {
                fname: string;
                mtype: thrift.Thrift.MessageType;
                rseqid: number;
            } = input.readMessageBegin();
            const fname: string = metadata.fname;
            const rseqid: number = metadata.rseqid;
            const methodName: string = "process_" + fname;
            switch (methodName) {
                case "process_ping": {
                    return this.process_ping(rseqid, input, output, context);
                }
                default: {
                    input.skip(thrift.Thrift.Type.STRUCT);
                    input.readMessageEnd();
                    const errMessage = "Unknown function " + fname;
                    const err = new thrift.Thrift.TApplicationException(thrift.Thrift.TApplicationExceptionType.UNKNOWN_METHOD, errMessage);
                    output.writeMessageBegin(fname, thrift.Thrift.MessageType.EXCEPTION, rseqid);
                    err.write(output);
                    output.writeMessageEnd();
                    output.flush();
                }
            }
        }
        public process_ping(seqid: number, input: thrift.TProtocol, output: thrift.TProtocol, context: Context): void {
            const args = new PingArgs();
            args.read(input);
            input.readMessageEnd();
            new Promise<string>((resolve, reject): void => {
                try {
                    resolve(this._handler.ping(args.status, context));
                }
                catch (err) {
                    reject(err);
                }
            }).then((data: string): void => {
                const result: PingResult = new PingResult({ success: data });
                output.writeMessageBegin("ping", thrift.Thrift.MessageType.REPLY, seqid);
                result.write(output);
                output.writeMessageEnd();
                output.flush();
            }).catch((err: Error): void => {
                if (err instanceof MyException) {
                    const result: PingResult = new PingResult({ exp: err });
                    output.writeMessageBegin("ping", thrift.Thrift.MessageType.REPLY, seqid);
                    result.write(output);
                    output.writeMessageEnd();
                    output.flush();
                    return;
                }
                else {
                    const result: thrift.Thrift.TApplicationException = new thrift.Thrift.TApplicationException(thrift.Thrift.TApplicationExceptionType.UNKNOWN, err.message);
                    output.writeMessageBegin("ping", thrift.Thrift.MessageType.EXCEPTION, seqid);
                    result.write(output);
                    output.writeMessageEnd();
                    output.flush();
                    return;
                }
            });
        }
    }
}
