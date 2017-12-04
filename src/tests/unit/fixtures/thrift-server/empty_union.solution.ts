export interface IMyUnionArgs {
}
export class MyUnion implements thrift.StructLike {
    constructor(args?: IMyUnionArgs) {
        let _fieldsSet: number = 0;
        if (args != null) {
            if (_fieldsSet > 1) {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with more than one set value!");
            }
            else if (_fieldsSet < 1) {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with no set value!");
            }
        }
    }
    public write(output: thrift.TProtocol): void {
        output.writeStructBegin("MyUnion");
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
    public static read(input: thrift.TProtocol): MyUnion {
        let _fieldsSet: number = 0;
        let _returnValue: MyUnion | null = null;
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
        if (_fieldsSet > 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with more than one set value!");
        }
        else if (_fieldsSet < 1) {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with no set value!");
        }
        if (_returnValue !== null) {
            return _returnValue;
        }
        else {
            throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Unable to read data for TUnion");
        }
    }
}
