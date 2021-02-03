import * as ts from 'typescript'

export * from '../shared/identifiers'

export const THRIFT_IDENTIFIERS = {
    ThriftClient: ts.createIdentifier('thrift.ThriftClient'),
    ThriftProcessor: ts.createIdentifier('thrift.ThriftProcessor'),
    IThriftAnnotations: ts.createIdentifier('thrift.IThriftAnnotations'),
    IFieldAnnotations: ts.createIdentifier('thrift.IFieldAnnotations'),
    IMethodAnnotations: ts.createIdentifier('thrift.IMethodAnnotations'),
    IStructCodec: ts.createIdentifier('thrift.IStructCodec'),
    IStructToolkit: ts.createIdentifier('thrift.IStructToolkit'),
    IThriftConnection: ts.createIdentifier('thrift.IThriftConnection'),
    ProtocolConstructor: ts.createIdentifier('thrift.IProtocolConstructor'),
    TransportConstructor: ts.createIdentifier('thrift.ITransportConstructor'),
    IThriftMessage: ts.createIdentifier('thrift.IThriftMessage'),
    IThriftField: ts.createIdentifier('thrift.IThriftField'),
    IThriftMap: ts.createIdentifier('thrift.IThriftMap'),
    IThriftSet: ts.createIdentifier('thrift.IThriftSet'),
    IThriftList: ts.createIdentifier('thrift.IThriftList'),
    TProtocol: ts.createIdentifier('thrift.TProtocol'),
    TTransport: ts.createIdentifier('thrift.TTransport'),
    CallbackMap: ts.createIdentifier('thrift.IRequestCallbackMap'),
    Thrift_Type: ts.createIdentifier('thrift.TType'),
    Int64: ts.createIdentifier('thrift.Int64'),
    MessageType: ts.createIdentifier('thrift.MessageType'),
    TApplicationException: ts.createIdentifier('thrift.TApplicationException'),
    TApplicationExceptionCodec: ts.createIdentifier(
        'thrift.TApplicationExceptionCodec',
    ),
    TProtocolException: ts.createIdentifier('thrift.TProtocolException'),
    InputBufferUnderrunError: ts.createIdentifier(
        'thrift.InputBufferUnderrunError',
    ),
    StructLike: ts.createIdentifier('thrift.StructLike'),
    ErrorStructLike: ts.createIdentifier('thrift.ErrorStructLike'),
}

export const THRIFT_TYPES = {
    STRUCT: ts.createIdentifier('thrift.TType.STRUCT'),
    SET: ts.createIdentifier('thrift.TType.SET'),
    MAP: ts.createIdentifier('thrift.TType.MAP'),
    LIST: ts.createIdentifier('thrift.TType.LIST'),
    STRING: ts.createIdentifier('thrift.TType.STRING'),
    BOOL: ts.createIdentifier('thrift.TType.BOOL'),
    DOUBLE: ts.createIdentifier('thrift.TType.DOUBLE'),
    BYTE: ts.createIdentifier('thrift.TType.BYTE'),
    I16: ts.createIdentifier('thrift.TType.I16'),
    I32: ts.createIdentifier('thrift.TType.I32'),
    I64: ts.createIdentifier('thrift.TType.I64'),
    VOID: ts.createIdentifier('thrift.TType.VOID'),
    STOP: ts.createIdentifier('thrift.TType.STOP'),
}

export const MESSAGE_TYPE = {
    CALL: ts.createIdentifier('thrift.MessageType.CALL'),
    EXCEPTION: ts.createIdentifier('thrift.MessageType.EXCEPTION'),
    REPLY: ts.createIdentifier('thrift.MessageType.REPLY'),
}

export const PROTOCOL_EXCEPTION = {
    UNKNOWN: ts.createIdentifier('thrift.TProtocolExceptionType.UNKNOWN'),
    INVALID_DATA: ts.createIdentifier(
        'thrift.TProtocolExceptionType.INVALID_DATA',
    ),
    NEGATIVE_SIZE: ts.createIdentifier(
        'thrift.TProtocolExceptionType.NEGATIVE_SIZE',
    ),
    SIZE_LIMIT: ts.createIdentifier('thrift.TProtocolExceptionType.SIZE_LIMIT'),
    BAD_VERSION: ts.createIdentifier(
        'thrift.TProtocolExceptionType.BAD_VERSION',
    ),
    NOT_IMPLEMENTED: ts.createIdentifier(
        'thrift.TProtocolExceptionType.NOT_IMPLEMENTED',
    ),
    DEPTH_LIMIT: ts.createIdentifier(
        'thrift.TProtocolExceptionType.DEPTH_LIMIT',
    ),
}

export const APPLICATION_EXCEPTION = {
    UNKNOWN: ts.createIdentifier('thrift.TApplicationExceptionType.UNKNOWN'),
    UNKNOWN_METHOD: ts.createIdentifier(
        'thrift.TApplicationExceptionType.UNKNOWN_METHOD',
    ),
    INVALID_MESSAGE_TYPE: ts.createIdentifier(
        'thrift.TApplicationExceptionType.INVALID_MESSAGE_TYPE',
    ),
    WRONG_METHOD_NAME: ts.createIdentifier(
        'thrift.TApplicationExceptionType.WRONG_METHOD_NAME',
    ),
    BAD_SEQUENCE_ID: ts.createIdentifier(
        'thrift.TApplicationExceptionType.BAD_SEQUENCE_ID',
    ),
    MISSING_RESULT: ts.createIdentifier(
        'thrift.TApplicationExceptionType.MISSING_RESULT',
    ),
    INTERNAL_ERROR: ts.createIdentifier(
        'thrift.TApplicationExceptionType.INTERNAL_ERROR',
    ),
    PROTOCOL_ERROR: ts.createIdentifier(
        'thrift.TApplicationExceptionType.PROTOCOL_ERROR',
    ),
    INVALID_TRANSFORM: ts.createIdentifier(
        'thrift.TApplicationExceptionType.INVALID_TRANSFORM',
    ),
    INVALID_PROTOCOL: ts.createIdentifier(
        'thrift.TApplicationExceptionType.INVALID_PROTOCOL',
    ),
    UNSUPPORTED_CLIENT_TYPE: ts.createIdentifier(
        'thrift.TApplicationExceptionType.UNSUPPORTED_CLIENT_TYPE',
    ),
}
