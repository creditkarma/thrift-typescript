import { assert } from 'chai'
import { make } from './index'

describe('Thrift TypeScript Generator', () => {

  it('should correctly generate a const', () => {
    const content: string = `
      const bool FALSE_CONST = false
      //const set<string> SET_CONST = ['hello', 'world', 'foo', 'bar']
      const map<string,string> MAP_CONST = {'hello': 'world', 'foo': 'bar' }
    `;
    const actual: string = make(content)
    const expected: string =
`export const FALSE_CONST: boolean = false;
export const MAP_CONST: Map<string, string> = new Map([["hello", "world"], ["foo", "bar"]]);
`
    assert.equal(actual, expected)
  })

  it('should correctly generate a type alias', () => {
    const content: string = `
      typedef string name
    `;
    const expected: string = `export type name = string;\n`;
    const actual: string = make(content)

    assert.equal(actual, expected)
  })

  it('should correctly generate an enum', () => {
    const content: string = `
      enum MyEnum {
        ONE,
        TWO,
        THREE
      }
    `;
    const expected: string =
`export enum MyEnum {
    ONE,
    TWO,
    THREE
}
`;
    const actual: string = make(content)
    assert.equal(actual, expected)
  })

  it('should correctly generate an enum with member initializer', () => {
    const content: string = `
      enum MyEnum {
        ONE = 5,
        TWO = 3,
        THREE = 6
      }
    `;
    const expected: string =
`export enum MyEnum {
    ONE = 5,
    TWO = 3,
    THREE = 6
}
`;
    const actual: string = make(content)
    assert.equal(actual, expected)
  })

  it('should correctly generate a struct', () => {
    const content: string = `
      struct MyStruct {
          1: required i32 id
          2: required string word
          3: optional double field1
      }
    `;
    const expected: string =
`export interface IMyStruct {
    id: number;
    word: string;
    field1?: number;
}
export class MyStruct {
    public id: number = null;
    public word: string = null;
    public field1?: number = null;
    constructor(args?: IMyStruct) {
        if (args != null) {
            if (args.id != null) {
                this.id = args.id;
            }
            else {
                throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, "Required field id is unset!");
            }
            if (args.word != null) {
                this.word = args.word;
            }
            else {
                throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, "Required field word is unset!");
            }
            if (args.field1 != null) {
                this.field1 = args.field1;
            }
        }
    }
    public write(output: TProtocol): void {
        output.writeStructBegin("MyStruct");
        if (this.id != null) {
            output.writeFieldBegin("id", Thrift.Type.I32, 1);
            output.writeI32(this.id);
            output.writeFieldEnd();
        }
        if (this.word != null) {
            output.writeFieldBegin("word", Thrift.Type.STRING, 2);
            output.writeString(this.word);
            output.writeFieldEnd();
        }
        if (this.field1 != null) {
            output.writeFieldBegin("field1", Thrift.Type.DOUBLE, 3);
            output.writeDouble(this.field1);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
    }
    public read(input: TProtocol): void {
        input.readStructBegin();
        while (true) {
            const ret: {
                fname: string;
                ftype: Thrift.Type;
                fid: number;
            } = input.readFieldBegin();
            const fname: string = ret.fname;
            const ftype: Thrift.Type = ret.ftype;
            const fid: number = ret.fid;
            if (ftype === Thrift.Type.STOP) {
                break;
            }
            switch (fid) {
                case 1:
                    if (ftype === Thrift.Type.I32) {
                        this.id = input.readI32();
                    }
                    else {
                        input.skip(ftype);
                    }
                    break;
                case 2:
                    if (ftype === Thrift.Type.STRING) {
                        this.word = input.readString();
                    }
                    else {
                        input.skip(ftype);
                    }
                    break;
                case 3:
                    if (ftype === Thrift.Type.DOUBLE) {
                        this.field1 = input.readDouble();
                    }
                    else {
                        input.skip(ftype);
                    }
                    break;
                default: {
                    input.skip(ftype);
                }
            }
            input.readFieldEnd();
        }
        input.readStructEnd();
    }
};
`;
    const actual: string = make(content)
    assert.deepEqual(actual, expected)
  })
  
  it('should correctly generate a struct with a map field', () => {
    const content: string = `
      struct MyStruct {
          1: required map<string,string> field1
      }
    `;
    const expected: string =
`export interface IMyStruct {
    field1: Map<string, string>;
}
export class MyStruct {
    public field1: Map<string, string> = null;
    constructor(args?: IMyStruct) {
        if (args != null) {
            if (args.field1 != null) {
                this.field1 = args.field1;
            }
            else {
                throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, "Required field field1 is unset!");
            }
        }
    }
    public write(output: TProtocol): void {
        output.writeStructBegin("MyStruct");
        if (this.field1 != null) {
            output.writeFieldBegin("field1", Thrift.Type.MAP, 1);
            output.writeMapBegin(Thrift.Type.STRING, Thrift.Type.STRING, this.field1.size);
            this.field1.forEach((value_1: string, key_1: string): void => {
                output.writeString(key_1);
                output.writeString(value_1);
            });
            output.writeMapEnd();
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
    }
    public read(input: TProtocol): void {
        input.readStructBegin();
        while (true) {
            const ret: {
                fname: string;
                ftype: Thrift.Type;
                fid: number;
            } = input.readFieldBegin();
            const fname: string = ret.fname;
            const ftype: Thrift.Type = ret.ftype;
            const fid: number = ret.fid;
            if (ftype === Thrift.Type.STOP) {
                break;
            }
            switch (fid) {
                case 1:
                    if (ftype === Thrift.Type.MAP) {
                        this.field1 = new Map<string, string>();
                        const metadata_1: {
                            ktype: Thrift.Type;
                            vtype: Thrift.Type;
                            size: number;
                        } = input.readMapBegin();
                        const size_1: number = metadata_1.size;
                        for (let i_1: number = 0; i_1 < size_1; i_1++) {
                            const key_2: string = input.readString();
                            const value_2: string = input.readString();
                            this.field1.set(key_2, value_2);
                        }
                        input.readMapEnd();
                    }
                    else {
                        input.skip(ftype);
                    }
                    break;
                default: {
                    input.skip(ftype);
                }
            }
            input.readFieldEnd();
        }
        input.readStructEnd();
    }
};
`;
    const actual: string = make(content)
    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a struct with a nested map field', () => {
    const content: string = `
      struct MyStruct {
          1: required map<string,map<string,i32>> field1
      }
    `;
    const expected: string =
`export interface IMyStruct {
    field1: Map<string, Map<string, number>>;
}
export class MyStruct {
    public field1: Map<string, Map<string, number>> = null;
    constructor(args?: IMyStruct) {
        if (args != null) {
            if (args.field1 != null) {
                this.field1 = args.field1;
            }
            else {
                throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, "Required field field1 is unset!");
            }
        }
    }
    public write(output: TProtocol): void {
        output.writeStructBegin("MyStruct");
        if (this.field1 != null) {
            output.writeFieldBegin("field1", Thrift.Type.MAP, 1);
            output.writeMapBegin(Thrift.Type.STRING, Thrift.Type.MAP, this.field1.size);
            this.field1.forEach((value_1: Map<string, number>, key_1: string): void => {
                output.writeString(key_1);
                output.writeMapBegin(Thrift.Type.STRING, Thrift.Type.I32, value_1.size);
                value_1.forEach((value_2: number, key_2: string): void => {
                    output.writeString(key_2);
                    output.writeI32(value_2);
                });
                output.writeMapEnd();
            });
            output.writeMapEnd();
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
    }
    public read(input: TProtocol): void {
        input.readStructBegin();
        while (true) {
            const ret: {
                fname: string;
                ftype: Thrift.Type;
                fid: number;
            } = input.readFieldBegin();
            const fname: string = ret.fname;
            const ftype: Thrift.Type = ret.ftype;
            const fid: number = ret.fid;
            if (ftype === Thrift.Type.STOP) {
                break;
            }
            switch (fid) {
                case 1:
                    if (ftype === Thrift.Type.MAP) {
                        this.field1 = new Map<string, Map<string, number>>();
                        const metadata_1: {
                            ktype: Thrift.Type;
                            vtype: Thrift.Type;
                            size: number;
                        } = input.readMapBegin();
                        const size_1: number = metadata_1.size;
                        for (let i_1: number = 0; i_1 < size_1; i_1++) {
                            const key_3: string = input.readString();
                            const value_3: Map<string, number> = new Map<string, number>();
                            const metadata_2: {
                                ktype: Thrift.Type;
                                vtype: Thrift.Type;
                                size: number;
                            } = input.readMapBegin();
                            const size_2: number = metadata_2.size;
                            for (let i_2: number = 0; i_2 < size_2; i_2++) {
                                const key_4: string = input.readString();
                                const value_4: number = input.readI32();
                                value_3.set(key_4, value_4);
                            }
                            input.readMapEnd();
                            this.field1.set(key_3, value_3);
                        }
                        input.readMapEnd();
                    }
                    else {
                        input.skip(ftype);
                    }
                    break;
                default: {
                    input.skip(ftype);
                }
            }
            input.readFieldEnd();
        }
        input.readStructEnd();
    }
};
`;
    const actual: string = make(content)
    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a struct with a list field', () => {
    const content: string = `
      struct MyStruct {
          1: required list<string> field1
      }
    `;
    const expected: string =
`export interface IMyStruct {
    field1: Array<string>;
}
export class MyStruct {
    public field1: Array<string> = null;
    constructor(args?: IMyStruct) {
        if (args != null) {
            if (args.field1 != null) {
                this.field1 = args.field1;
            }
            else {
                throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, "Required field field1 is unset!");
            }
        }
    }
    public write(output: TProtocol): void {
        output.writeStructBegin("MyStruct");
        if (this.field1 != null) {
            output.writeFieldBegin("field1", Thrift.Type.LIST, 1);
            output.writeListBegin(Thrift.Type.STRING, this.field1.length);
            this.field1.forEach((value_1: string): void => {
                output.writeString(value_1);
            });
            output.writeListEnd();
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
    }
    public read(input: TProtocol): void {
        input.readStructBegin();
        while (true) {
            const ret: {
                fname: string;
                ftype: Thrift.Type;
                fid: number;
            } = input.readFieldBegin();
            const fname: string = ret.fname;
            const ftype: Thrift.Type = ret.ftype;
            const fid: number = ret.fid;
            if (ftype === Thrift.Type.STOP) {
                break;
            }
            switch (fid) {
                case 1:
                    if (ftype === Thrift.Type.LIST) {
                        this.field1 = new Array<string>();
                        const metadata_1: {
                            etype: Thrift.Type;
                            size: number;
                        } = input.readListBegin();
                        const size_1: number = metadata_1.size;
                        for (let i_1: number = 0; i_1 < size_1; i_1++) {
                            const value_2: string = input.readString();
                            this.field1.push(value_2);
                        }
                        input.readListEnd();
                    }
                    else {
                        input.skip(ftype);
                    }
                    break;
                default: {
                    input.skip(ftype);
                }
            }
            input.readFieldEnd();
        }
        input.readStructEnd();
    }
};
`;
    const actual: string = make(content)
    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a struct with a nested list field', () => {
    const content: string = `
      struct MyStruct {
          1: required list<list<string>> field1
      }
    `;
    const expected: string =
`export interface IMyStruct {
    field1: Array<Array<string>>;
}
export class MyStruct {
    public field1: Array<Array<string>> = null;
    constructor(args?: IMyStruct) {
        if (args != null) {
            if (args.field1 != null) {
                this.field1 = args.field1;
            }
            else {
                throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, "Required field field1 is unset!");
            }
        }
    }
    public write(output: TProtocol): void {
        output.writeStructBegin("MyStruct");
        if (this.field1 != null) {
            output.writeFieldBegin("field1", Thrift.Type.LIST, 1);
            output.writeListBegin(Thrift.Type.LIST, this.field1.length);
            this.field1.forEach((value_1: Array<string>): void => {
                output.writeListBegin(Thrift.Type.STRING, value_1.length);
                value_1.forEach((value_2: string): void => {
                    output.writeString(value_2);
                });
                output.writeListEnd();
            });
            output.writeListEnd();
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
    }
    public read(input: TProtocol): void {
        input.readStructBegin();
        while (true) {
            const ret: {
                fname: string;
                ftype: Thrift.Type;
                fid: number;
            } = input.readFieldBegin();
            const fname: string = ret.fname;
            const ftype: Thrift.Type = ret.ftype;
            const fid: number = ret.fid;
            if (ftype === Thrift.Type.STOP) {
                break;
            }
            switch (fid) {
                case 1:
                    if (ftype === Thrift.Type.LIST) {
                        this.field1 = new Array<Array<string>>();
                        const metadata_1: {
                            etype: Thrift.Type;
                            size: number;
                        } = input.readListBegin();
                        const size_1: number = metadata_1.size;
                        for (let i_1: number = 0; i_1 < size_1; i_1++) {
                            const value_3: Array<string> = new Array<string>();
                            const metadata_2: {
                                etype: Thrift.Type;
                                size: number;
                            } = input.readListBegin();
                            const size_2: number = metadata_2.size;
                            for (let i_2: number = 0; i_2 < size_2; i_2++) {
                                const value_4: string = input.readString();
                                value_3.push(value_4);
                            }
                            input.readListEnd();
                            this.field1.push(value_3);
                        }
                        input.readListEnd();
                    }
                    else {
                        input.skip(ftype);
                    }
                    break;
                default: {
                    input.skip(ftype);
                }
            }
            input.readFieldEnd();
        }
        input.readStructEnd();
    }
};
`;
    const actual: string = make(content)
    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a struct with a set field', () => {
    const content: string = `
      struct MyStruct {
          1: required set<string> field1
      }
    `;
    const expected: string =
`export interface IMyStruct {
    field1: Set<string>;
}
export class MyStruct {
    public field1: Set<string> = null;
    constructor(args?: IMyStruct) {
        if (args != null) {
            if (args.field1 != null) {
                this.field1 = args.field1;
            }
            else {
                throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, "Required field field1 is unset!");
            }
        }
    }
    public write(output: TProtocol): void {
        output.writeStructBegin("MyStruct");
        if (this.field1 != null) {
            output.writeFieldBegin("field1", Thrift.Type.SET, 1);
            output.writeSetBegin(Thrift.Type.STRING, this.field1.size);
            this.field1.forEach((value_1: string): void => {
                output.writeString(value_1);
            });
            output.writeSetEnd();
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
    }
    public read(input: TProtocol): void {
        input.readStructBegin();
        while (true) {
            const ret: {
                fname: string;
                ftype: Thrift.Type;
                fid: number;
            } = input.readFieldBegin();
            const fname: string = ret.fname;
            const ftype: Thrift.Type = ret.ftype;
            const fid: number = ret.fid;
            if (ftype === Thrift.Type.STOP) {
                break;
            }
            switch (fid) {
                case 1:
                    if (ftype === Thrift.Type.SET) {
                        this.field1 = new Set<string>();
                        const metadata_1: {
                            etype: Thrift.Type;
                            size: number;
                        } = input.readSetBegin();
                        const size_1: number = metadata_1.size;
                        for (let i_1: number = 0; i_1 < size_1; i_1++) {
                            const value_2: string = input.readString();
                            this.field1.add(value_2);
                        }
                        input.readSetEnd();
                    }
                    else {
                        input.skip(ftype);
                    }
                    break;
                default: {
                    input.skip(ftype);
                }
            }
            input.readFieldEnd();
        }
        input.readStructEnd();
    }
};
`;
    const actual: string = make(content)
    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a struct with a nested set field', () => {
    const content: string = `
      struct MyStruct {
          1: required set<set<string>> field1
      }
    `;
    const expected: string =
`export interface IMyStruct {
    field1: Set<Set<string>>;
}
export class MyStruct {
    public field1: Set<Set<string>> = null;
    constructor(args?: IMyStruct) {
        if (args != null) {
            if (args.field1 != null) {
                this.field1 = args.field1;
            }
            else {
                throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, "Required field field1 is unset!");
            }
        }
    }
    public write(output: TProtocol): void {
        output.writeStructBegin("MyStruct");
        if (this.field1 != null) {
            output.writeFieldBegin("field1", Thrift.Type.SET, 1);
            output.writeSetBegin(Thrift.Type.SET, this.field1.size);
            this.field1.forEach((value_1: Set<string>): void => {
                output.writeSetBegin(Thrift.Type.STRING, value_1.size);
                value_1.forEach((value_2: string): void => {
                    output.writeString(value_2);
                });
                output.writeSetEnd();
            });
            output.writeSetEnd();
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
    }
    public read(input: TProtocol): void {
        input.readStructBegin();
        while (true) {
            const ret: {
                fname: string;
                ftype: Thrift.Type;
                fid: number;
            } = input.readFieldBegin();
            const fname: string = ret.fname;
            const ftype: Thrift.Type = ret.ftype;
            const fid: number = ret.fid;
            if (ftype === Thrift.Type.STOP) {
                break;
            }
            switch (fid) {
                case 1:
                    if (ftype === Thrift.Type.SET) {
                        this.field1 = new Set<Set<string>>();
                        const metadata_1: {
                            etype: Thrift.Type;
                            size: number;
                        } = input.readSetBegin();
                        const size_1: number = metadata_1.size;
                        for (let i_1: number = 0; i_1 < size_1; i_1++) {
                            const value_3: Set<string> = new Set<string>();
                            const metadata_2: {
                                etype: Thrift.Type;
                                size: number;
                            } = input.readSetBegin();
                            const size_2: number = metadata_2.size;
                            for (let i_2: number = 0; i_2 < size_2; i_2++) {
                                const value_4: string = input.readString();
                                value_3.add(value_4);
                            }
                            input.readSetEnd();
                            this.field1.add(value_3);
                        }
                        input.readSetEnd();
                    }
                    else {
                        input.skip(ftype);
                    }
                    break;
                default: {
                    input.skip(ftype);
                }
            }
            input.readFieldEnd();
        }
        input.readStructEnd();
    }
};
`;
    const actual: string = make(content)
    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a struct with an identifier field type', () => {
    const content: string = `
      struct MyStruct {
          1: required OtherStruct field1
      }
    `;
    const expected: string =
`export interface IMyStruct {
    field1: OtherStruct;
}
export class MyStruct {
    public field1: OtherStruct = null;
    constructor(args?: IMyStruct) {
        if (args != null) {
            if (args.field1 != null) {
                this.field1 = args.field1;
            }
            else {
                throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, "Required field field1 is unset!");
            }
        }
    }
    public write(output: TProtocol): void {
        output.writeStructBegin("MyStruct");
        if (this.field1 != null) {
            output.writeFieldBegin("field1", Thrift.Type.STRUCT, 1);
            this.field1.write(output);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
    }
    public read(input: TProtocol): void {
        input.readStructBegin();
        while (true) {
            const ret: {
                fname: string;
                ftype: Thrift.Type;
                fid: number;
            } = input.readFieldBegin();
            const fname: string = ret.fname;
            const ftype: Thrift.Type = ret.ftype;
            const fid: number = ret.fid;
            if (ftype === Thrift.Type.STOP) {
                break;
            }
            switch (fid) {
                case 1:
                    if (ftype === Thrift.Type.STRUCT) {
                        this.field1 = new OtherStruct();
                        this.field1.read(input);
                    }
                    else {
                        input.skip(ftype);
                    }
                    break;
                default: {
                    input.skip(ftype);
                }
            }
            input.readFieldEnd();
        }
        input.readStructEnd();
    }
};
`;
    const actual: string = make(content)
    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a struct with an identifier inside of a container', () => {
    const content: string = `
      struct MyStruct {
          1: required set<OtherStruct> field1
      }
    `;
    const expected: string =
`export interface IMyStruct {
    field1: Set<OtherStruct>;
}
export class MyStruct {
    public field1: Set<OtherStruct> = null;
    constructor(args?: IMyStruct) {
        if (args != null) {
            if (args.field1 != null) {
                this.field1 = args.field1;
            }
            else {
                throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, "Required field field1 is unset!");
            }
        }
    }
    public write(output: TProtocol): void {
        output.writeStructBegin("MyStruct");
        if (this.field1 != null) {
            output.writeFieldBegin("field1", Thrift.Type.SET, 1);
            output.writeSetBegin(Thrift.Type.STRUCT, this.field1.size);
            this.field1.forEach((value_1: OtherStruct): void => {
                value_1.write(output);
            });
            output.writeSetEnd();
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
    }
    public read(input: TProtocol): void {
        input.readStructBegin();
        while (true) {
            const ret: {
                fname: string;
                ftype: Thrift.Type;
                fid: number;
            } = input.readFieldBegin();
            const fname: string = ret.fname;
            const ftype: Thrift.Type = ret.ftype;
            const fid: number = ret.fid;
            if (ftype === Thrift.Type.STOP) {
                break;
            }
            switch (fid) {
                case 1:
                    if (ftype === Thrift.Type.SET) {
                        this.field1 = new Set<OtherStruct>();
                        const metadata_1: {
                            etype: Thrift.Type;
                            size: number;
                        } = input.readSetBegin();
                        const size_1: number = metadata_1.size;
                        for (let i_1: number = 0; i_1 < size_1; i_1++) {
                            value_2 = new OtherStruct();
                            value_2.read(input);
                            this.field1.add(value_2);
                        }
                        input.readSetEnd();
                    }
                    else {
                        input.skip(ftype);
                    }
                    break;
                default: {
                    input.skip(ftype);
                }
            }
            input.readFieldEnd();
        }
        input.readStructEnd();
    }
};
`;
    const actual: string = make(content)
    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a class for an exception', () => {
    const content: string = `
      exception MyException {
          1: required string message;
      }
    `;
    const expected: string =
`export interface IMyException {
    message: string;
}
export class MyException extends Thrift.TException {
    public message: string = null;
    constructor(args?: IMyException) {
        if (args != null) {
            if (args.message != null) {
                this.message = args.message;
            }
            else {
                throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, "Required field message is unset!");
            }
        }
    }
    public write(output: TProtocol): void {
        output.writeStructBegin("MyException");
        if (this.message != null) {
            output.writeFieldBegin("message", Thrift.Type.STRING, 1);
            output.writeString(this.message);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
    }
    public read(input: TProtocol): void {
        input.readStructBegin();
        while (true) {
            const ret: {
                fname: string;
                ftype: Thrift.Type;
                fid: number;
            } = input.readFieldBegin();
            const fname: string = ret.fname;
            const ftype: Thrift.Type = ret.ftype;
            const fid: number = ret.fid;
            if (ftype === Thrift.Type.STOP) {
                break;
            }
            switch (fid) {
                case 1:
                    if (ftype === Thrift.Type.STRING) {
                        this.message = input.readString();
                    }
                    else {
                        input.skip(ftype);
                    }
                    break;
                default: {
                    input.skip(ftype);
                }
            }
            input.readFieldEnd();
        }
        input.readStructEnd();
    }
};
`;
    const actual: string = make(content)
    assert.deepEqual(actual, expected)
  })
})
