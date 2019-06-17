export interface IServiceException {
    __name: "ServiceException";
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
            __name: "ServiceException",
            message: _args.message
        };
    }
};
export class ServiceException implements thrift.IStructLike, IServiceException {
    public message?: string;
    public readonly __name = "ServiceException";
    constructor(args: IServiceExceptionArgs = {}) {
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
export const metadata: thrift.IServiceMetadata = {
    name: "MyService",
    annotations: {},
    methods: {
        peg: {
            name: "peg",
            annotations: {},
            arguments: [
                {
                    name: "name",
                    fieldId: 1,
                    annotations: {},
                    definitionType: {
                        type: thrift.DefinitionMetadataType.BaseType
                    }
                }
            ]
        },
        pong: {
            name: "pong",
            annotations: {},
            arguments: [
                {
                    name: "name",
                    fieldId: 1,
                    annotations: {},
                    definitionType: {
                        type: thrift.DefinitionMetadataType.BaseType
                    }
                }
            ]
        }
    }
};
export interface IPeg__Args {
    __name: "Peg__Args";
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
                __name: "Peg__Args",
                name: _args.name
            };
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read Peg__Args from input");
        }
    }
};
export class Peg__Args implements thrift.IStructLike, IPeg__Args {
    public name: string;
    public readonly __name = "Peg__Args";
    constructor(args: IPeg__ArgsArgs) {
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
    __name: "Pong__Args";
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
            __name: "Pong__Args",
            name: _args.name
        };
    }
};
export class Pong__Args implements thrift.IStructLike, IPong__Args {
    public name?: string;
    public readonly __name = "Pong__Args";
    constructor(args: IPong__ArgsArgs = {}) {
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
    __name: "Peg__Result";
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
            __name: "Peg__Result",
            success: _args.success,
            exp: _args.exp
        };
    }
};
export class Peg__Result implements thrift.IStructLike, IPeg__Result {
    public success?: string;
    public exp?: IServiceException;
    public readonly __name = "Peg__Result";
    constructor(args: IPeg__ResultArgs = {}) {
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
    __name: "Pong__Result";
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
            __name: "Pong__Result",
            success: _args.success
        };
    }
};
export class Pong__Result implements thrift.IStructLike, IPong__Result {
    public success?: string;
    public readonly __name = "Pong__Result";
    constructor(args: IPong__ResultArgs = {}) {
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
export class Client<Context extends thrift.IRequestContext = thrift.IRequestContext> implements thrift.IThriftClient {
    public static readonly metadata: thrift.IServiceMetadata = metadata;
    public readonly __metadata: thrift.IServiceMetadata = metadata;
    protected _requestId: number;
    protected Transport: thrift.ITransportConstructor;
    protected Protocol: thrift.IProtocolConstructor;
    protected connection: thrift.IThriftConnection<Context>;
    constructor(connection: thrift.IThriftConnection<Context>) {
        this._requestId = 0;
        this.Transport = connection.Transport;
        this.Protocol = connection.Protocol;
        this.connection = connection;
    }
    protected incrementRequestId(): number {
        return this._requestId += 1;
    }
    public peg(name: string, context?: Context): Promise<string> {
        const writer: thrift.TTransport = new this.Transport();
        const output: thrift.TProtocol = new this.Protocol(writer);
        output.writeMessageBegin("peg", thrift.MessageType.CALL, this.incrementRequestId());
        const args: IPeg__ArgsArgs = { name };
        Peg__ArgsCodec.encode(args, output);
        output.writeMessageEnd();
        return this.connection.send(writer.flush(), context).then((data: Buffer) => {
            const reader: thrift.TTransport = this.Transport.receiver(data);
            const input: thrift.TProtocol = new this.Protocol(reader);
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
        const writer: thrift.TTransport = new this.Transport();
        const output: thrift.TProtocol = new this.Protocol(writer);
        output.writeMessageBegin("pong", thrift.MessageType.CALL, this.incrementRequestId());
        const args: IPong__ArgsArgs = { name };
        Pong__ArgsCodec.encode(args, output);
        output.writeMessageEnd();
        return this.connection.send(writer.flush(), context).then((data: Buffer) => {
            const reader: thrift.TTransport = this.Transport.receiver(data);
            const input: thrift.TProtocol = new this.Protocol(reader);
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
export interface IHandler<Context extends object = {}> {
    peg(name: string, context: thrift.ThriftContext<Context>): string | Promise<string>;
    pong(name: string | undefined, context: thrift.ThriftContext<Context>): string | Promise<string>;
}
export type ReadRequestData = {
    methodName: "peg";
    requestId: number;
    data: IPeg__Args;
} | {
    methodName: "pong";
    requestId: number;
    data: IPong__Args;
};
export class Processor<Context extends object = {}> implements thrift.IThriftProcessor<Context> {
    protected readonly handler: IHandler<Context>;
    public static readonly metadata: thrift.IServiceMetadata = metadata;
    public readonly __metadata: thrift.IServiceMetadata = metadata;
    public readonly Transport: thrift.ITransportConstructor;
    public readonly Protocol: thrift.IProtocolConstructor;
    constructor(handler: IHandler<Context>, Transport: thrift.ITransportConstructor = thrift.BufferedTransport, Protocol: thrift.IProtocolConstructor = thrift.BinaryProtocol) {
        this.handler = handler;
        this.Transport = Transport;
        this.Protocol = Protocol;
    }
    public process(data: Buffer, context: thrift.ThriftContext<Context>): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject): void => {
            const metadata: ReadRequestData = this.readRequest(data);
            switch (metadata.methodName) {
                case "peg": {
                    resolve(this.process_peg(metadata.data, metadata.requestId, context));
                    break;
                }
                case "pong": {
                    resolve(this.process_pong(metadata.data, metadata.requestId, context));
                    break;
                }
                default: {
                    const failed: any = metadata;
                    const errMessage: string = "Unknown function " + failed.methodName;
                    const err: Error = new Error(errMessage);
                    resolve(this.writeError(failed.methodName, failed.requestId, err));
                    break;
                }
            }
        });
    }
    public readRequest(data: Buffer): ReadRequestData {
        const transportWithData: thrift.TTransport = this.Transport.receiver(data);
        const input: thrift.TProtocol = new this.Protocol(transportWithData);
        const metadata: thrift.IThriftMessage = input.readMessageBegin();
        const fieldName: string = metadata.fieldName;
        const requestId: number = metadata.requestId;
        switch (fieldName) {
            case "peg": {
                const data: IPeg__Args = Peg__ArgsCodec.decode(input);
                input.readMessageEnd();
                return {
                    methodName: fieldName,
                    requestId: requestId,
                    data: data
                };
            }
            case "pong": {
                const data: IPong__Args = Pong__ArgsCodec.decode(input);
                input.readMessageEnd();
                return {
                    methodName: fieldName,
                    requestId: requestId,
                    data: data
                };
            }
            default: {
                input.skip(thrift.TType.STRUCT);
                input.readMessageEnd();
                throw new Error("Unable to read request for unknown function " + fieldName);
            }
        }
    }
    public writeResponse(methodName: string, data: any, requestId: number): Buffer {
        const output: thrift.TProtocol = new this.Protocol(new this.Transport());
        switch (methodName) {
            case "peg": {
                const result: IPeg__ResultArgs = { success: data };
                output.writeMessageBegin("peg", thrift.MessageType.REPLY, requestId);
                Peg__ResultCodec.encode(result, output);
                output.writeMessageEnd();
                return output.flush();
            }
            case "pong": {
                const result: IPong__ResultArgs = { success: data };
                output.writeMessageBegin("pong", thrift.MessageType.REPLY, requestId);
                Pong__ResultCodec.encode(result, output);
                output.writeMessageEnd();
                return output.flush();
            }
            default: {
                throw new Error("Unable to write response for unknown function " + methodName);
            }
        }
    }
    public writeError(methodName: string, requestId: number, err: Error): Buffer {
        const output: thrift.TProtocol = new this.Protocol(new this.Transport());
        const result: thrift.TApplicationException = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, err.message);
        output.writeMessageBegin(methodName, thrift.MessageType.EXCEPTION, requestId);
        thrift.TApplicationExceptionCodec.encode(result, output);
        output.writeMessageEnd();
        return output.flush();
    }
    private process_peg(args: IPeg__Args, requestId: number, context: thrift.ThriftContext<Context>): Promise<Buffer> {
        return new Promise<string>((resolve, reject): void => {
            try {
                resolve(this.handler.peg(args.name, context));
            }
            catch (err) {
                reject(err);
            }
        }).then((data: string): Buffer => {
            return this.writeResponse("peg", data, requestId);
        }).catch((err: Error): Buffer => {
            if (err instanceof ServiceException) {
                const output: thrift.TProtocol = new this.Protocol(new this.Transport());
                const result: IPeg__ResultArgs = { exp: err };
                output.writeMessageBegin("peg", thrift.MessageType.REPLY, requestId);
                Peg__ResultCodec.encode(result, output);
                output.writeMessageEnd();
                return output.flush();
            }
            else {
                return this.writeError("peg", requestId, err);
            }
        });
    }
    private process_pong(args: IPong__Args, requestId: number, context: thrift.ThriftContext<Context>): Promise<Buffer> {
        return new Promise<string>((resolve, reject): void => {
            try {
                resolve(this.handler.pong(args.name, context));
            }
            catch (err) {
                reject(err);
            }
        }).then((data: string): Buffer => {
            return this.writeResponse("pong", data, requestId);
        }).catch((err: Error): Buffer => {
            return this.writeError("pong", requestId, err);
        });
    }
}
