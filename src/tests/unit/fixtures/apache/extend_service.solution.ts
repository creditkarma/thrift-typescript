export namespace ParentService {
    export interface IPingArgsArgs {
        status: number;
    }
    export class PingArgs {
        public status: number;
        constructor(args: IPingArgsArgs) {
            if (args != null && args.status != null) {
                this.status = args.status;
            }
            else {
                throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.UNKNOWN, "Required field[status] is unset!");
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
                    case 1:
                        if (fieldType === thrift.Thrift.Type.I32) {
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
                throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.UNKNOWN, "Unable to read PingArgs from input");
            }
        }
    }
    export interface IPingResultArgs {
        success?: string;
    }
    export class PingResult {
        public success?: string;
        constructor(args?: IPingResultArgs) {
            if (args != null && args.success != null) {
                this.success = args.success;
            }
        }
        public write(output: thrift.TProtocol): void {
            output.writeStructBegin("PingResult");
            if (this.success != null) {
                output.writeFieldBegin("success", thrift.Thrift.Type.STRING, 0);
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
                const ret: thrift.TField = input.readFieldBegin();
                const fieldType: thrift.Thrift.Type = ret.ftype;
                const fieldId: number = ret.fid;
                if (fieldType === thrift.Thrift.Type.STOP) {
                    break;
                }
                switch (fieldId) {
                    case 0:
                        if (fieldType === thrift.Thrift.Type.STRING) {
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
            else {
                const result: PingResult = PingResult.read(input);
                input.readMessageEnd();
                if (result.success != null) {
                    return callback(undefined, result.success);
                }
                else {
                    return callback(new thrift.Thrift.TApplicationException(thrift.Thrift.TApplicationExceptionType.UNKNOWN, "ping failed: unknown result"));
                }
            }
        }
    }
    export interface IHandler {
        ping(status: number): string | Promise<string>;
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
                case "process_ping": {
                    this.process_ping(requestId, input, output);
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
        public process_ping(requestId: number, input: thrift.TProtocol, output: thrift.TProtocol): void {
            new Promise<string>((resolve, reject): void => {
                try {
                    const args: PingArgs = PingArgs.read(input);
                    input.readMessageEnd();
                    resolve(this._handler.ping(args.status));
                }
                catch (err) {
                    reject(err);
                }
            }).then((data: string): void => {
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
export namespace ChildService {
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
                throw new thrift.Thrift.TProtocolException(thrift.Thrift.TProtocolExceptionType.UNKNOWN, "Unable to read PegArgs from input");
            }
        }
    }
    export interface IPegResultArgs {
        success?: string;
    }
    export class PegResult {
        public success?: string;
        constructor(args?: IPegResultArgs) {
            if (args != null && args.success != null) {
                this.success = args.success;
            }
        }
        public write(output: thrift.TProtocol): void {
            output.writeStructBegin("PegResult");
            if (this.success != null) {
                output.writeFieldBegin("success", thrift.Thrift.Type.STRING, 0);
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
                const ret: thrift.TField = input.readFieldBegin();
                const fieldType: thrift.Thrift.Type = ret.ftype;
                const fieldId: number = ret.fid;
                if (fieldType === thrift.Thrift.Type.STOP) {
                    break;
                }
                switch (fieldId) {
                    case 0:
                        if (fieldType === thrift.Thrift.Type.STRING) {
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
    export class Client extends ParentService.Client {
        public _seqid: number;
        public _reqs: {
            [name: number]: (err: Error | object | undefined, val?: any) => void;
        };
        public output: thrift.TTransport;
        public protocol: new (trans: thrift.TTransport) => thrift.TProtocol;
        constructor(output: thrift.TTransport, protocol: new (trans: thrift.TTransport) => thrift.TProtocol) {
            super(output, protocol);
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
                if (result.success != null) {
                    return callback(undefined, result.success);
                }
                else {
                    return callback(new thrift.Thrift.TApplicationException(thrift.Thrift.TApplicationExceptionType.UNKNOWN, "peg failed: unknown result"));
                }
            }
        }
    }
    export interface ILocalHandler {
        peg(name: string): string | Promise<string>;
    }
    export type IHandler = ILocalHandler & ParentService.IHandler;
    export class Processor extends ParentService.Processor {
        public _handler: IHandler;
        constructor(handler: IHandler) {
            super({
                ping: handler.ping
            });
            this._handler = handler;
        }
        public process(input: thrift.TProtocol, output: thrift.TProtocol): void {
            const metadata: thrift.TMessage = input.readMessageBegin();
            const fname: string = metadata.fname;
            const requestId: number = metadata.rseqid;
            const methodName: string = "process_" + fname;
            switch (methodName) {
                case "process_ping": {
                    this.process_ping(requestId, input, output);
                    return;
                }
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
                const result: thrift.Thrift.TApplicationException = new thrift.Thrift.TApplicationException(thrift.Thrift.TApplicationExceptionType.UNKNOWN, err.message);
                output.writeMessageBegin("peg", thrift.Thrift.MessageType.EXCEPTION, requestId);
                result.write(output);
                output.writeMessageEnd();
                output.flush();
                return;
            });
        }
    }
}
