/* tslint:disable */
/*
 * Autogenerated by @creditkarma/thrift-typescript v{{VERSION}}
 * DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
*/
import * as thrift from "test-lib";
export const SHARED_INT: number = 45;
export interface ICode {
    status?: thrift.Int64;
}
export interface ICodeArgs {
    status?: number | thrift.Int64;
}
export const CodeCodec: thrift.IStructCodec<ICodeArgs, ICode> = {
    encode(args: ICodeArgs, output: thrift.TProtocol): void {
        const obj = {
            status: (typeof args.status === "number" ? new thrift.Int64(args.status) : args.status)
        };
        output.writeStructBegin("Code");
        if (obj.status != null) {
            output.writeFieldBegin("status", thrift.TType.I64, 1);
            output.writeI64(obj.status);
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
            const value_2: thrift.Int64 = (typeof args.status === "number" ? new thrift.Int64(args.status) : args.status);
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
export interface ISharedStruct {
    code: ICode;
    value: string;
}
export interface ISharedStructArgs {
    code: ICodeArgs;
    value: string;
}
export const SharedStructCodec: thrift.IStructCodec<ISharedStructArgs, ISharedStruct> = {
    encode(args: ISharedStructArgs, output: thrift.TProtocol): void {
        const obj = {
            code: args.code,
            value: args.value
        };
        output.writeStructBegin("SharedStruct");
        if (obj.code != null) {
            output.writeFieldBegin("code", thrift.TType.STRUCT, 1);
            CodeCodec.encode(obj.code, output);
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[code] is unset!");
        }
        if (obj.value != null) {
            output.writeFieldBegin("value", thrift.TType.STRING, 2);
            output.writeString(obj.value);
            output.writeFieldEnd();
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[value] is unset!");
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): ISharedStruct {
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
                        const value_3: ICode = CodeCodec.decode(input);
                        _args.code = value_3;
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.STRING) {
                        const value_4: string = input.readString();
                        _args.value = value_4;
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
        if (_args.code !== undefined && _args.value !== undefined) {
            return {
                code: _args.code,
                value: _args.value
            };
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read SharedStruct from input");
        }
    }
};
export class SharedStruct extends thrift.StructLike implements ISharedStruct {
    public code: ICode;
    public value: string;
    public readonly _annotations: thrift.IThriftAnnotations = {};
    public readonly _fieldAnnotations: thrift.IFieldAnnotations = {};
    constructor(args: ISharedStructArgs) {
        super();
        if (args.code != null) {
            const value_5: ICode = new Code(args.code);
            this.code = value_5;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[code] is unset!");
        }
        if (args.value != null) {
            const value_6: string = args.value;
            this.value = value_6;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[value] is unset!");
        }
    }
    public static read(input: thrift.TProtocol): SharedStruct {
        return new SharedStruct(SharedStructCodec.decode(input));
    }
    public static write(args: ISharedStructArgs, output: thrift.TProtocol): void {
        return SharedStructCodec.encode(args, output);
    }
    public write(output: thrift.TProtocol): void {
        return SharedStructCodec.encode(this, output);
    }
}
export enum SharedUnionType {
    SharedUnionWithOption1 = "option1",
    SharedUnionWithOption2 = "option2"
}
export type SharedUnion = ISharedUnionWithOption1 | ISharedUnionWithOption2;
export interface ISharedUnionWithOption1 {
    __type: SharedUnionType.SharedUnionWithOption1;
    option1: string;
    option2?: void;
}
export interface ISharedUnionWithOption2 {
    __type: SharedUnionType.SharedUnionWithOption2;
    option1?: void;
    option2: string;
}
export type SharedUnionArgs = ISharedUnionWithOption1Args | ISharedUnionWithOption2Args;
export interface ISharedUnionWithOption1Args {
    option1: string;
    option2?: void;
}
export interface ISharedUnionWithOption2Args {
    option1?: void;
    option2: string;
}
export const SharedUnionCodec: thrift.IStructToolkit<SharedUnionArgs, SharedUnion> = {
    create(args: SharedUnionArgs): SharedUnion {
        let _fieldsSet: number = 0;
        let _returnValue: any = null;
        if (args.option1 != null) {
            _fieldsSet++;
            const value_7: string = args.option1;
            _returnValue = { option1: value_7 };
        }
        if (args.option2 != null) {
            _fieldsSet++;
            const value_8: string = args.option2;
            _returnValue = { option2: value_8 };
        }
        if (_fieldsSet > 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion cannot have more than one value");
        }
        else if (_fieldsSet < 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "TUnion must have one value set");
        }
        if (_returnValue !== null) {
            if (_returnValue.option1) {
                return {
                    __type: SharedUnionType.SharedUnionWithOption1,
                    option1: _returnValue.option1
                };
            }
            else {
                return {
                    __type: SharedUnionType.SharedUnionWithOption2,
                    option2: _returnValue.option2
                };
            }
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read data for TUnion");
        }
    },
    encode(args: SharedUnionArgs, output: thrift.TProtocol): void {
        let _fieldsSet: number = 0;
        const obj = {
            option1: args.option1,
            option2: args.option2
        };
        output.writeStructBegin("SharedUnion");
        if (obj.option1 != null) {
            _fieldsSet++;
            output.writeFieldBegin("option1", thrift.TType.STRING, 1);
            output.writeString(obj.option1);
            output.writeFieldEnd();
        }
        if (obj.option2 != null) {
            _fieldsSet++;
            output.writeFieldBegin("option2", thrift.TType.STRING, 2);
            output.writeString(obj.option2);
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
    decode(input: thrift.TProtocol): SharedUnion {
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
                    if (fieldType === thrift.TType.STRING) {
                        _fieldsSet++;
                        const value_9: string = input.readString();
                        _returnValue = { option1: value_9 };
                    }
                    else {
                        input.skip(fieldType);
                    }
                    break;
                case 2:
                    if (fieldType === thrift.TType.STRING) {
                        _fieldsSet++;
                        const value_10: string = input.readString();
                        _returnValue = { option2: value_10 };
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
            if (_returnValue.option1) {
                return {
                    __type: SharedUnionType.SharedUnionWithOption1,
                    option1: _returnValue.option1
                };
            }
            else {
                return {
                    __type: SharedUnionType.SharedUnionWithOption2,
                    option2: _returnValue.option2
                };
            }
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read data for TUnion");
        }
    }
};
export namespace SharedService {
    export const serviceName: string = "SharedService";
    export const annotations: thrift.IThriftAnnotations = {};
    export const methodAnnotations: thrift.IMethodAnnotations = {
        getStruct: {
            annotations: {},
            fieldAnnotations: {}
        },
        getUnion: {
            annotations: {},
            fieldAnnotations: {}
        }
    };
    export const methodNames: Array<string> = ["getStruct", "getUnion"];
    export interface IGetStruct__Args {
        key: number;
    }
    export interface IGetStruct__ArgsArgs {
        key: number;
    }
    export const GetStruct__ArgsCodec: thrift.IStructCodec<IGetStruct__ArgsArgs, IGetStruct__Args> = {
        encode(args: IGetStruct__ArgsArgs, output: thrift.TProtocol): void {
            const obj = {
                key: args.key
            };
            output.writeStructBegin("GetStruct__Args");
            if (obj.key != null) {
                output.writeFieldBegin("key", thrift.TType.I32, 1);
                output.writeI32(obj.key);
                output.writeFieldEnd();
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[key] is unset!");
            }
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        },
        decode(input: thrift.TProtocol): IGetStruct__Args {
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
                        if (fieldType === thrift.TType.I32) {
                            const value_11: number = input.readI32();
                            _args.key = value_11;
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
            if (_args.key !== undefined) {
                return {
                    key: _args.key
                };
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read GetStruct__Args from input");
            }
        }
    };
    export class GetStruct__Args extends thrift.StructLike implements IGetStruct__Args {
        public key: number;
        public readonly _annotations: thrift.IThriftAnnotations = {};
        public readonly _fieldAnnotations: thrift.IFieldAnnotations = {};
        constructor(args: IGetStruct__ArgsArgs) {
            super();
            if (args.key != null) {
                const value_12: number = args.key;
                this.key = value_12;
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[key] is unset!");
            }
        }
        public static read(input: thrift.TProtocol): GetStruct__Args {
            return new GetStruct__Args(GetStruct__ArgsCodec.decode(input));
        }
        public static write(args: IGetStruct__ArgsArgs, output: thrift.TProtocol): void {
            return GetStruct__ArgsCodec.encode(args, output);
        }
        public write(output: thrift.TProtocol): void {
            return GetStruct__ArgsCodec.encode(this, output);
        }
    }
    export interface IGetUnion__Args {
        index: number;
    }
    export interface IGetUnion__ArgsArgs {
        index: number;
    }
    export const GetUnion__ArgsCodec: thrift.IStructCodec<IGetUnion__ArgsArgs, IGetUnion__Args> = {
        encode(args: IGetUnion__ArgsArgs, output: thrift.TProtocol): void {
            const obj = {
                index: args.index
            };
            output.writeStructBegin("GetUnion__Args");
            if (obj.index != null) {
                output.writeFieldBegin("index", thrift.TType.I32, 1);
                output.writeI32(obj.index);
                output.writeFieldEnd();
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[index] is unset!");
            }
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        },
        decode(input: thrift.TProtocol): IGetUnion__Args {
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
                        if (fieldType === thrift.TType.I32) {
                            const value_13: number = input.readI32();
                            _args.index = value_13;
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
            if (_args.index !== undefined) {
                return {
                    index: _args.index
                };
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read GetUnion__Args from input");
            }
        }
    };
    export class GetUnion__Args extends thrift.StructLike implements IGetUnion__Args {
        public index: number;
        public readonly _annotations: thrift.IThriftAnnotations = {};
        public readonly _fieldAnnotations: thrift.IFieldAnnotations = {};
        constructor(args: IGetUnion__ArgsArgs) {
            super();
            if (args.index != null) {
                const value_14: number = args.index;
                this.index = value_14;
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field[index] is unset!");
            }
        }
        public static read(input: thrift.TProtocol): GetUnion__Args {
            return new GetUnion__Args(GetUnion__ArgsCodec.decode(input));
        }
        public static write(args: IGetUnion__ArgsArgs, output: thrift.TProtocol): void {
            return GetUnion__ArgsCodec.encode(args, output);
        }
        public write(output: thrift.TProtocol): void {
            return GetUnion__ArgsCodec.encode(this, output);
        }
    }
    export interface IGetStruct__Result {
        success?: ISharedStruct;
    }
    export interface IGetStruct__ResultArgs {
        success?: ISharedStructArgs;
    }
    export const GetStruct__ResultCodec: thrift.IStructCodec<IGetStruct__ResultArgs, IGetStruct__Result> = {
        encode(args: IGetStruct__ResultArgs, output: thrift.TProtocol): void {
            const obj = {
                success: args.success
            };
            output.writeStructBegin("GetStruct__Result");
            if (obj.success != null) {
                output.writeFieldBegin("success", thrift.TType.STRUCT, 0);
                SharedStructCodec.encode(obj.success, output);
                output.writeFieldEnd();
            }
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        },
        decode(input: thrift.TProtocol): IGetStruct__Result {
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
                        if (fieldType === thrift.TType.STRUCT) {
                            const value_15: ISharedStruct = SharedStructCodec.decode(input);
                            _args.success = value_15;
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
    export class GetStruct__Result extends thrift.StructLike implements IGetStruct__Result {
        public success?: ISharedStruct;
        public readonly _annotations: thrift.IThriftAnnotations = {};
        public readonly _fieldAnnotations: thrift.IFieldAnnotations = {};
        constructor(args: IGetStruct__ResultArgs = {}) {
            super();
            if (args.success != null) {
                const value_16: ISharedStruct = new SharedStruct(args.success);
                this.success = value_16;
            }
        }
        public static read(input: thrift.TProtocol): GetStruct__Result {
            return new GetStruct__Result(GetStruct__ResultCodec.decode(input));
        }
        public static write(args: IGetStruct__ResultArgs, output: thrift.TProtocol): void {
            return GetStruct__ResultCodec.encode(args, output);
        }
        public write(output: thrift.TProtocol): void {
            return GetStruct__ResultCodec.encode(this, output);
        }
    }
    export interface IGetUnion__Result {
        success?: SharedUnion;
    }
    export interface IGetUnion__ResultArgs {
        success?: SharedUnionArgs;
    }
    export const GetUnion__ResultCodec: thrift.IStructCodec<IGetUnion__ResultArgs, IGetUnion__Result> = {
        encode(args: IGetUnion__ResultArgs, output: thrift.TProtocol): void {
            const obj = {
                success: args.success
            };
            output.writeStructBegin("GetUnion__Result");
            if (obj.success != null) {
                output.writeFieldBegin("success", thrift.TType.STRUCT, 0);
                SharedUnionCodec.encode(obj.success, output);
                output.writeFieldEnd();
            }
            output.writeFieldStop();
            output.writeStructEnd();
            return;
        },
        decode(input: thrift.TProtocol): IGetUnion__Result {
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
                        if (fieldType === thrift.TType.STRUCT) {
                            const value_17: SharedUnion = SharedUnionCodec.decode(input);
                            _args.success = value_17;
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
    export class GetUnion__Result extends thrift.StructLike implements IGetUnion__Result {
        public success?: SharedUnion;
        public readonly _annotations: thrift.IThriftAnnotations = {};
        public readonly _fieldAnnotations: thrift.IFieldAnnotations = {};
        constructor(args: IGetUnion__ResultArgs = {}) {
            super();
            if (args.success != null) {
                const value_18: SharedUnion = SharedUnionCodec.create(args.success);
                this.success = value_18;
            }
        }
        public static read(input: thrift.TProtocol): GetUnion__Result {
            return new GetUnion__Result(GetUnion__ResultCodec.decode(input));
        }
        public static write(args: IGetUnion__ResultArgs, output: thrift.TProtocol): void {
            return GetUnion__ResultCodec.encode(args, output);
        }
        public write(output: thrift.TProtocol): void {
            return GetUnion__ResultCodec.encode(this, output);
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
        public getStruct(key: number, context?: Context): Promise<ISharedStruct> {
            const writer: thrift.TTransport = new this.transport();
            const output: thrift.TProtocol = new this.protocol(writer);
            output.writeMessageBegin("getStruct", thrift.MessageType.CALL, this.incrementRequestId());
            const args: IGetStruct__ArgsArgs = { key };
            GetStruct__ArgsCodec.encode(args, output);
            output.writeMessageEnd();
            return this.connection.send(writer.flush(), context).then((data: Buffer) => {
                const reader: thrift.TTransport = this.transport.receiver(data);
                const input: thrift.TProtocol = new this.protocol(reader);
                try {
                    const { fieldName: fieldName, messageType: messageType }: thrift.IThriftMessage = input.readMessageBegin();
                    if (fieldName === "getStruct") {
                        if (messageType === thrift.MessageType.EXCEPTION) {
                            const err: thrift.TApplicationException = thrift.TApplicationExceptionCodec.decode(input);
                            input.readMessageEnd();
                            return Promise.reject(err);
                        }
                        else {
                            const result: IGetStruct__Result = GetStruct__ResultCodec.decode(input);
                            input.readMessageEnd();
                            if (result.success != null) {
                                return Promise.resolve(result.success);
                            }
                            else {
                                return Promise.reject(new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, "getStruct failed: unknown result"));
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
        public getUnion(index: number, context?: Context): Promise<SharedUnion> {
            const writer: thrift.TTransport = new this.transport();
            const output: thrift.TProtocol = new this.protocol(writer);
            output.writeMessageBegin("getUnion", thrift.MessageType.CALL, this.incrementRequestId());
            const args: IGetUnion__ArgsArgs = { index };
            GetUnion__ArgsCodec.encode(args, output);
            output.writeMessageEnd();
            return this.connection.send(writer.flush(), context).then((data: Buffer) => {
                const reader: thrift.TTransport = this.transport.receiver(data);
                const input: thrift.TProtocol = new this.protocol(reader);
                try {
                    const { fieldName: fieldName, messageType: messageType }: thrift.IThriftMessage = input.readMessageBegin();
                    if (fieldName === "getUnion") {
                        if (messageType === thrift.MessageType.EXCEPTION) {
                            const err: thrift.TApplicationException = thrift.TApplicationExceptionCodec.decode(input);
                            input.readMessageEnd();
                            return Promise.reject(err);
                        }
                        else {
                            const result: IGetUnion__Result = GetUnion__ResultCodec.decode(input);
                            input.readMessageEnd();
                            if (result.success != null) {
                                return Promise.resolve(result.success);
                            }
                            else {
                                return Promise.reject(new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, "getUnion failed: unknown result"));
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
        getStruct(key: number, context?: Context): ISharedStruct | Promise<ISharedStruct>;
        getUnion(index: number, context?: Context): SharedUnion | Promise<SharedUnion>;
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
                    case "process_getStruct": {
                        resolve(this.process_getStruct(requestId, input, output, context));
                        break;
                    }
                    case "process_getUnion": {
                        resolve(this.process_getUnion(requestId, input, output, context));
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
        public process_getStruct(requestId: number, input: thrift.TProtocol, output: thrift.TProtocol, context: Context): Promise<Buffer> {
            return new Promise<ISharedStruct>((resolve, reject): void => {
                try {
                    const args: IGetStruct__Args = GetStruct__ArgsCodec.decode(input);
                    input.readMessageEnd();
                    resolve(this._handler.getStruct(args.key, context));
                }
                catch (err) {
                    reject(err);
                }
            }).then((data: ISharedStruct): Buffer => {
                const result: IGetStruct__Result = { success: data };
                output.writeMessageBegin("getStruct", thrift.MessageType.REPLY, requestId);
                GetStruct__ResultCodec.encode(result, output);
                output.writeMessageEnd();
                return output.flush();
            }).catch((err: Error): Buffer => {
                const result: thrift.TApplicationException = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, err.message);
                output.writeMessageBegin("getStruct", thrift.MessageType.EXCEPTION, requestId);
                thrift.TApplicationExceptionCodec.encode(result, output);
                output.writeMessageEnd();
                return output.flush();
            });
        }
        public process_getUnion(requestId: number, input: thrift.TProtocol, output: thrift.TProtocol, context: Context): Promise<Buffer> {
            return new Promise<SharedUnion>((resolve, reject): void => {
                try {
                    const args: IGetUnion__Args = GetUnion__ArgsCodec.decode(input);
                    input.readMessageEnd();
                    resolve(this._handler.getUnion(args.index, context));
                }
                catch (err) {
                    reject(err);
                }
            }).then((data: SharedUnion): Buffer => {
                const result: IGetUnion__Result = { success: data };
                output.writeMessageBegin("getUnion", thrift.MessageType.REPLY, requestId);
                GetUnion__ResultCodec.encode(result, output);
                output.writeMessageEnd();
                return output.flush();
            }).catch((err: Error): Buffer => {
                const result: thrift.TApplicationException = new thrift.TApplicationException(thrift.TApplicationExceptionType.UNKNOWN, err.message);
                output.writeMessageBegin("getUnion", thrift.MessageType.EXCEPTION, requestId);
                thrift.TApplicationExceptionCodec.encode(result, output);
                output.writeMessageEnd();
                return output.flush();
            });
        }
    }
}
