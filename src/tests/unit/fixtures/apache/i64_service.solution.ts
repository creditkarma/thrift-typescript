export interface IAddArgsArgs {
    num1: number | Int64;
    num2: number | Int64;
}
export class AddArgs {
    public num1: Int64;
    public num2: Int64;
    constructor(args: IAddArgsArgs) {
        if (args != null && args.num1 != null) {
            if (typeof args.num1 === "number") {
                this.num1 = new Int64(args.num1);
            }
            else {
                this.num1 = args.num1;
            }
        }
        else {
            throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.UNKNOWN, "Required field[num1] is unset!");
        }
        if (args != null && args.num2 != null) {
            if (typeof args.num2 === "number") {
                this.num2 = new Int64(args.num2);
            }
            else {
                this.num2 = args.num2;
            }
        }
        else {
            throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.UNKNOWN, "Required field[num2] is unset!");
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
    public static read(input: thrift.TProtocol): AddArgs {
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
                case 1:
                    if (fieldType === thrift.Thrift.Type.I64) {
                        const value_1: Int64 = input.readI64();
                        _args.num1 = value_1;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.Thrift.Type.I64) {
                        const value_2: Int64 = input.readI64();
                        _args.num2 = value_2;
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
        if (_args.num1 !== undefined && _args.num2 !== undefined) {
            return new AddArgs(_args);
        }
        else {
            throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.UNKNOWN, "Unable to read AddArgs from input");
        }
    }
}
export interface IAddResultArgs {
    success?: number | Int64;
}
export class AddResult {
    public success?: Int64;
    constructor(args?: IAddResultArgs) {
        if (args != null && args.success != null) {
            if (typeof args.success === "number") {
                this.success = new Int64(args.success);
            }
            else {
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
    public static read(input: thrift.TProtocol): AddResult {
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
                    if (fieldType === thrift.Thrift.Type.I64) {
                        const value_3: Int64 = input.readI64();
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
        return new AddResult(_args);
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
    public add(num1: Int64, num2: Int64): Promise<Int64> {
        const requestId: number = this.incrementSeqId();
        return new Promise<Int64>((resolve, reject): void => {
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
    public send_add(num1: Int64, num2: Int64, requestId: number): void {
        const output: thrift.TProtocol = new this.protocol(this.output);
        output.writeMessageBegin("add", thrift.Thrift.MessageType.CALL, requestId);
        const args: AddArgs = new AddArgs({ num1, num2 });
        args.write(output);
        output.writeMessageEnd();
        this.output.flush();
        return;
    }
    public recv_add(input: thrift.TProtocol, mtype: thrift.Thrift.MessageType, requestId: number): void {
        const noop = (): any => null;
        const callback = this._reqs[requestId] || noop;
        if (mtype === thrift.Thrift.MessageType.EXCEPTION) {
            const x: thrift.Thrift.TApplicationException = new thrift.Thrift.TApplicationException();
            x.read(input);
            input.readMessageEnd();
            return callback(x);
        }
        else {
            const result: AddResult = AddResult.read(input);
            input.readMessageEnd();
            if (result.success != null) {
                return callback(undefined, result.success);
            }
            else {
                return callback(new thrift.Thrift.TApplicationException(thrift.Thrift.TApplicationExceptionType.UNKNOWN, "add failed: unknown result"));
            }
        }
    }
}
export interface IHandler {
    add(num1: Int64, num2: Int64): Int64 | Promise<Int64>;
}
export class Processor {
    public _handler: IHandler;
    constructor(handler: IHandler) {
        this._handler = handler;
    }
    public process(input: thrift.TProtocol, output: thrift.TProtocol): void {
        const metadata: thrift.TMessage = input.readMessageBegin();
        const fname: string = metadata.fname;
        const requestId: number = metadata.rseqid;
        const methodName: string = "process_" + fname;
        switch (methodName) {
            case "process_add": {
                this.process_add(requestId, input, output);
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
    public process_add(requestId: number, input: thrift.TProtocol, output: thrift.TProtocol): void {
        new Promise<Int64>((resolve, reject): void => {
            try {
                const args: AddArgs = AddArgs.read(input);
                input.readMessageEnd();
                resolve(this._handler.add(args.num1, args.num2));
            }
            catch (err) {
                reject(err);
            }
        }).then((data: Int64): void => {
            const result: AddResult = new AddResult({ success: data });
            output.writeMessageBegin("add", thrift.Thrift.MessageType.REPLY, requestId);
            result.write(output);
            output.writeMessageEnd();
            output.flush();
            return;
        }).catch((err: Error): void => {
            const result: thrift.Thrift.TApplicationException = new thrift.Thrift.TApplicationException(thrift.Thrift.TApplicationExceptionType.UNKNOWN, err.message);
            output.writeMessageBegin("add", thrift.Thrift.MessageType.EXCEPTION, requestId);
            result.write(output);
            output.writeMessageEnd();
            output.flush();
            return;
        });
    }
}
