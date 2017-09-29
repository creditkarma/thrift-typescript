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
    public write(output: TProtocol): void {
        output.writeStructBegin("MyException");
        if (this.message != null) {
            output.writeFieldBegin("message", Thrift.Type.STRING, 1);
            output.writeString(this.message);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
    public read(input: TProtocol): void {
        input.readStructBegin();
        while (true) {
            const ret: {
                fname: string;
                ftype: Thrift.Type;
                fid: number;
            } = input.readFieldBegin();
            const ftype: Thrift.Type = ret.ftype;
            const fid: number = ret.fid;
            if (ftype === Thrift.Type.STOP) {
                break;
            }
            switch (fid) {
                case 1:
                    if (ftype === Thrift.Type.STRING) {
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
        public write(output: TProtocol): void {
            output.writeStructBegin("PingArgs");
            if (this.status != null) {
                output.writeFieldBegin("status", Thrift.Type.I32, 1);
                output.writeI32(this.status);
                output.writeFieldEnd();
            }
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        }
        public read(input: TProtocol): void {
            input.readStructBegin();
            while (true) {
                const ret: {
                    fname: string;
                    ftype: Thrift.Type;
                    fid: number;
                } = input.readFieldBegin();
                const ftype: Thrift.Type = ret.ftype;
                const fid: number = ret.fid;
                if (ftype === Thrift.Type.STOP) {
                    break;
                }
                switch (fid) {
                    case 1:
                        if (ftype === Thrift.Type.I32) {
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
        public write(output: TProtocol): void {
            output.writeStructBegin("PingResult");
            if (this.success != null) {
                output.writeFieldBegin("success", Thrift.Type.STRING, 0);
                output.writeString(this.success);
                output.writeFieldEnd();
            }
            if (this.exp != null) {
                output.writeFieldBegin("exp", Thrift.Type.STRUCT, 1);
                this.exp.write(output);
                output.writeFieldEnd();
            }
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        }
        public read(input: TProtocol): void {
            input.readStructBegin();
            while (true) {
                const ret: {
                    fname: string;
                    ftype: Thrift.Type;
                    fid: number;
                } = input.readFieldBegin();
                const ftype: Thrift.Type = ret.ftype;
                const fid: number = ret.fid;
                if (ftype === Thrift.Type.STOP) {
                    break;
                }
                switch (fid) {
                    case 0:
                        if (ftype === Thrift.Type.STRING) {
                            const value_3: string = input.readString();
                            this.success = value_3;
                        }
                        else {
                            input.skip(ftype);
                        }
                        break;
                    case 1:
                        if (ftype === Thrift.Type.STRUCT) {
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
        public output: TTransport;
        public protocol: new (trans: TTransport) => TProtocol;
        constructor(output: TTransport, protocol: new (trans: TTransport) => TProtocol) {
            this._seqid = 0;
            this._reqs = {};
            this.output = output;
            this.protocol = protocol;
        }
        public seqid(): number {
            return this._seqid;
        }
        public new_seqid(): number {
            return this._seqid += 1;
        }
        public ping(status: number): Promise<string> {
            this._seqid = this.new_seqid();
            return new Promise<string>((resolve, reject): void => {
                this._reqs[this.seqid()] = (error, result) => {
                    if (error != null) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                };
                this.send_ping(status);
            });
        }
        public send_ping(status: number): void {
            const output: TProtocol = new this.protocol(this.output);
            output.writeMessageBegin("ping", Thrift.MessageType.CALL, this.seqid());
            const args: PingArgs = new PingArgs({ status });
            args.write(output);
            output.writeMessageEnd();
            return this.output.flush();
        }
        public recv_ping(input: TProtocol, mtype: Thrift.MessageType, rseqid: number): void {
            const noop = (): any => null;
            const callback = this._reqs[rseqid] || noop;
            delete this._reqs[rseqid];
            if (mtype === Thrift.MessageType.EXCEPTION) {
                const x: Thrift.TApplicationException = new Thrift.TApplicationException();
                x.read(input);
                input.readMessageEnd();
                return callback(x);
            }
            const result = new PingResult();
            result.read(input);
            input.readMessageEnd();
            if (result.exp != null) {
                return callback(result.exp);
            }
            if (result.success != null) {
                return callback(undefined, result.success);
            }
            else {
                return callback(new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, "ping failed: unknown result"));
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
        public process(input: TProtocol, output: TProtocol, context: Context): void {
            const metadata: {
                fname: string;
                mtype: Thrift.MessageType;
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
                    input.skip(Thrift.Type.STRUCT);
                    input.readMessageEnd();
                    const errMessage = "Unknown function " + fname;
                    const err = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN_METHOD, errMessage);
                    output.writeMessageBegin(fname, Thrift.MessageType.EXCEPTION, rseqid);
                    err.write(output);
                    output.writeMessageEnd();
                    output.flush();
                }
            }
        }
        public process_ping(seqid: number, input: TProtocol, output: TProtocol, context: Context): void {
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
                const result = new PingResult({ success: data });
                output.writeMessageBegin("ping", Thrift.MessageType.REPLY, seqid);
                result.write(output);
                output.writeMessageEnd();
                output.flush();
            }).catch((err: Error): void => {
                if (1 > 0) {
                    if (err instanceof MyException) {
                        const result: PingResult = new PingResult({ exp: err });
                        output.writeMessageBegin("ping", Thrift.MessageType.REPLY, seqid);
                        result.write(output);
                        output.writeMessageEnd();
                        output.flush();
                        return;
                    }
                    else {
                        const result: Thrift.TApplicationException = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, err.message);
                        output.writeMessageBegin("ping", Thrift.MessageType.EXCEPTION, seqid);
                        result.write(output);
                        output.writeMessageEnd();
                        output.flush();
                        return;
                    }
                }
                else {
                    const result: Thrift.TApplicationException = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, err.message);
                    output.writeMessageBegin("ping", Thrift.MessageType.EXCEPTION, seqid);
                    result.write(output);
                    output.writeMessageEnd();
                    output.flush();
                    return;
                }
            });
        }
    }
}
