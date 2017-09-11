import { Thrift, TProtocol, TTransport } from "thrift";
export interface IMyServicePingArgsArgs {
    status: number;
}
export class MyServicePingArgs {
    public status: number = null;
    constructor(args?: IMyServicePingArgsArgs) {
        if (args != null) {
            if (args.status != null) {
                this.status = args.status;
            }
        }
    }
    public write(output: TProtocol): void {
        output.writeStructBegin("MyServicePingArgs");
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
            const fname: string = ret.fname;
            const ftype: Thrift.Type = ret.ftype;
            const fid: number = ret.fid;
            if (ftype === Thrift.Type.STOP) {
                break;
            }
            switch (fid) {
                case 1:
                    if (ftype === Thrift.Type.I32) {
                        this.status = input.readI32();
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
export interface IMyServicePingResultArgs {
    success?: string;
    exp?: MyException;
}
export class MyServicePingResult {
    public success: string = null;
    public exp: MyException = null;
    constructor(args?: IMyServicePingResultArgs) {
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
        output.writeStructBegin("MyServicePingResult");
        if (this.success != null) {
            output.writeFieldBegin("success", Thrift.Type.STRING, 1);
            output.writeString(this.success);
            output.writeFieldEnd();
        }
        if (this.exp != null) {
            output.writeFieldBegin("exp", Thrift.Type.STRUCT, 2);
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
            const fname: string = ret.fname;
            const ftype: Thrift.Type = ret.ftype;
            const fid: number = ret.fid;
            if (ftype === Thrift.Type.STOP) {
                break;
            }
            switch (fid) {
                case 1:
                    if (ftype === Thrift.Type.STRING) {
                        this.success = input.readString();
                    }
                    else {
                        input.skip(ftype);
                    }
                    break;
                case 2:
                    if (ftype === Thrift.Type.STRUCT) {
                        this.exp = new MyException();
                        this.exp.read(input);
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
    private _seqid: number;
    private _reqs: {
        [name: string]: (err: Error | object, r?: any) => void;
    };
    public output: TTransport;
    public protocol: new () => TProtocol;
    constructor(output: TTransport, protocol: new () => TProtocol) {
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
        const output = new this.protocol(this.output);
        output.writeMessageBegin("ping", Thrift.MessageType.CALL, this.seqid());
        const args = new MyServicePingArgs({ status });
        args.write(output);
        output.writeMessageEnd();
        return this.output.flush();
    }
    public recv_ping(input: TProtocol, mtype: Thrift.MessageType, rseqid: number): void {
        const noop = (): void => null;
        const callback = this._reqs[rseqid] || noop;
        delete this._reqs[rseqid];
        if (mtype === Thrift.MessageType.EXCEPTION) {
            const x: Thrift.TApplicationException = new Thrift.TApplicationException();
            x.read(input);
            input.readMessageEnd();
            return callback(x);
        }
        const result = new MyServicePingResult();
        result.read(input);
        input.readMessageEnd();
        if (exp != null) {
            return callback(result.exp);
        }
        if ("StringKeyword" !== "VoidKeyword") {
            if (result.success != null) {
                return callback(undefined, result.success);
            }
        }
        return callback(new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, "ping failed: unknown result"));
    }
}
export class Processor<Context> {
    private _handler;
    constructor(handler) {
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
        if (this["process_" + fname] != null) {
            return this["process_" + fname].call(this, rseqid, input, output, context);
        }
        else {
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
    public process_ping(seqid: number, input: TProtocol, output: TProtocol, context: Context): void {
        const args = new MyServicePingArgs();
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
            const result = new MyServicePingResult({ success: data });
            output.writeMessageBegin("ping", Thrift.MessageType.REPLY, seqid);
            result.write(output);
            output.writeMessageEnd();
            output.flush();
        }).catch((err: Error): void => {
            let result;
            if (1 > 0) {
                if (err instanceof MyException) {
                    result = new MyServicePingResult({ exp: err });
                    output.writeMessageBegin("ping", Thrift.MessageType.REPLY, seqid);
                }
                else {
                    result = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, err.message);
                    output.writeMessageBegin("ping", Thrift.MessageType.EXCEPTION, seqid);
                }
            }
            else {
                result = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, err.message);
                output.writeMessageBegin("ping", Thrift.MessageType.EXCEPTION, seqid);
            }
            result.write(output);
            output.writeMessageEnd();
            output.flush();
        });
    }
}
