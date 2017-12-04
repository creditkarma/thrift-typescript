export interface IMyStructArgs {
}
export class MyStruct implements thrift.StructLike {
    constructor(args?: IMyStructArgs) {
        if (args != null) {
        }
    }
    public write(output: thrift.TProtocol): void {
        output.writeStructBegin("MyStruct");
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
    public static read(input: thrift.TProtocol): MyStruct {
        input.readStructBegin();
        let _args: any = {};
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
        return new MyStruct(_args);
    }
}
