export interface IServiceException {
    message?: string;
}
export interface IServiceExceptionArgs {
    message?: string;
}
export const ServiceExceptionCodec: thrift.IStructCodec<IServiceExceptionArgs, IServiceException> = {
    encode(args: IServiceExceptionArgs, output: thrift.TProtocol): void {
        const obj = {
            message: args.message
        };
        output.writeStructBegin("ServiceException");
        if (obj.message != null) {
            output.writeFieldBegin("message", thrift.TType.STRING, 1);
            output.writeString(obj.message);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): IServiceException {
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
        return {
            message: _args.message
        };
    }
};
export class ServiceException extends thrift.StructLike implements IServiceException {
    public message?: string;
    public readonly _annotations: thrift.IThriftAnnotations = {};
    public readonly _fieldAnnotations: thrift.IFieldAnnotations = {};
    constructor(args: IServiceExceptionArgs = {}) {
        super();
        if (args.message != null) {
            const value_2: string = args.message;
            this.message = value_2;
        }
    }
    public static read(input: thrift.TProtocol): ServiceException {
        return new ServiceException(ServiceExceptionCodec.decode(input));
    }
    public static write(args: IServiceExceptionArgs, output: thrift.TProtocol): void {
        return ServiceExceptionCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return ServiceExceptionCodec.encode(this, output);
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
    name?: string;
}
export interface IPong__ArgsArgs {
    name?: string;
}
export const Pong__ArgsCodec: thrift.IStructCodec<IPong__ArgsArgs, IPong__Args> = {
    encode(args: IPong__ArgsArgs, output: thrift.TProtocol): void {
        const obj = {
            name: args.name
        };
        output.writeStructBegin("Pong__Args");
        if (obj.name != null) {
            output.writeFieldBegin("name", thrift.TType.STRING, 1);
            output.writeString(obj.name);
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
                    if (fieldType === thrift.TType.STRING) {
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
        return {
            name: _args.name
        };
    }
};
export class Pong__Args extends thrift.StructLike implements IPong__Args {
    public name?: string;
    public readonly _annotations: thrift.IThriftAnnotations = {};
    public readonly _fieldAnnotations: thrift.IFieldAnnotations = {};
    constructor(args: IPong__ArgsArgs = {}) {
        super();
        if (args.name != null) {
            const value_6: string = args.name;
            this.name = value_6;
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
    exp?: IServiceException;
}
export interface IPeg__ResultArgs {
    success?: string;
    exp?: IServiceExceptionArgs;
}
export const Peg__ResultCodec: thrift.IStructCodec<IPeg__ResultArgs, IPeg__Result> = {
    encode(args: IPeg__ResultArgs, output: thrift.TProtocol): void {
        const obj = {
            success: args.success,
            exp: args.exp
        };
        output.writeStructBegin("Peg__Result");
        if (obj.success != null) {
            output.writeFieldBegin("success", thrift.TType.STRING, 0);
            output.writeString(obj.success);
            output.writeFieldEnd();
        }
        if (obj.exp != null) {
            output.writeFieldBegin("exp", thrift.TType.STRUCT, 1);
            ServiceExceptionCodec.encode(obj.exp, output);
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
                case 1:
                    if (fieldType === thrift.TType.STRUCT) {
                        const value_8: IServiceException = ServiceExceptionCodec.decode(input);
                        _args.exp = value_8;
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
            success: _args.success,
            exp: _args.exp
        };
    }
};
export class Peg__Result extends thrift.StructLike implements IPeg__Result {
    public success?: string;
    public exp?: IServiceException;
    public readonly _annotations: thrift.IThriftAnnotations = {};
    public readonly _fieldAnnotations: thrift.IFieldAnnotations = {};
    constructor(args: IPeg__ResultArgs = {}) {
        super();
        if (args.success != null) {
            const value_9: string = args.success;
            this.success = value_9;
        }
        if (args.exp != null) {
            const value_10: IServiceException = new ServiceException(args.exp);
            this.exp = value_10;
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
    success?: string;
}
export interface IPong__ResultArgs {
    success?: string;
}
export const Pong__ResultCodec: thrift.IStructCodec<IPong__ResultArgs, IPong__Result> = {
    encode(args: IPong__ResultArgs, output: thrift.TProtocol): void {
        const obj = {
            success: args.success
        };
        output.writeStructBegin("Pong__Result");
        if (obj.success != null) {
            output.writeFieldBegin("success", thrift.TType.STRING, 0);
            output.writeString(obj.success);
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
                    if (fieldType === thrift.TType.STRING) {
                        const value_11: string = input.readString();
                        _args.success = value_11;
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
    public success?: string;
    public readonly _annotations: thrift.IThriftAnnotations = {};
    public readonly _fieldAnnotations: thrift.IFieldAnnotations = {};
    constructor(args: IPong__ResultArgs = {}) {
        super();
        if (args.success != null) {
            const value_12: string = args.success;
            this.success = value_12;
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
                        if (result.exp != null) {
                            return Promise.reject(result.exp);
                        }
                        else if (result.success != null) {
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
    public pong(name?: string, context?: Context): Promise<string> {
        const writer: thrift.TTransport = new this.transport();
        const output: thrift.TProtocol = new this.protocol(writer);
        output.writeMessageBegin("pong", thrift.MessageType.CALL, this.incrementRequestId());
        const args: IPong__ArgsArgs = { name };
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
    pong(name?: string, context?: Context): string | Promise<string>;
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
            if (err instanceof ServiceException) {
                const result: IPeg__ResultArgs = { exp: err };
                output.writeMessageBegin("peg", thrift.MessageType.REPLY, requestId);
                Peg__ResultCodec.encode(result, output);
                output.writeMessageEnd();
                return output.flush();
            }
            else {
                const result: thrift.TApplicationException = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, err.message);
                output.writeMessageBegin("peg", thrift.MessageType.EXCEPTION, requestId);
                thrift.TApplicationExceptionCodec.encode(result, output);
                output.writeMessageEnd();
                return output.flush();
            }
        });
    }
    public process_pong(requestId: number, input: thrift.TProtocol, output: thrift.TProtocol, context: Context): Promise<Buffer> {
        return new Promise<string>((resolve, reject): void => {
            try {
                const args: IPong__Args = Pong__ArgsCodec.decode(input);
                input.readMessageEnd();
                resolve(this._handler.pong(args.name, context));
            }
            catch (err) {
                reject(err);
            }
        }).then((data: string): Buffer => {
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
