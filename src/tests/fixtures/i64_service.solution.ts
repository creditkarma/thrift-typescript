export namespace MyService {
    export interface IAddArgsArgs {
        num1: thrift.Int64;
        num2: thrift.Int64;
    }
    export class AddArgs {
        public num1: thrift.Int64;
        public num2: thrift.Int64;
        constructor(args?: IAddArgsArgs) {
            if (args != null) {
                if (args.num1 != null) {
                    this.num1 = args.num1;
                }
                if (args.num2 != null) {
                    this.num2 = args.num2;
                }
            }
        }
        public write(output: thrift.TProtocol): void {
            output.writeStructBegin("AddArgs");
            if (this.num1 != null) {
                output.writeFieldBegin("num1", thrift.Thrift.Type.I64, 1);
                output.writeI64(this.num1);
                output.writeFieldEnd();
            }
            if (this.num2 != null) {
                output.writeFieldBegin("num2", thrift.Thrift.Type.I64, 2);
                output.writeI64(this.num2);
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
                        if (ftype === thrift.Thrift.Type.I64) {
                            const value_1: thrift.Int64 = input.readI64();
                            this.num1 = value_1;
                        }
                        else {
                            input.skip(ftype);
                        }
                        break;
                    case 2:
                        if (ftype === thrift.Thrift.Type.I64) {
                            const value_2: thrift.Int64 = input.readI64();
                            this.num2 = value_2;
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
    export interface IAddResultArgs {
        success?: thrift.Int64;
    }
    export class AddResult {
        public success: thrift.Int64;
        constructor(args?: IAddResultArgs) {
            if (args != null) {
                if (args.success != null) {
                    this.success = args.success;
                }
            }
        }
        public write(output: thrift.TProtocol): void {
            output.writeStructBegin("AddResult");
            if (this.success != null) {
                output.writeFieldBegin("success", thrift.Thrift.Type.I64, 0);
                output.writeI64(this.success);
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
                        if (ftype === thrift.Thrift.Type.I64) {
                            const value_3: thrift.Int64 = input.readI64();
                            this.success = value_3;
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
        public add(num1: thrift.Int64, num2: thrift.Int64): Promise<thrift.Int64> {
            const requestId: number = this.incrementSeqId();
            return new Promise<thrift.Int64>((resolve, reject): void => {
                this._reqs[requestId] = (error, result) => {
                    delete this._reqs[requestId];
                    if (error != null) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                };
                this.send_add(num1, num2, requestId);
            });
        }
        public send_add(num1: thrift.Int64, num2: thrift.Int64, requestId: number): void {
            const output: thrift.TProtocol = new this.protocol(this.output);
            output.writeMessageBegin("add", thrift.Thrift.MessageType.CALL, requestId);
            const args: AddArgs = new AddArgs({ num1, num2 });
            args.write(output);
            output.writeMessageEnd();
            return this.output.flush();
        }
        public recv_add(input: thrift.TProtocol, mtype: thrift.Thrift.MessageType, rseqid: number): void {
            const noop = (): any => null;
            const callback = this._reqs[rseqid] || noop;
            if (mtype === thrift.Thrift.MessageType.EXCEPTION) {
                const x: thrift.Thrift.TApplicationException = new thrift.Thrift.TApplicationException();
                x.read(input);
                input.readMessageEnd();
                return callback(x);
            }
            const result: AddResult = new AddResult();
            result.read(input);
            input.readMessageEnd();
            if (result.success != null) {
                return callback(undefined, result.success);
            }
            else {
                return callback(new thrift.Thrift.TApplicationException(thrift.Thrift.TApplicationExceptionType.UNKNOWN, "add failed: unknown result"));
            }
        }
    }
    export interface IHandler<Context> {
        add: (num1: thrift.Int64, num2: thrift.Int64, context?: Context) => thrift.Int64 | Promise<thrift.Int64>;
    }
    export class Processor<Context> {
        public _handler: IHandler<Context>;
        constructor(handler: IHandler<Context>) {
            this._handler = handler;
        }
        public process(input: thrift.TProtocol, output: thrift.TProtocol, context?: Context): void {
            const metadata: {
                fname: string;
                mtype: thrift.Thrift.MessageType;
                rseqid: number;
            } = input.readMessageBegin();
            const fname: string = metadata.fname;
            const rseqid: number = metadata.rseqid;
            const methodName: string = "process_" + fname;
            switch (methodName) {
                case "process_add": {
                    return this.process_add(rseqid, input, output, context);
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
        public process_add(seqid: number, input: thrift.TProtocol, output: thrift.TProtocol, context?: Context): void {
            const args = new AddArgs();
            args.read(input);
            input.readMessageEnd();
            new Promise<thrift.Int64>((resolve, reject): void => {
                try {
                    resolve(this._handler.add(args.num1, args.num2, context));
                }
                catch (err) {
                    reject(err);
                }
            }).then((data: thrift.Int64): void => {
                const result: AddResult = new AddResult({ success: data });
                output.writeMessageBegin("add", thrift.Thrift.MessageType.REPLY, seqid);
                result.write(output);
                output.writeMessageEnd();
                output.flush();
            }).catch((err: Error): void => {
                const result: thrift.Thrift.TApplicationException = new thrift.Thrift.TApplicationException(thrift.Thrift.TApplicationExceptionType.UNKNOWN, err.message);
                output.writeMessageBegin("add", thrift.Thrift.MessageType.EXCEPTION, seqid);
                result.write(output);
                output.writeMessageEnd();
                output.flush();
                return;
            });
        }
    }
}
