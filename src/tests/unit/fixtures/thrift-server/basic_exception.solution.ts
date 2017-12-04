export interface IMyExceptionArgs {
    message: string;
}
export class MyException implements thrift.IStructLike {
    public message: string;
    constructor(args?: IMyExceptionArgs) {
        if (args != null) {
            if (args.message != null) {
                this.message = args.message;
            }
            else {
                throw new thrift.TProtocolException(thrift.TProtocolExceptionType.UNKNOWN, "Required field message is unset!");
            }
        }
    }
    public write(output: thrift.TProtocol): void {
        output.writeStructBegin("MyException");
        if (this.message != null) {
            output.writeFieldBegin("message", thrift.TType.STRING, 1);
            output.writeString(this.message);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
    public read(input: thrift.TProtocol): void {
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
                        this.message = value_1;
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
        return;
    }
}
