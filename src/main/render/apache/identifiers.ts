import * as ts from 'typescript'

export * from '../shared/identifiers'

export const THRIFT_IDENTIFIERS = {
    TMessage: ts.createIdentifier('thrift.TMessage'),
    TField: ts.createIdentifier('thrift.TField'),
    TMap: ts.createIdentifier('thrift.TMap'),
    TSet: ts.createIdentifier('thrift.TSet'),
    TList: ts.createIdentifier('thrift.TList'),
    TProtocol: ts.createIdentifier('thrift.TProtocol'),
    TTransport: ts.createIdentifier('thrift.TTransport'),
    Thrift: ts.createIdentifier('thrift.Thrift'),
    Thrift_Type: ts.createIdentifier('thrift.Thrift.Type'),
    MessageType: ts.createIdentifier('thrift.Thrift.MessageType'),
    TApplicationException: ts.createIdentifier(
        'thrift.Thrift.TApplicationException',
    ),
    TProtocolException: ts.createIdentifier('thrift.Thrift.TProtocolException'),
    TStructLike: ts.createIdentifier('thrift.TStructLike'),
}

export const THRIFT_TYPES = {
    STRUCT: ts.createIdentifier('thrift.Thrift.Type.STRUCT'),
    SET: ts.createIdentifier('thrift.Thrift.Type.SET'),
    MAP: ts.createIdentifier('thrift.Thrift.Type.MAP'),
    LIST: ts.createIdentifier('thrift.Thrift.Type.LIST'),
    STRING: ts.createIdentifier('thrift.Thrift.Type.STRING'),
    BOOL: ts.createIdentifier('thrift.Thrift.Type.BOOL'),
    DOUBLE: ts.createIdentifier('thrift.Thrift.Type.DOUBLE'),
    BYTE: ts.createIdentifier('thrift.Thrift.Type.BYTE'),
    I16: ts.createIdentifier('thrift.Thrift.Type.I16'),
    I32: ts.createIdentifier('thrift.Thrift.Type.I32'),
    I64: ts.createIdentifier('thrift.Thrift.Type.I64'),
    VOID: ts.createIdentifier('thrift.Thrift.Type.VOID'),
    STOP: ts.createIdentifier('thrift.Thrift.Type.STOP'),
}

export const MESSAGE_TYPE = {
    CALL: ts.createIdentifier('thrift.Thrift.MessageType.CALL'),
    EXCEPTION: ts.createIdentifier('thrift.Thrift.MessageType.EXCEPTION'),
    REPLY: ts.createIdentifier('thrift.Thrift.MessageType.REPLY'),
}

export const PROTOCOL_EXCEPTION = {
    UNKNOWN: ts.createIdentifier(
        'thrift.Thrift.TProtocolExceptionType.UNKNOWN',
    ),
    INVALID_DATA: ts.createIdentifier(
        'thrift.Thrift.TProtocolExceptionType.INVALID_DATA',
    ),
    NEGATIVE_SIZE: ts.createIdentifier(
        'thrift.Thrift.TProtocolExceptionType.NEGATIVE_SIZE',
    ),
    SIZE_LIMIT: ts.createIdentifier(
        'thrift.Thrift.TProtocolExceptionType.SIZE_LIMIT',
    ),
    BAD_VERSION: ts.createIdentifier(
        'thrift.Thrift.TProtocolExceptionType.BAD_VERSION',
    ),
    NOT_IMPLEMENTED: ts.createIdentifier(
        'thrift.Thrift.TProtocolExceptionType.NOT_IMPLEMENTED',
    ),
    DEPTH_LIMIT: ts.createIdentifier(
        'thrift.Thrift.TProtocolExceptionType.DEPTH_LIMIT',
    ),
}

export const APPLICATION_EXCEPTION = {
    UNKNOWN: ts.createIdentifier(
        'thrift.Thrift.TApplicationExceptionType.UNKNOWN',
    ),
    UNKNOWN_METHOD: ts.createIdentifier(
        'thrift.Thrift.TApplicationExceptionType.UNKNOWN_METHOD',
    ),
    INVALID_MESSAGE_TYPE: ts.createIdentifier(
        'thrift.Thrift.TApplicationExceptionType.INVALID_MESSAGE_TYPE',
    ),
    WRONG_METHOD_NAME: ts.createIdentifier(
        'thrift.Thrift.TApplicationExceptionType.WRONG_METHOD_NAME',
    ),
    BAD_SEQUENCE_ID: ts.createIdentifier(
        'thrift.Thrift.TApplicationExceptionType.BAD_SEQUENCE_ID',
    ),
    MISSING_RESULT: ts.createIdentifier(
        'thrift.Thrift.TApplicationExceptionType.MISSING_RESULT',
    ),
    INTERNAL_ERROR: ts.createIdentifier(
        'thrift.Thrift.TApplicationExceptionType.INTERNAL_ERROR',
    ),
    PROTOCOL_ERROR: ts.createIdentifier(
        'thrift.Thrift.TApplicationExceptionType.PROTOCOL_ERROR',
    ),
    INVALID_TRANSFORM: ts.createIdentifier(
        'thrift.Thrift.TApplicationExceptionType.INVALID_TRANSFORM',
    ),
    INVALID_PROTOCOL: ts.createIdentifier(
        'thrift.Thrift.TApplicationExceptionType.INVALID_PROTOCOL',
    ),
    UNSUPPORTED_CLIENT_TYPE: ts.createIdentifier(
        'thrift.Thrift.TApplicationExceptionType.UNSUPPORTED_CLIENT_TYPE',
    ),
}
