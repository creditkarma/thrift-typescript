export interface ICode {
    status?: thrift.Int64;
}
export interface ICodeArgs {
    status?: number | string | thrift.Int64;
}
export const CodeCodec: thrift.IStructCodec<ICodeArgs, ICode> = {
    encode(args: ICodeArgs, output: thrift.TProtocol): void {
        const obj = {
            status: (typeof args.status === "number" ? new thrift.Int64(args.status) : typeof args.status === "string" ? thrift.Int64.fromDecimalString(args.status) : args.status)
        };
        output.writeStructBegin("Code");
        if (obj.status != null) {
            output.writeFieldBegin("status", thrift.TType.I64, 1);
            output.writeI64((typeof obj.status === "number" ? new thrift.Int64(obj.status) : typeof obj.status === "string" ? thrift.Int64.fromDecimalString(obj.status) : obj.status));
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): ICode {
        let _args: any = {};
        input.readStructBegin();
        while (true) {
            const ret: thrift.IThriftField = input.readFieldBegin();
            const fieldType: thrift.TType = ret.fieldType;
            const fieldId: number = ret.fieldId;
            if (fieldType === thrift.TType.STOP) {
                break;
            }
            switch (fieldId) {
                case 1:
                    if (fieldType === thrift.TType.I64) {
                        const value_1: thrift.Int64 = input.readI64();
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
        return {
            status: _args.status
        };
    }
};
export class Code extends thrift.StructLike implements ICode {
    public status?: thrift.Int64;
    public readonly _annotations: thrift.IThriftAnnotations = {};
    public readonly _fieldAnnotations: thrift.IFieldAnnotations = {};
    constructor(args: ICodeArgs = {}) {
        super();
        if (args.status != null) {
            const value_2: thrift.Int64 = (typeof args.status === "number" ? new thrift.Int64(args.status) : typeof args.status === "string" ? thrift.Int64.fromDecimalString(args.status) : args.status);
            this.status = value_2;
        }
    }
    public static read(input: thrift.TProtocol): Code {
        return new Code(CodeCodec.decode(input));
    }
    public static write(args: ICodeArgs, output: thrift.TProtocol): void {
        return CodeCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return CodeCodec.encode(this, output);
    }
}
export const serviceName: string = "MyService";
export const annotations: thrift.IThriftAnnotations = {};
export const methodAnnotations: thrift.IMethodAnnotations = {
    peg: {
        annotations: {},
        fieldAnnotations: {}
    },
    pong: {
        annotations: {},
        fieldAnnotations: {}
    }
};
export const methodNames: Array<string> = ["peg", "pong"];
export interface IPeg__Args {
    name: string;
}
export interface IPeg__ArgsArgs {
    name: string;
}
export const Peg__ArgsCodec: thrift.IStructCodec<IPeg__ArgsArgs, IPeg__Args> = {
    encode(args: IPeg__ArgsArgs, output: thrift.TProtocol): void {
        const obj = {
            name: args.name
        };
        output.writeStructBegin("Peg__Args");
        if (obj.name != null) {
            output.writeFieldBegin("name", thrift.TType.STRING, 1);
            output.writeString(obj.name);
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[name] is unset!");
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): IPeg__Args {
        let _args: any = {};
        input.readStructBegin();
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
            return {
                name: _args.name
            };
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read Peg__Args from input");
        }
    }
};
export class Peg__Args extends thrift.StructLike implements IPeg__Args {
    public name: string;
    public readonly _annotations: thrift.IThriftAnnotations = {};
    public readonly _fieldAnnotations: thrift.IFieldAnnotations = {};
    constructor(args: IPeg__ArgsArgs) {
        super();
        if (args.name != null) {
            const value_4: string = args.name;
            this.name = value_4;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[name] is unset!");
        }
    }
    public static read(input: thrift.TProtocol): Peg__Args {
        return new Peg__Args(Peg__ArgsCodec.decode(input));
    }
    public static write(args: IPeg__ArgsArgs, output: thrift.TProtocol): void {
        return Peg__ArgsCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return Peg__ArgsCodec.encode(this, output);
    }
}
export interface IPong__Args {
    code?: ICode;
}
export interface IPong__ArgsArgs {
    code?: ICodeArgs;
}
export const Pong__ArgsCodec: thrift.IStructCodec<IPong__ArgsArgs, IPong__Args> = {
    encode(args: IPong__ArgsArgs, output: thrift.TProtocol): void {
        const obj = {
            code: args.code
        };
        output.writeStructBegin("Pong__Args");
        if (obj.code != null) {
            output.writeFieldBegin("code", thrift.TType.STRUCT, 1);
            CodeCodec.encode(obj.code, output);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): IPong__Args {
        let _args: any = {};
        input.readStructBegin();
        while (true) {
            const ret: thrift.IThriftField = input.readFieldBegin();
            const fieldType: thrift.TType = ret.fieldType;
            const fieldId: number = ret.fieldId;
            if (fieldType === thrift.TType.STOP) {
                break;
            }
            switch (fieldId) {
                case 1:
                    if (fieldType === thrift.TType.STRUCT) {
                        const value_5: ICode = CodeCodec.decode(input);
                        _args.code = value_5;
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
        return {
            code: _args.code
        };
    }
};
export class Pong__Args extends thrift.StructLike implements IPong__Args {
    public code?: ICode;
    public readonly _annotations: thrift.IThriftAnnotations = {};
    public readonly _fieldAnnotations: thrift.IFieldAnnotations = {};
    constructor(args: IPong__ArgsArgs = {}) {
        super();
        if (args.code != null) {
            const value_6: ICode = new Code(args.code);
            this.code = value_6;
        }
    }
    public static read(input: thrift.TProtocol): Pong__Args {
        return new Pong__Args(Pong__ArgsCodec.decode(input));
    }
    public static write(args: IPong__ArgsArgs, output: thrift.TProtocol): void {
        return Pong__ArgsCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return Pong__ArgsCodec.encode(this, output);
    }
}
export interface IPeg__Result {
    success?: string;
}
export interface IPeg__ResultArgs {
    success?: string;
}
export const Peg__ResultCodec: thrift.IStructCodec<IPeg__ResultArgs, IPeg__Result> = {
    encode(args: IPeg__ResultArgs, output: thrift.TProtocol): void {
        const obj = {
            success: args.success
        };
        output.writeStructBegin("Peg__Result");
        if (obj.success != null) {
            output.writeFieldBegin("success", thrift.TType.STRING, 0);
            output.writeString(obj.success);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): IPeg__Result {
        let _args: any = {};
        input.readStructBegin();
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
                        const value_7: string = input.readString();
                        _args.success = value_7;
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
        return {
            success: _args.success
        };
    }
};
export class Peg__Result extends thrift.StructLike implements IPeg__Result {
    public success?: string;
    public readonly _annotations: thrift.IThriftAnnotations = {};
    public readonly _fieldAnnotations: thrift.IFieldAnnotations = {};
    constructor(args: IPeg__ResultArgs = {}) {
        super();
        if (args.success != null) {
            const value_8: string = args.success;
            this.success = value_8;
        }
    }
    public static read(input: thrift.TProtocol): Peg__Result {
        return new Peg__Result(Peg__ResultCodec.decode(input));
    }
    public static write(args: IPeg__ResultArgs, output: thrift.TProtocol): void {
        return Peg__ResultCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return Peg__ResultCodec.encode(this, output);
    }
}
export interface IPong__Result {
    success?: thrift.Int64;
}
export interface IPong__ResultArgs {
    success?: number | string | thrift.Int64;
}
export const Pong__ResultCodec: thrift.IStructCodec<IPong__ResultArgs, IPong__Result> = {
    encode(args: IPong__ResultArgs, output: thrift.TProtocol): void {
        const obj = {
            success: (typeof args.success === "number" ? new thrift.Int64(args.success) : typeof args.success === "string" ? thrift.Int64.fromDecimalString(args.success) : args.success)
        };
        output.writeStructBegin("Pong__Result");
        if (obj.success != null) {
            output.writeFieldBegin("success", thrift.TType.I64, 0);
            output.writeI64((typeof obj.success === "number" ? new thrift.Int64(obj.success) : typeof obj.success === "string" ? thrift.Int64.fromDecimalString(obj.success) : obj.success));
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): IPong__Result {
        let _args: any = {};
        input.readStructBegin();
        while (true) {
            const ret: thrift.IThriftField = input.readFieldBegin();
            const fieldType: thrift.TType = ret.fieldType;
            const fieldId: number = ret.fieldId;
            if (fieldType === thrift.TType.STOP) {
                break;
            }
            switch (fieldId) {
                case 0:
                    if (fieldType === thrift.TType.I64) {
                        const value_9: thrift.Int64 = input.readI64();
                        _args.success = value_9;
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
        return {
            success: _args.success
        };
    }
};
export class Pong__Result extends thrift.StructLike implements IPong__Result {
    public success?: thrift.Int64;
    public readonly _annotations: thrift.IThriftAnnotations = {};
    public readonly _fieldAnnotations: thrift.IFieldAnnotations = {};
    constructor(args: IPong__ResultArgs = {}) {
        super();
        if (args.success != null) {
            const value_10: thrift.Int64 = (typeof args.success === "number" ? new thrift.Int64(args.success) : typeof args.success === "string" ? thrift.Int64.fromDecimalString(args.success) : args.success);
            this.success = value_10;
        }
    }
    public static read(input: thrift.TProtocol): Pong__Result {
        return new Pong__Result(Pong__ResultCodec.decode(input));
    }
    public static write(args: IPong__ResultArgs, output: thrift.TProtocol): void {
        return Pong__ResultCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return Pong__ResultCodec.encode(this, output);
    }
}
export class Client<Context = any> extends thrift.ThriftClient<Context> {
    public static readonly serviceName: string = serviceName;
    public static readonly annotations: thrift.IThriftAnnotations = annotations;
    public static readonly methodAnnotations: thrift.IMethodAnnotations = methodAnnotations;
    public static readonly methodNames: Array<string> = methodNames;
    public readonly _serviceName: string = serviceName;
    public readonly _annotations: thrift.IThriftAnnotations = annotations;
    public readonly _methodAnnotations: thrift.IMethodAnnotations = methodAnnotations;
    public readonly _methodNames: Array<string> = methodNames;
    public peg(name: string, context?: Context): Promise<string> {
        const writer: thrift.TTransport = new this.transport();
        const output: thrift.TProtocol = new this.protocol(writer);
        output.writeMessageBegin("peg", thrift.MessageType.CALL, this.incrementRequestId());
        const args: IPeg__ArgsArgs = { name };
        Peg__ArgsCodec.encode(args, output);
        output.writeMessageEnd();
        return this.connection.send(writer.flush(), context).then((data: Buffer) => {
            const reader: thrift.TTransport = this.transport.receiver(data);
            const input: thrift.TProtocol = new this.protocol(reader);
            try {
                const { fieldName: fieldName, messageType: messageType }: thrift.IThriftMessage = input.readMessageBegin();
                if (fieldName === "peg") {
                    if (messageType === thrift.MessageType.EXCEPTION) {
                        const err: thrift.TApplicationException = thrift.TApplicationExceptionCodec.decode(input);
                        input.readMessageEnd();
                        return Promise.reject(err);
                    }
                    else {
                        const result: IPeg__Result = Peg__ResultCodec.decode(input);
                        input.readMessageEnd();
                        if (result.success != null) {
                            return Promise.resolve(result.success);
                        }
                        else {
                            return Promise.reject(new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, "peg failed: unknown result"));
                        }
                    }
                }
                else {
                    return Promise.reject(new thrift.TApplicationException(thrift.TApplicationExceptionType.WRONG_METHOD_NAME, "Received a response to an unknown RPC function: " + fieldName));
                }
            }
            catch (err) {
                return Promise.reject(err);
            }
        });
    }
    public pong(code?: ICodeArgs, context?: Context): Promise<thrift.Int64> {
        const writer: thrift.TTransport = new this.transport();
        const output: thrift.TProtocol = new this.protocol(writer);
        output.writeMessageBegin("pong", thrift.MessageType.CALL, this.incrementRequestId());
        const args: IPong__ArgsArgs = { code };
        Pong__ArgsCodec.encode(args, output);
        output.writeMessageEnd();
        return this.connection.send(writer.flush(), context).then((data: Buffer) => {
            const reader: thrift.TTransport = this.transport.receiver(data);
            const input: thrift.TProtocol = new this.protocol(reader);
            try {
                const { fieldName: fieldName, messageType: messageType }: thrift.IThriftMessage = input.readMessageBegin();
                if (fieldName === "pong") {
                    if (messageType === thrift.MessageType.EXCEPTION) {
                        const err: thrift.TApplicationException = thrift.TApplicationExceptionCodec.decode(input);
                        input.readMessageEnd();
                        return Promise.reject(err);
                    }
                    else {
                        const result: IPong__Result = Pong__ResultCodec.decode(input);
                        input.readMessageEnd();
                        if (result.success != null) {
                            return Promise.resolve(result.success);
                        }
                        else {
                            return Promise.reject(new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, "pong failed: unknown result"));
                        }
                    }
                }
                else {
                    return Promise.reject(new thrift.TApplicationException(thrift.TApplicationExceptionType.WRONG_METHOD_NAME, "Received a response to an unknown RPC function: " + fieldName));
                }
            }
            catch (err) {
                return Promise.reject(err);
            }
        });
    }
}
export interface IHandler<Context = any> {
    peg(name: string, context?: Context): string | Promise<string>;
    pong(code?: ICode, context?: Context): (number | string | thrift.Int64) | Promise<number | string | thrift.Int64>;
}
export class Processor<Context = any> extends thrift.ThriftProcessor<Context, IHandler<Context>> {
    protected readonly _handler: IHandler<Context>;
    public static readonly serviceName: string = serviceName;
    public static readonly annotations: thrift.IThriftAnnotations = annotations;
    public static readonly methodAnnotations: thrift.IMethodAnnotations = methodAnnotations;
    public static readonly methodNames: Array<string> = methodNames;
    public readonly _serviceName: string = serviceName;
    public readonly _annotations: thrift.IThriftAnnotations = annotations;
    public readonly _methodAnnotations: thrift.IMethodAnnotations = methodAnnotations;
    public readonly _methodNames: Array<string> = methodNames;
    constructor(handler: IHandler<Context>) {
        super();
        this._handler = handler;
    }
    public process(input: thrift.TProtocol, output: thrift.TProtocol, context: Context): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject): void => {
            const metadata: thrift.IThriftMessage = input.readMessageBegin();
            const fieldName: string = metadata.fieldName;
            const requestId: number = metadata.requestId;
            const methodName: string = "process_" + fieldName;
            switch (methodName) {
                case "process_peg": {
                    resolve(this.process_peg(requestId, input, output, context));
                    break;
                }
                case "process_pong": {
                    resolve(this.process_pong(requestId, input, output, context));
                    break;
                }
                default: {
                    input.skip(thrift.TType.STRUCT);
                    input.readMessageEnd();
                    const errMessage = "Unknown function " + fieldName;
                    const err = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN_METHOD, errMessage);
                    output.writeMessageBegin(fieldName, thrift.MessageType.EXCEPTION, requestId);
                    thrift.TApplicationExceptionCodec.encode(err, output);
                    output.writeMessageEnd();
                    resolve(output.flush());
                    break;
                }
            }
        });
    }
    public process_peg(requestId: number, input: thrift.TProtocol, output: thrift.TProtocol, context: Context): Promise<Buffer> {
        return new Promise<string>((resolve, reject): void => {
            try {
                const args: IPeg__Args = Peg__ArgsCodec.decode(input);
                input.readMessageEnd();
                resolve(this._handler.peg(args.name, context));
            }
            catch (err) {
                reject(err);
            }
        }).then((data: string): Buffer => {
            const result: IPeg__ResultArgs = { success: data };
            output.writeMessageBegin("peg", thrift.MessageType.REPLY, requestId);
            Peg__ResultCodec.encode(result, output);
            output.writeMessageEnd();
            return output.flush();
        }).catch((err: Error): Buffer => {
            const result: thrift.TApplicationException = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, err.message);
            output.writeMessageBegin("peg", thrift.MessageType.EXCEPTION, requestId);
            thrift.TApplicationExceptionCodec.encode(result, output);
            output.writeMessageEnd();
            return output.flush();
        });
    }
    public process_pong(requestId: number, input: thrift.TProtocol, output: thrift.TProtocol, context: Context): Promise<Buffer> {
        return new Promise<number | string | thrift.Int64>((resolve, reject): void => {
            try {
                const args: IPong__Args = Pong__ArgsCodec.decode(input);
                input.readMessageEnd();
                resolve(this._handler.pong(args.code, context));
            }
            catch (err) {
                reject(err);
            }
        }).then((data: number | string | thrift.Int64): Buffer => {
            const result: IPong__ResultArgs = { success: data };
            output.writeMessageBegin("pong", thrift.MessageType.REPLY, requestId);
            Pong__ResultCodec.encode(result, output);
            output.writeMessageEnd();
            return output.flush();
        }).catch((err: Error): Buffer => {
            const result: thrift.TApplicationException = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, err.message);
            output.writeMessageBegin("pong", thrift.MessageType.EXCEPTION, requestId);
            thrift.TApplicationExceptionCodec.encode(result, output);
            output.writeMessageEnd();
            return output.flush();
        });
    }
}
