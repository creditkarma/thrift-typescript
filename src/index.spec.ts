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
`export interface IMyStructArgs {
    id: number;
    word: string;
    field1?: number;
}
export class MyStruct {
    public id: number = null;
    public word: string = null;
    public field1: number = null;
    constructor(args?: IMyStructArgs) {
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
        return;
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
        return;
    }
}
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
`export interface IMyStructArgs {
    field1: Map<string, string>;
}
export class MyStruct {
    public field1: Map<string, string> = null;
    constructor(args?: IMyStructArgs) {
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
        return;
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
        return;
    }
}
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
`export interface IMyStructArgs {
    field1: Map<string, Map<string, number>>;
}
export class MyStruct {
    public field1: Map<string, Map<string, number>> = null;
    constructor(args?: IMyStructArgs) {
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
        return;
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
        return;
    }
}
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
`export interface IMyStructArgs {
    field1: Array<string>;
}
export class MyStruct {
    public field1: Array<string> = null;
    constructor(args?: IMyStructArgs) {
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
        return;
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
        return;
    }
}
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
`export interface IMyStructArgs {
    field1: Array<Array<string>>;
}
export class MyStruct {
    public field1: Array<Array<string>> = null;
    constructor(args?: IMyStructArgs) {
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
        return;
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
        return;
    }
}
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
`export interface IMyStructArgs {
    field1: Set<string>;
}
export class MyStruct {
    public field1: Set<string> = null;
    constructor(args?: IMyStructArgs) {
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
        return;
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
        return;
    }
}
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
`export interface IMyStructArgs {
    field1: Set<Set<string>>;
}
export class MyStruct {
    public field1: Set<Set<string>> = null;
    constructor(args?: IMyStructArgs) {
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
        return;
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
        return;
    }
}
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
`export interface IMyStructArgs {
    field1: OtherStruct;
}
export class MyStruct {
    public field1: OtherStruct = null;
    constructor(args?: IMyStructArgs) {
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
        return;
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
        return;
    }
}
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
`export interface IMyStructArgs {
    field1: Set<OtherStruct>;
}
export class MyStruct {
    public field1: Set<OtherStruct> = null;
    constructor(args?: IMyStructArgs) {
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
        return;
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
        return;
    }
}
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
`export interface IMyExceptionArgs {
    message: string;
}
export class MyException extends Thrift.TException {
    public message: string = null;
    constructor(args?: IMyExceptionArgs) {
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
        return;
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
        return;
    }
}
`;
    const actual: string = make(content)
    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a class for a union', () => {
    const content: string = `
      union MyUnion {
          1: string field1;
          2: string field2;
      }
    `;
    const expected: string =
`export interface IMyUnionArgs {
    field1?: string;
    field2?: string;
}
export class MyUnion {
    public field1: string = null;
    public field2: string = null;
    constructor(args?: IMyUnionArgs) {
        let fieldsSet: number = 0;
        if (args != null) {
            if (args.field1 != null) {
                fieldsSet++;
                this.field1 = args.field1;
            }
            if (args.field2 != null) {
                fieldsSet++;
                this.field2 = args.field2;
            }
            if (fieldsSet > 1) {
                throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with more than one set value!");
            }
            else if (fieldsSet < 1) {
                throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with no set value!");
            }
        }
    }
    public write(output: TProtocol): void {
        output.writeStructBegin("MyUnion");
        if (this.field1 != null) {
            output.writeFieldBegin("field1", Thrift.Type.STRING, 1);
            output.writeString(this.field1);
            output.writeFieldEnd();
        }
        if (this.field2 != null) {
            output.writeFieldBegin("field2", Thrift.Type.STRING, 2);
            output.writeString(this.field2);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
    public read(input: TProtocol): void {
        let fieldsSet: number = 0;
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
                        fieldsSet++;
                        this.field1 = input.readString();
                    }
                    else {
                        input.skip(ftype);
                    }
                    break;
                case 2:
                    if (ftype === Thrift.Type.STRING) {
                        fieldsSet++;
                        this.field2 = input.readString();
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
        if (fieldsSet > 1) {
            throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with more than one set value!");
        }
        else if (fieldsSet < 1) {
            throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.INVALID_DATA, "Cannot read a TUnion with no set value!");
        }
    }
}
`;
    const actual: string = make(content)
    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a service', () => {
    const content: string = `
      service MyService {
          void ping();
      }
    `;
    const expected: string =
`export interface IMyServicePingArgsArgs {
}
export class MyServicePingArgs {
    constructor(args?: IMyServicePingArgsArgs) {
        if (args != null) {
        }
    }
    public write(output: TProtocol): void {
        output.writeStructBegin("MyServicePingArgs");
        output.writeFieldStop();
        output.writeStructEnd();
        return;
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
                default: {
                    input.skip(ftype);
                }
            }
            input.readFieldEnd();
        }
        input.readStructEnd();
        return;
    }
}
export interface IMyServicePingResultArgs {
    success?: void;
}
export class MyServicePingResult {
    public success: void = null;
    constructor(args?: IMyServicePingResultArgs) {
        if (args != null) {
            if (args.success != null) {
                this.success = args.success;
            }
        }
    }
    public write(output: TProtocol): void {
        output.writeStructBegin("MyServicePingResult");
        output.writeFieldStop();
        output.writeStructEnd();
        return;
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
                    if (ftype === Thrift.Type.VOID) {
                        input.skip(ftype);
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
        return;
    }
}
export class Client {
    private _seqid: number;
    private _reqs: {
        [name: string]: (err: Error | object, r?: any) => void;
    };
    public output: TTransport;
    public protocol: new () => TProtocol;
    constructor(output: TTransport, protocol: new () => TProtocol) {
        this._seqid = 0;
        this._reqs = {};
        this.output = output;
        this.protocol = protocol;
    }
    public ping(): Promise<void> {
        this._seqid = this.new_seqid();
        return new Promise<void>((resolve, reject): void => {
            this._reqs[this.seqid()] = (error, result) => {
                if (error != null) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            };
            this.send_ping();
        });
    }
    public send_ping(): void {
        const output = new this.protocol(this.output);
        output.writeMessageBegin("ping", Thrift.MessageType.CALL, this.seqid());
        const args = new MyServicePingArgs({});
        args.write(output);
        output.writeMessageEnd();
        return this.output.flush();
    }
    public recv_ping(input: TProtocol, mtype: Thrift.MessageType, rseqid: number): void {
        const noop = (): void => null;
        const callback = this._reqs[rseqid] || noop;
        delete this._reqs[rseqid];
        if (mtype === Thrift.MessageType.EXCEPTION) {
            const x: Thrift.TApplicationException = new Thrift.TApplicationException();
            x.read(input);
            input.readMessageEnd();
            return callback(x);
        }
        const result = new MyServicePingResult();
        result.read(input);
        input.readMessageEnd();
        if ("VoidKeyword" !== "VoidKeyword") {
            if (result.success != null) {
                return callback(undefined, result.success);
            }
        }
        return callback(new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, "ping failed: unknown result"));
    }
}
export class Processor<Context> {
    private _handler;
    constructor(handler) {
        this._handler = handler;
    }
    public process(input: TProtocol, output: TProtocol, context: Context): void {
        const metadata: {
            fname: string;
            mtype: Thrift.MessageType;
            rseqid: number;
        } = input.readMessageBegin();
        const fname: string = metadata.fname;
        const rseqid: number = metadata.rseqid;
        if (this["process_" + fname] != null) {
            return this["process_" + fname].call(this, rseqid, input, output, context);
        }
        else {
            input.skip(Thrift.Type.STRUCT);
            input.readMessageEnd();
            const errMessage = "Unknown function " + fname;
            const err = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN_METHOD, errMessage);
            output.writeMessageBegin(fname, Thrift.MessageType.EXCEPTION, rseqid);
            err.write(output);
            output.writeMessageEnd();
            output.flush();
        }
    }
    public process_ping(seqid: number, input: TProtocol, output: TProtocol, context: Context): void {
        const args = new MyServicePingArgs();
        args.read(input);
        input.readMessageEnd();
        new Promise<void>((resolve, reject): void => {
            try {
                resolve(this._handler.ping(context));
            }
            catch (err) {
                reject(err);
            }
        }).then((data: void): void => {
            const result = new MyServicePingResult({ success: data });
            output.writeMessageBegin("ping", Thrift.MessageType.REPLY, seqid);
            result.write(output);
            output.writeMessageEnd();
            output.flush();
        }).catch((err: Error): void => {
            let result;
            if (0 > 0) {
            }
            else {
                result = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, err.message);
                output.writeMessageBegin("ping", Thrift.MessageType.EXCEPTION, seqid);
            }
            result.write(output);
            output.writeMessageEnd();
            output.flush();
        });
    }
}
`;

    const actual: string = make(content)
    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a service with functions that throw', () => {
    const content: string = `
      service MyService {
          void ping() throws (1: MyException exp);
      }
    `;
    const expected: string =
`export interface IMyServicePingArgsArgs {
}
export class MyServicePingArgs {
    constructor(args?: IMyServicePingArgsArgs) {
        if (args != null) {
        }
    }
    public write(output: TProtocol): void {
        output.writeStructBegin("MyServicePingArgs");
        output.writeFieldStop();
        output.writeStructEnd();
        return;
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
                default: {
                    input.skip(ftype);
                }
            }
            input.readFieldEnd();
        }
        input.readStructEnd();
        return;
    }
}
export interface IMyServicePingResultArgs {
    success?: void;
    exp?: MyException;
}
export class MyServicePingResult {
    public success: void = null;
    public exp: MyException = null;
    constructor(args?: IMyServicePingResultArgs) {
        if (args != null) {
            if (args.success != null) {
                this.success = args.success;
            }
            if (args.exp != null) {
                this.exp = args.exp;
            }
        }
    }
    public write(output: TProtocol): void {
        output.writeStructBegin("MyServicePingResult");
        if (this.exp != null) {
            output.writeFieldBegin("exp", Thrift.Type.STRUCT, 2);
            this.exp.write(output);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
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
                    if (ftype === Thrift.Type.VOID) {
                        input.skip(ftype);
                    }
                    else {
                        input.skip(ftype);
                    }
                    break;
                case 2:
                    if (ftype === Thrift.Type.STRUCT) {
                        this.exp = new MyException();
                        this.exp.read(input);
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
        return;
    }
}
export class Client {
    private _seqid: number;
    private _reqs: {
        [name: string]: (err: Error | object, r?: any) => void;
    };
    public output: TTransport;
    public protocol: new () => TProtocol;
    constructor(output: TTransport, protocol: new () => TProtocol) {
        this._seqid = 0;
        this._reqs = {};
        this.output = output;
        this.protocol = protocol;
    }
    public ping(): Promise<void> {
        this._seqid = this.new_seqid();
        return new Promise<void>((resolve, reject): void => {
            this._reqs[this.seqid()] = (error, result) => {
                if (error != null) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            };
            this.send_ping();
        });
    }
    public send_ping(): void {
        const output = new this.protocol(this.output);
        output.writeMessageBegin("ping", Thrift.MessageType.CALL, this.seqid());
        const args = new MyServicePingArgs({});
        args.write(output);
        output.writeMessageEnd();
        return this.output.flush();
    }
    public recv_ping(input: TProtocol, mtype: Thrift.MessageType, rseqid: number): void {
        const noop = (): void => null;
        const callback = this._reqs[rseqid] || noop;
        delete this._reqs[rseqid];
        if (mtype === Thrift.MessageType.EXCEPTION) {
            const x: Thrift.TApplicationException = new Thrift.TApplicationException();
            x.read(input);
            input.readMessageEnd();
            return callback(x);
        }
        const result = new MyServicePingResult();
        result.read(input);
        input.readMessageEnd();
        if (exp != null) {
            return callback(result.exp);
        }
        if ("VoidKeyword" !== "VoidKeyword") {
            if (result.success != null) {
                return callback(undefined, result.success);
            }
        }
        return callback(new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, "ping failed: unknown result"));
    }
}
export class Processor<Context> {
    private _handler;
    constructor(handler) {
        this._handler = handler;
    }
    public process(input: TProtocol, output: TProtocol, context: Context): void {
        const metadata: {
            fname: string;
            mtype: Thrift.MessageType;
            rseqid: number;
        } = input.readMessageBegin();
        const fname: string = metadata.fname;
        const rseqid: number = metadata.rseqid;
        if (this["process_" + fname] != null) {
            return this["process_" + fname].call(this, rseqid, input, output, context);
        }
        else {
            input.skip(Thrift.Type.STRUCT);
            input.readMessageEnd();
            const errMessage = "Unknown function " + fname;
            const err = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN_METHOD, errMessage);
            output.writeMessageBegin(fname, Thrift.MessageType.EXCEPTION, rseqid);
            err.write(output);
            output.writeMessageEnd();
            output.flush();
        }
    }
    public process_ping(seqid: number, input: TProtocol, output: TProtocol, context: Context): void {
        const args = new MyServicePingArgs();
        args.read(input);
        input.readMessageEnd();
        new Promise<void>((resolve, reject): void => {
            try {
                resolve(this._handler.ping(context));
            }
            catch (err) {
                reject(err);
            }
        }).then((data: void): void => {
            const result = new MyServicePingResult({ success: data });
            output.writeMessageBegin("ping", Thrift.MessageType.REPLY, seqid);
            result.write(output);
            output.writeMessageEnd();
            output.flush();
        }).catch((err: Error): void => {
            let result;
            if (1 > 0) {
                if (err instanceof MyException) {
                    result = new MyServicePingResult({ exp: err });
                    output.writeMessageBegin("ping", Thrift.MessageType.REPLY, seqid);
                }
                else {
                    result = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, err.message);
                    output.writeMessageBegin("ping", Thrift.MessageType.EXCEPTION, seqid);
                }
            }
            else {
                result = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, err.message);
                output.writeMessageBegin("ping", Thrift.MessageType.EXCEPTION, seqid);
            }
            result.write(output);
            output.writeMessageEnd();
            output.flush();
        });
    }
}
`;

    const actual: string = make(content)
    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a service with functions that return', () => {
    const content: string = `
      service MyService {
          string ping(1: i32 status) throws (1: MyException exp);
      }
    `;
    const expected: string =
`export interface IMyServicePingArgsArgs {
    status: number;
}
export class MyServicePingArgs {
    public status: number = null;
    constructor(args?: IMyServicePingArgsArgs) {
        if (args != null) {
            if (args.status != null) {
                this.status = args.status;
            }
        }
    }
    public write(output: TProtocol): void {
        output.writeStructBegin("MyServicePingArgs");
        if (this.status != null) {
            output.writeFieldBegin("status", Thrift.Type.I32, 1);
            output.writeI32(this.status);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
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
                        this.status = input.readI32();
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
        return;
    }
}
export interface IMyServicePingResultArgs {
    success?: string;
    exp?: MyException;
}
export class MyServicePingResult {
    public success: string = null;
    public exp: MyException = null;
    constructor(args?: IMyServicePingResultArgs) {
        if (args != null) {
            if (args.success != null) {
                this.success = args.success;
            }
            if (args.exp != null) {
                this.exp = args.exp;
            }
        }
    }
    public write(output: TProtocol): void {
        output.writeStructBegin("MyServicePingResult");
        if (this.success != null) {
            output.writeFieldBegin("success", Thrift.Type.STRING, 1);
            output.writeString(this.success);
            output.writeFieldEnd();
        }
        if (this.exp != null) {
            output.writeFieldBegin("exp", Thrift.Type.STRUCT, 2);
            this.exp.write(output);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
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
                        this.success = input.readString();
                    }
                    else {
                        input.skip(ftype);
                    }
                    break;
                case 2:
                    if (ftype === Thrift.Type.STRUCT) {
                        this.exp = new MyException();
                        this.exp.read(input);
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
        return;
    }
}
export class Client {
    private _seqid: number;
    private _reqs: {
        [name: string]: (err: Error | object, r?: any) => void;
    };
    public output: TTransport;
    public protocol: new () => TProtocol;
    constructor(output: TTransport, protocol: new () => TProtocol) {
        this._seqid = 0;
        this._reqs = {};
        this.output = output;
        this.protocol = protocol;
    }
    public ping(status: number): Promise<string> {
        this._seqid = this.new_seqid();
        return new Promise<string>((resolve, reject): void => {
            this._reqs[this.seqid()] = (error, result) => {
                if (error != null) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            };
            this.send_ping(status);
        });
    }
    public send_ping(status: number): void {
        const output = new this.protocol(this.output);
        output.writeMessageBegin("ping", Thrift.MessageType.CALL, this.seqid());
        const args = new MyServicePingArgs({ status });
        args.write(output);
        output.writeMessageEnd();
        return this.output.flush();
    }
    public recv_ping(input: TProtocol, mtype: Thrift.MessageType, rseqid: number): void {
        const noop = (): void => null;
        const callback = this._reqs[rseqid] || noop;
        delete this._reqs[rseqid];
        if (mtype === Thrift.MessageType.EXCEPTION) {
            const x: Thrift.TApplicationException = new Thrift.TApplicationException();
            x.read(input);
            input.readMessageEnd();
            return callback(x);
        }
        const result = new MyServicePingResult();
        result.read(input);
        input.readMessageEnd();
        if (exp != null) {
            return callback(result.exp);
        }
        if ("StringKeyword" !== "VoidKeyword") {
            if (result.success != null) {
                return callback(undefined, result.success);
            }
        }
        return callback(new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, "ping failed: unknown result"));
    }
}
export class Processor<Context> {
    private _handler;
    constructor(handler) {
        this._handler = handler;
    }
    public process(input: TProtocol, output: TProtocol, context: Context): void {
        const metadata: {
            fname: string;
            mtype: Thrift.MessageType;
            rseqid: number;
        } = input.readMessageBegin();
        const fname: string = metadata.fname;
        const rseqid: number = metadata.rseqid;
        if (this["process_" + fname] != null) {
            return this["process_" + fname].call(this, rseqid, input, output, context);
        }
        else {
            input.skip(Thrift.Type.STRUCT);
            input.readMessageEnd();
            const errMessage = "Unknown function " + fname;
            const err = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN_METHOD, errMessage);
            output.writeMessageBegin(fname, Thrift.MessageType.EXCEPTION, rseqid);
            err.write(output);
            output.writeMessageEnd();
            output.flush();
        }
    }
    public process_ping(seqid: number, input: TProtocol, output: TProtocol, context: Context): void {
        const args = new MyServicePingArgs();
        args.read(input);
        input.readMessageEnd();
        new Promise<string>((resolve, reject): void => {
            try {
                resolve(this._handler.ping(args.status, context));
            }
            catch (err) {
                reject(err);
            }
        }).then((data: string): void => {
            const result = new MyServicePingResult({ success: data });
            output.writeMessageBegin("ping", Thrift.MessageType.REPLY, seqid);
            result.write(output);
            output.writeMessageEnd();
            output.flush();
        }).catch((err: Error): void => {
            let result;
            if (1 > 0) {
                if (err instanceof MyException) {
                    result = new MyServicePingResult({ exp: err });
                    output.writeMessageBegin("ping", Thrift.MessageType.REPLY, seqid);
                }
                else {
                    result = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, err.message);
                    output.writeMessageBegin("ping", Thrift.MessageType.EXCEPTION, seqid);
                }
            }
            else {
                result = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, err.message);
                output.writeMessageBegin("ping", Thrift.MessageType.EXCEPTION, seqid);
            }
            result.write(output);
            output.writeMessageEnd();
            output.flush();
        });
    }
}
`;

    const actual: string = make(content)
    assert.deepEqual(actual, expected)
  })
})
