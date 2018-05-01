export interface IMyStruct {
}
export interface IMyStruct_Loose {
}
export class MyStruct extends thrift.IStructLike  implements IMyStruct_Loose {
    constructor(args: IMyStruct_Loose = {}) {
        super();
    }
    public static write(args: IMyStruct_Loose, output: thrift.TProtocol): void {
        output.writeStructBegin("MyStruct");
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
    public static read(input: thrift.TProtocol): IMyStruct {
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
        return {};
    }
}
