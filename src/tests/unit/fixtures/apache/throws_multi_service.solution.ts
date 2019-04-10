export interface IServiceExceptionArgs {
    message?: string;
}
export class ServiceException {
    public message?: string;
    constructor(args?: IServiceExceptionArgs) {
        if (args != null && args.message != null) {
            this.message = args.message;
        }
    }
    public write(output: thrift.TProtocol): void {
        output.writeStructBegin("ServiceException");
        if (this.message != null) {
            output.writeFieldBegin("message", thrift.Thrift.Type.STRING, 1);
            output.writeString(this.message);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
    public static read(input: thrift.TProtocol): ServiceException {
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
                    if (fieldType === thrift.Thrift.Type.STRING) {
                        const value_1: string = input.readString();
                        _args.message = value_1;
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
        return new ServiceException(_args);
    }
}
export interface IAuthExceptionArgs {
    message?: string;
    code?: number;
}
export class AuthException {
    public message?: string;
    public code?: number;
    constructor(args?: IAuthExceptionArgs) {
        if (args != null && args.message != null) {
            this.message = args.message;
        }
        if (args != null && args.code != null) {
            this.code = args.code;
        }
    }
    public write(output: thrift.TProtocol): void {
        output.writeStructBegin("AuthException");
        if (this.message != null) {
            output.writeFieldBegin("message", thrift.Thrift.Type.STRING, 1);
            output.writeString(this.message);
            output.writeFieldEnd();
        }
        if (this.code != null) {
            output.writeFieldBegin("code", thrift.Thrift.Type.I32, 2);
            output.writeI32(this.code);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
    public static read(input: thrift.TProtocol): AuthException {
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
                    if (fieldType === thrift.Thrift.Type.STRING) {
                        const value_2: string = input.readString();
                        _args.message = value_2;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.Thrift.Type.I32) {
                        const value_3: number = input.readI32();
                        _args.code = value_3;
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
        return new AuthException(_args);
    }
}
export interface IUnknownExceptionArgs {
    message?: string;
}
export class UnknownException {
    public message?: string;
    constructor(args?: IUnknownExceptionArgs) {
        if (args != null && args.message != null) {
            this.message = args.message;
        }
    }
    public write(output: thrift.TProtocol): void {
        output.writeStructBegin("UnknownException");
        if (this.message != null) {
            output.writeFieldBegin("message", thrift.Thrift.Type.STRING, 1);
            output.writeString(this.message);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
    public static read(input: thrift.TProtocol): UnknownException {
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
                    if (fieldType === thrift.Thrift.Type.STRING) {
                        const value_4: string = input.readString();
                        _args.message = value_4;
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
        return new UnknownException(_args);
    }
}
export interface IPegArgsArgs {
    name: string;
}
export class PegArgs {
    public name: string;
    constructor(args: IPegArgsArgs) {
        if (args != null && args.name != null) {
            this.name = args.name;
        }
        else {
            throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.UNKNOWN, "Required field[name] is unset!");
        }
    }
    public write(output: thrift.TProtocol): void {
        output.writeStructBegin("PegArgs");
        if (this.name != null) {
            output.writeFieldBegin("name", thrift.Thrift.Type.STRING, 1);
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
            const ret: thrift.TField = input.readFieldBegin();
            const fieldType: thrift.Thrift.Type = ret.ftype;
            const fieldId: number = ret.fid;
            if (fieldType === thrift.Thrift.Type.STOP) {
                break;
            }
            switch (fieldId) {
                case 1:
                    if (fieldType === thrift.Thrift.Type.STRING) {
                        const value_5: string = input.readString();
                        _args.name = value_5;
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
            throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.UNKNOWN, "Unable to read PegArgs from input");
        }
    }
}
export interface IPegResultArgs {
    success?: string;
    exp?: ServiceException;
    authExp?: AuthException;
    unknownExp?: UnknownException;
}
export class PegResult {
    public success?: string;
    public exp?: ServiceException;
    public authExp?: AuthException;
    public unknownExp?: UnknownException;
    constructor(args?: IPegResultArgs) {
        if (args != null && args.success != null) {
            this.success = args.success;
        }
        if (args != null && args.exp != null) {
            this.exp = args.exp;
        }
        if (args != null && args.authExp != null) {
            this.authExp = args.authExp;
        }
        if (args != null && args.unknownExp != null) {
            this.unknownExp = args.unknownExp;
        }
    }
    public write(output: thrift.TProtocol): void {
        output.writeStructBegin("PegResult");
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
        if (this.authExp != null) {
            output.writeFieldBegin("authExp", thrift.Thrift.Type.STRUCT, 2);
            this.authExp.write(output);
            output.writeFieldEnd();
        }
        if (this.unknownExp != null) {
            output.writeFieldBegin("unknownExp", thrift.Thrift.Type.STRUCT, 3);
            this.unknownExp.write(output);
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
            const ret: thrift.TField = input.readFieldBegin();
            const fieldType: thrift.Thrift.Type = ret.ftype;
            const fieldId: number = ret.fid;
            if (fieldType === thrift.Thrift.Type.STOP) {
                break;
            }
            switch (fieldId) {
                case 0:
                    if (fieldType === thrift.Thrift.Type.STRING) {
                        const value_6: string = input.readString();
                        _args.success = value_6;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 1:
                    if (fieldType === thrift.Thrift.Type.STRUCT) {
                        const value_7: ServiceException = ServiceException.read(input);
                        _args.exp = value_7;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.Thrift.Type.STRUCT) {
                        const value_8: AuthException = AuthException.read(input);
                        _args.authExp = value_8;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 3:
                    if (fieldType === thrift.Thrift.Type.STRUCT) {
                        const value_9: UnknownException = UnknownException.read(input);
                        _args.unknownExp = value_9;
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
    public peg(name: string): Promise<string> {
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
            this.send_peg(name, requestId);
        });
    }
    public send_peg(name: string, requestId: number): void {
        const output: thrift.TProtocol = new this.protocol(this.output);
        output.writeMessageBegin("peg", thrift.Thrift.MessageType.CALL, requestId);
        const args: PegArgs = new PegArgs({ name });
        args.write(output);
        output.writeMessageEnd();
        this.output.flush();
        return;
    }
    public recv_peg(input: thrift.TProtocol, mtype: thrift.Thrift.MessageType, requestId: number): void {
        const noop = (): any => null;
        const callback = this._reqs[requestId] || noop;
        if (mtype === thrift.Thrift.MessageType.EXCEPTION) {
            const x: thrift.Thrift.TApplicationException = new thrift.Thrift.TApplicationException();
            x.read(input);
            input.readMessageEnd();
            return callback(x);
        }
        else {
            const result: PegResult = PegResult.read(input);
            input.readMessageEnd();
            if (result.exp != null) {
                return callback(result.exp);
            }
            else if (result.authExp != null) {
                return callback(result.authExp);
            }
            else if (result.unknownExp != null) {
                return callback(result.unknownExp);
            }
            else {
                if (result.success != null) {
                    return callback(undefined, result.success);
                }
                else {
                    return callback(new thrift.Thrift.TApplicationException(thrift.Thrift.TApplicationExceptionType.UNKNOWN, "peg failed: unknown result"));
                }
            }
        }
    }
}
export interface IHandler {
    peg(name: string): string | Promise<string>;
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
            case "process_peg": {
                this.process_peg(requestId, input, output);
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
    public process_peg(requestId: number, input: thrift.TProtocol, output: thrift.TProtocol): void {
        new Promise<string>((resolve, reject): void => {
            try {
                const args: PegArgs = PegArgs.read(input);
                input.readMessageEnd();
                resolve(this._handler.peg(args.name));
            }
            catch (err) {
                reject(err);
            }
        }).then((data: string): void => {
            const result: PegResult = new PegResult({ success: data });
            output.writeMessageBegin("peg", thrift.Thrift.MessageType.REPLY, requestId);
            result.write(output);
            output.writeMessageEnd();
            output.flush();
            return;
        }).catch((err: Error): void => {
            if (err instanceof ServiceException) {
                const result: PegResult = new PegResult({ exp: err });
                output.writeMessageBegin("peg", thrift.Thrift.MessageType.REPLY, requestId);
                result.write(output);
                output.writeMessageEnd();
                output.flush();
                return;
            }
            else if (err instanceof AuthException) {
                const result: PegResult = new PegResult({ authExp: err });
                output.writeMessageBegin("peg", thrift.Thrift.MessageType.REPLY, requestId);
                result.write(output);
                output.writeMessageEnd();
                output.flush();
                return;
            }
            else if (err instanceof UnknownException) {
                const result: PegResult = new PegResult({ unknownExp: err });
                output.writeMessageBegin("peg", thrift.Thrift.MessageType.REPLY, requestId);
                result.write(output);
                output.writeMessageEnd();
                output.flush();
                return;
            }
            else {
                const result: thrift.Thrift.TApplicationException = new thrift.Thrift.TApplicationException(thrift.Thrift.TApplicationExceptionType.UNKNOWN, err.message);
                output.writeMessageBegin("peg", thrift.Thrift.MessageType.EXCEPTION, requestId);
                result.write(output);
                output.writeMessageEnd();
                output.flush();
                return;
            }
        });
    }
}
