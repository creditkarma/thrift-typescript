export enum MyUnionType {
    MyUnionWithField1 = "field1",
    MyUnionWithField2 = "field2"
}
export type MyUnion = IMyUnionWithField1 | IMyUnionWithField2;
export interface IMyUnionWithField1 {
    __name: "MyUnion";
    __type: MyUnionType.MyUnionWithField1;
    field1: number;
    field2?: undefined;
}
export interface IMyUnionWithField2 {
    __name: "MyUnion";
    __type: MyUnionType.MyUnionWithField2;
    field1?: undefined;
    field2: thrift.Int64;
}
export type MyUnionArgs = IMyUnionWithField1Args | IMyUnionWithField2Args;
export interface IMyUnionWithField1Args {
    field1: number;
    field2?: undefined;
}
export interface IMyUnionWithField2Args {
    field1?: undefined;
    field2: number | string | thrift.Int64;
}
export const MyUnionCodec: thrift.IStructToolkit<MyUnionArgs, MyUnion> = {
    create(args: MyUnionArgs): MyUnion {
        let _fieldsSet: number = 0;
        let _returnValue: any = null;
        if (args.field1 != null) {
            _fieldsSet++;
            const value_1: number = args.field1;
            _returnValue = { field1: value_1 };
        }
        if (args.field2 != null) {
            _fieldsSet++;
            const value_2: thrift.Int64 = (typeof args.field2 === "number" ? new thrift.Int64(args.field2) : typeof args.field2 === "string" ? thrift.Int64.fromDecimalString(args.field2) : args.field2);
            _returnValue = { field2: value_2 };
        }
        if (_fieldsSet > 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion cannot have more than one value");
        }
        else if (_fieldsSet < 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion must have one value set");
        }
        if (_returnValue !== null) {
            if (_returnValue.field1 !== undefined) {
                return {
                    __name: "MyUnion",
                    __type: MyUnionType.MyUnionWithField1,
                    field1: _returnValue.field1
                };
            }
            else {
                return {
                    __name: "MyUnion",
                    __type: MyUnionType.MyUnionWithField2,
                    field2: _returnValue.field2
                };
            }
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read data for TUnion");
        }
    },
    encode(args: MyUnionArgs, output: thrift.TProtocol): void {
        let _fieldsSet: number = 0;
        const obj = {
            field1: args.field1,
            field2: (typeof args.field2 === "number" ? new thrift.Int64(args.field2) : typeof args.field2 === "string" ? thrift.Int64.fromDecimalString(args.field2) : args.field2)
        };
        output.writeStructBegin("MyUnion");
        if (obj.field1 != null) {
            _fieldsSet++;
            output.writeFieldBegin("field1", thrift.TType.I32, 1);
            output.writeI32(obj.field1);
            output.writeFieldEnd();
        }
        if (obj.field2 != null) {
            _fieldsSet++;
            output.writeFieldBegin("field2", thrift.TType.I64, 2);
            output.writeI64((typeof obj.field2 === "number" ? new thrift.Int64(obj.field2) : typeof obj.field2 === "string" ? thrift.Int64.fromDecimalString(obj.field2) : obj.field2));
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        if (_fieldsSet > 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion cannot have more than one value");
        }
        else if (_fieldsSet < 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion must have one value set");
        }
        return;
    },
    decode(input: thrift.TProtocol): MyUnion {
        let _fieldsSet: number = 0;
        let _returnValue: any = null;
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
                    if (fieldType === thrift.TType.I32) {
                        _fieldsSet++;
                        const value_3: number = input.readI32();
                        _returnValue = { __name: "MyUnion", field1: value_3 };
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.I64) {
                        _fieldsSet++;
                        const value_4: thrift.Int64 = input.readI64();
                        _returnValue = { __name: "MyUnion", field2: value_4 };
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
        if (_fieldsSet > 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion cannot have more than one value");
        }
        else if (_fieldsSet < 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion must have one value set");
        }
        if (_returnValue !== null) {
            if (_returnValue.field1 !== undefined) {
                return {
                    __name: "MyUnion",
                    __type: MyUnionType.MyUnionWithField1,
                    field1: _returnValue.field1
                };
            }
            else {
                return {
                    __name: "MyUnion",
                    __type: MyUnionType.MyUnionWithField2,
                    field2: _returnValue.field2
                };
            }
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read data for TUnion");
        }
    }
};
export const serviceName: string = "MyService";
export const annotations: thrift.IThriftAnnotations = {};
export const methodAnnotations: thrift.IMethodAnnotations = {
    getUser: {
        annotations: {},
        fieldAnnotations: {}
    },
    ping: {
        annotations: {},
        fieldAnnotations: {}
    }
};
export const methodNames: Array<string> = ["getUser", "ping"];
export interface IGetUser__Args {
    __name: "GetUser__Args";
    arg1: MyUnion;
}
export interface IGetUser__ArgsArgs {
    arg1: MyUnionArgs;
}
export const GetUser__ArgsCodec: thrift.IStructCodec<IGetUser__ArgsArgs, IGetUser__Args> = {
    encode(args: IGetUser__ArgsArgs, output: thrift.TProtocol): void {
        const obj = {
            arg1: args.arg1
        };
        output.writeStructBegin("GetUser__Args");
        if (obj.arg1 != null) {
            output.writeFieldBegin("arg1", thrift.TType.STRUCT, 1);
            MyUnionCodec.encode(obj.arg1, output);
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[arg1] is unset!");
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): IGetUser__Args {
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
                        const value_5: MyUnion = MyUnionCodec.decode(input);
                        _args.arg1 = value_5;
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
        if (_args.arg1 !== undefined) {
            return {
                __name: "GetUser__Args",
                arg1: _args.arg1
            };
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read GetUser__Args from input");
        }
    }
};
export class GetUser__Args extends thrift.StructLike implements IGetUser__Args {
    public arg1: MyUnion;
    public readonly __name = "GetUser__Args";
    public readonly _annotations: thrift.IThriftAnnotations = {};
    public readonly _fieldAnnotations: thrift.IFieldAnnotations = {};
    constructor(args: IGetUser__ArgsArgs) {
        super();
        if (args.arg1 != null) {
            const value_6: MyUnion = MyUnionCodec.create(args.arg1);
            this.arg1 = value_6;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[arg1] is unset!");
        }
    }
    public static read(input: thrift.TProtocol): GetUser__Args {
        return new GetUser__Args(GetUser__ArgsCodec.decode(input));
    }
    public static write(args: IGetUser__ArgsArgs, output: thrift.TProtocol): void {
        return GetUser__ArgsCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return GetUser__ArgsCodec.encode(this, output);
    }
}
export interface IPing__Args {
    __name: "Ping__Args";
}
export interface IPing__ArgsArgs {
}
export const Ping__ArgsCodec: thrift.IStructCodec<IPing__ArgsArgs, IPing__Args> = {
    encode(args: IPing__ArgsArgs, output: thrift.TProtocol): void {
        output.writeStructBegin("Ping__Args");
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): IPing__Args {
        input.readStructBegin();
        while (true) {
            const ret: thrift.IThriftField = input.readFieldBegin();
            const fieldType: thrift.TType = ret.fieldType;
            const fieldId: number = ret.fieldId;
            if (fieldType === thrift.TType.STOP) {
                break;
            }
            switch (fieldId) {
                default: {
                    input.skip(fieldType);
                }
            }
            input.readFieldEnd();
        }
        input.readStructEnd();
        return {
            __name: "Ping__Args"
        };
    }
};
export class Ping__Args extends thrift.StructLike implements IPing__Args {
    public readonly __name = "Ping__Args";
    public readonly _annotations: thrift.IThriftAnnotations = {};
    public readonly _fieldAnnotations: thrift.IFieldAnnotations = {};
    constructor(args: IPing__ArgsArgs = {}) {
        super();
    }
    public static read(input: thrift.TProtocol): Ping__Args {
        return new Ping__Args(Ping__ArgsCodec.decode(input));
    }
    public static write(args: IPing__ArgsArgs, output: thrift.TProtocol): void {
        return Ping__ArgsCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return Ping__ArgsCodec.encode(this, output);
    }
}
export interface IGetUser__Result {
    __name: "GetUser__Result";
    success?: string;
}
export interface IGetUser__ResultArgs {
    success?: string;
}
export const GetUser__ResultCodec: thrift.IStructCodec<IGetUser__ResultArgs, IGetUser__Result> = {
    encode(args: IGetUser__ResultArgs, output: thrift.TProtocol): void {
        const obj = {
            success: args.success
        };
        output.writeStructBegin("GetUser__Result");
        if (obj.success != null) {
            output.writeFieldBegin("success", thrift.TType.STRING, 0);
            output.writeString(obj.success);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): IGetUser__Result {
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
            __name: "GetUser__Result",
            success: _args.success
        };
    }
};
export class GetUser__Result extends thrift.StructLike implements IGetUser__Result {
    public success?: string;
    public readonly __name = "GetUser__Result";
    public readonly _annotations: thrift.IThriftAnnotations = {};
    public readonly _fieldAnnotations: thrift.IFieldAnnotations = {};
    constructor(args: IGetUser__ResultArgs = {}) {
        super();
        if (args.success != null) {
            const value_8: string = args.success;
            this.success = value_8;
        }
    }
    public static read(input: thrift.TProtocol): GetUser__Result {
        return new GetUser__Result(GetUser__ResultCodec.decode(input));
    }
    public static write(args: IGetUser__ResultArgs, output: thrift.TProtocol): void {
        return GetUser__ResultCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return GetUser__ResultCodec.encode(this, output);
    }
}
export interface IPing__Result {
    __name: "Ping__Result";
    success?: void;
}
export interface IPing__ResultArgs {
    success?: void;
}
export const Ping__ResultCodec: thrift.IStructCodec<IPing__ResultArgs, IPing__Result> = {
    encode(args: IPing__ResultArgs, output: thrift.TProtocol): void {
        output.writeStructBegin("Ping__Result");
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): IPing__Result {
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
                    if (fieldType === thrift.TType.VOID) {
                        input.skip(fieldType);
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
            __name: "Ping__Result",
            success: _args.success
        };
    }
};
export class Ping__Result extends thrift.StructLike implements IPing__Result {
    public success?: void;
    public readonly __name = "Ping__Result";
    public readonly _annotations: thrift.IThriftAnnotations = {};
    public readonly _fieldAnnotations: thrift.IFieldAnnotations = {};
    constructor(args: IPing__ResultArgs = {}) {
        super();
        if (args.success != null) {
            const value_9: void = undefined;
            this.success = value_9;
        }
    }
    public static read(input: thrift.TProtocol): Ping__Result {
        return new Ping__Result(Ping__ResultCodec.decode(input));
    }
    public static write(args: IPing__ResultArgs, output: thrift.TProtocol): void {
        return Ping__ResultCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return Ping__ResultCodec.encode(this, output);
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
    public getUser(arg1: MyUnionArgs, context?: Context): Promise<string> {
        const writer: thrift.TTransport = new this.transport();
        const output: thrift.TProtocol = new this.protocol(writer);
        output.writeMessageBegin("getUser", thrift.MessageType.CALL, this.incrementRequestId());
        const args: IGetUser__ArgsArgs = { arg1 };
        GetUser__ArgsCodec.encode(args, output);
        output.writeMessageEnd();
        return this.connection.send(writer.flush(), context).then((data: Buffer) => {
            const reader: thrift.TTransport = this.transport.receiver(data);
            const input: thrift.TProtocol = new this.protocol(reader);
            try {
                const { fieldName: fieldName, messageType: messageType }: thrift.IThriftMessage = input.readMessageBegin();
                if (fieldName === "getUser") {
                    if (messageType === thrift.MessageType.EXCEPTION) {
                        const err: thrift.TApplicationException = thrift.TApplicationExceptionCodec.decode(input);
                        input.readMessageEnd();
                        return Promise.reject(err);
                    }
                    else {
                        const result: IGetUser__Result = GetUser__ResultCodec.decode(input);
                        input.readMessageEnd();
                        if (result.success != null) {
                            return Promise.resolve(result.success);
                        }
                        else {
                            return Promise.reject(new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, "getUser failed: unknown result"));
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
    public ping(context?: Context): Promise<void> {
        const writer: thrift.TTransport = new this.transport();
        const output: thrift.TProtocol = new this.protocol(writer);
        output.writeMessageBegin("ping", thrift.MessageType.CALL, this.incrementRequestId());
        const args: IPing__ArgsArgs = {};
        Ping__ArgsCodec.encode(args, output);
        output.writeMessageEnd();
        return this.connection.send(writer.flush(), context).then((data: Buffer) => {
            const reader: thrift.TTransport = this.transport.receiver(data);
            const input: thrift.TProtocol = new this.protocol(reader);
            try {
                const { fieldName: fieldName, messageType: messageType }: thrift.IThriftMessage = input.readMessageBegin();
                if (fieldName === "ping") {
                    if (messageType === thrift.MessageType.EXCEPTION) {
                        const err: thrift.TApplicationException = thrift.TApplicationExceptionCodec.decode(input);
                        input.readMessageEnd();
                        return Promise.reject(err);
                    }
                    else {
                        const result: IPing__Result = Ping__ResultCodec.decode(input);
                        input.readMessageEnd();
                        return Promise.resolve(result.success);
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
    getUser(arg1: MyUnion, context?: Context): string | Promise<string>;
    ping(context?: Context): void | Promise<void>;
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
                case "process_getUser": {
                    resolve(this.process_getUser(requestId, input, output, context));
                    break;
                }
                case "process_ping": {
                    resolve(this.process_ping(requestId, input, output, context));
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
    public process_getUser(requestId: number, input: thrift.TProtocol, output: thrift.TProtocol, context: Context): Promise<Buffer> {
        return new Promise<string>((resolve, reject): void => {
            try {
                const args: IGetUser__Args = GetUser__ArgsCodec.decode(input);
                input.readMessageEnd();
                resolve(this._handler.getUser(args.arg1, context));
            }
            catch (err) {
                reject(err);
            }
        }).then((data: string): Buffer => {
            const result: IGetUser__ResultArgs = { success: data };
            output.writeMessageBegin("getUser", thrift.MessageType.REPLY, requestId);
            GetUser__ResultCodec.encode(result, output);
            output.writeMessageEnd();
            return output.flush();
        }).catch((err: Error): Buffer => {
            const result: thrift.TApplicationException = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, err.message);
            output.writeMessageBegin("getUser", thrift.MessageType.EXCEPTION, requestId);
            thrift.TApplicationExceptionCodec.encode(result, output);
            output.writeMessageEnd();
            return output.flush();
        });
    }
    public process_ping(requestId: number, input: thrift.TProtocol, output: thrift.TProtocol, context: Context): Promise<Buffer> {
        return new Promise<void>((resolve, reject): void => {
            try {
                input.readMessageEnd();
                resolve(this._handler.ping(context));
            }
            catch (err) {
                reject(err);
            }
        }).then((data: void): Buffer => {
            const result: IPing__ResultArgs = { success: data };
            output.writeMessageBegin("ping", thrift.MessageType.REPLY, requestId);
            Ping__ResultCodec.encode(result, output);
            output.writeMessageEnd();
            return output.flush();
        }).catch((err: Error): Buffer => {
            const result: thrift.TApplicationException = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, err.message);
            output.writeMessageBegin("ping", thrift.MessageType.EXCEPTION, requestId);
            thrift.TApplicationExceptionCodec.encode(result, output);
            output.writeMessageEnd();
            return output.flush();
        });
    }
}
