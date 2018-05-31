export interface IMyStruct {
}
export interface IMyStruct_Loose {
}
export const MyStructCodec: thrift.IStructCodec<IMyStruct_Loose, IMyStruct> = {
    encode(args: IMyStruct_Loose, output: thrift.TProtocol): void {
        output.writeStructBegin("MyStruct");
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    },
    decode(input: thrift.TProtocol): IMyStruct {
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
};
export class MyStruct extends thrift.StructLike implements IMyStruct {
    constructor(args: IMyStruct_Loose = {}) {
        super();
    }
    public static read(input: thrift.TProtocol): MyStruct {
        return new MyStruct(MyStructCodec.decode(input));
    }
    public write(output: thrift.TProtocol): void {
        return MyStructCodec.encode(this, output);
    }
}
