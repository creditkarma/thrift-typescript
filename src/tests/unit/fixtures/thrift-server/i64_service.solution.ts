export interface ICode {
    __name: "Code";
    status?: bigint;
}
export interface ICodeArgs {
    status?: number | string | bigint;
}
export const CodeCodec: thrift.IStructCodec<ICodeArgs, ICode> = {
    encode(args: ICodeArgs, output: thrift.TProtocol): void {
        const obj = {
            status: (typeof args.status === "number" ? BigInt(args.status) : typeof args.status === "string" ? BigInt(args.status) : args.status)
        };
        output.writeStructBegin("Code");
        if (obj.status != null) {
            output.writeFieldBegin("status", thrift.TType.I64, 1);
            output.writeI64((typeof obj.status === "number" ? BigInt(obj.status) : typeof obj.status === "string" ? BigInt(obj.status) : obj.status));
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
                        const value_1: bigint = input.readI64();
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
            __name: "Code",
            status: _args.status
        };
    }
};
export class Code implements thrift.IStructLike, ICode {
    public status?: bigint;
    public readonly __name = "Code";
    constructor(args: ICodeArgs = {}) {
        if (args.status != null) {
            const value_2: bigint = (typeof args.status === "number" ? BigInt(args.status) : typeof args.status === "string" ? BigInt(args.status) : args.status);
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
                    name: "code",
                    fieldId: 1,
                    annotations: {},
                    definitionType: {
                        type: thrift.DefinitionMetadataType.StructType,
                        name: "Code",
                        annotations: {},
                        fields: {
                            status: {
                                name: "status",
                                fieldId: 1,
                                annotations: {},
                                definitionType: {
                                    type: thrift.DefinitionMetadataType.BaseType
                                }
                            }
                        }
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
            __name: "Pong__Args",
            code: _args.code
        };
    }
};
export class Pong__Args implements thrift.IStructLike, IPong__Args {
    public code?: ICode;
    public readonly __name = "Pong__Args";
    constructor(args: IPong__ArgsArgs = {}) {
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
    __name: "Peg__Result";
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
            __name: "Peg__Result",
            success: _args.success
        };
    }
};
export class Peg__Result implements thrift.IStructLike, IPeg__Result {
    public success?: string;
    public readonly __name = "Peg__Result";
    constructor(args: IPeg__ResultArgs = {}) {
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
    __name: "Pong__Result";
    success?: bigint;
}
export interface IPong__ResultArgs {
    success?: number | string | bigint;
}
export const Pong__ResultCodec: thrift.IStructCodec<IPong__ResultArgs, IPong__Result> = {
    encode(args: IPong__ResultArgs, output: thrift.TProtocol): void {
        const obj = {
            success: (typeof args.success === "number" ? BigInt(args.success) : typeof args.success === "string" ? BigInt(args.success) : args.success)
        };
        output.writeStructBegin("Pong__Result");
        if (obj.success != null) {
            output.writeFieldBegin("success", thrift.TType.I64, 0);
            output.writeI64((typeof obj.success === "number" ? BigInt(obj.success) : typeof obj.success === "string" ? BigInt(obj.success) : obj.success));
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
                        const value_9: bigint = input.readI64();
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
            __name: "Pong__Result",
            success: _args.success
        };
    }
};
export class Pong__Result implements thrift.IStructLike, IPong__Result {
    public success?: bigint;
    public readonly __name = "Pong__Result";
    constructor(args: IPong__ResultArgs = {}) {
        if (args.success != null) {
            const value_10: bigint = (typeof args.success === "number" ? BigInt(args.success) : typeof args.success === "string" ? BigInt(args.success) : args.success);
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
        const writer: thrift.TTransport = new this.transport();
        const output: thrift.TProtocol = new this.protocol(writer);
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
    public pong(code?: ICodeArgs, context?: Context): Promise<bigint> {
        const writer: thrift.TTransport = new this.transport();
        const output: thrift.TProtocol = new this.protocol(writer);
        output.writeMessageBegin("pong", thrift.MessageType.CALL, this.incrementRequestId());
        const args: IPong__ArgsArgs = { code };
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
    pong(code: ICode | undefined, context: thrift.ThriftContext<Context>): (number | string | bigint) | Promise<number | string | bigint>;
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
            return this.writeError("peg", requestId, err);
        });
    }
    private process_pong(args: IPong__Args, requestId: number, context: thrift.ThriftContext<Context>): Promise<Buffer> {
        return new Promise<number | string | bigint>((resolve, reject): void => {
            try {
                resolve(this.handler.pong(args.code, context));
            }
            catch (err) {
                reject(err);
            }
        }).then((data: number | string | bigint): Buffer => {
            return this.writeResponse("pong", data, requestId);
        }).catch((err: Error): Buffer => {
            return this.writeError("pong", requestId, err);
        });
    }
}
