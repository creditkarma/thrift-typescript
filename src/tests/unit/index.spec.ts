import * as fs from 'fs'
import * as path from 'path'
import { assert } from 'chai'
import { make } from '../../main/index'

function readFixture(name: string): string {
  return fs.readFileSync(path.join(__dirname, `../fixtures/${name}.solution.ts`), 'utf-8')
}

describe('Thrift TypeScript Generator', () => {

  it('should correctly generate a const', () => {
    const content: string = `
      const bool FALSE_CONST = false
      const set<string> SET_CONST = ['hello', 'world', 'foo', 'bar']
      const map<string,string> MAP_CONST = {'hello': 'world', 'foo': 'bar' }
      const list<string> LIST_CONST = ['hello', 'world', 'foo', 'bar']
    `;
    const actual: string = make(content)
    const expected: string = readFixture('basic_const')

    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a type alias', () => {
    const content: string = `
      typedef string name
    `;
    const expected: string = readFixture('basic_typedef')
    const actual: string = make(content)

    assert.deepEqual(actual, expected)
  })

  it('should correctly generate an enum', () => {
    const content: string = `
      enum MyEnum {
        ONE,
        TWO,
        THREE
      }
    `;
    const expected: string = readFixture('basic_enum')
    const actual: string = make(content)

    assert.deepEqual(actual, expected)
  })

  it('should correctly generate an enum with member initializer', () => {
    const content: string = `
      enum MyEnum {
        ONE = 5,
        TWO = 3,
        THREE = 6
      }
    `;
    const expected: string = readFixture('field_initialized_enum')
    const actual: string = make(content)

    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a struct', () => {
    const content: string = `
      struct MyStruct {
          1: required i32 id = 45
          2: required i64 bigID = 23948234
          3: required string word
          4: optional double field1
      }
    `;
    const expected: string = readFixture('multi_field_struct')
    const actual: string = make(content)

    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a struct with a map field', () => {
    const content: string = `
      struct MyStruct {
          1: required map<string,string> field1
      }
    `;
    const expected: string = readFixture('map_struct')
    const actual: string = make(content)

    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a struct with a nested map field', () => {
    const content: string = `
      struct MyStruct {
          1: required map<string,map<string,i32>> field1
      }
    `;
    const expected: string = readFixture('nested_map_struct')
    const actual: string = make(content)

    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a struct with a list field', () => {
    const content: string = `
      struct MyStruct {
          1: required list<string> field1
      }
    `;
    const expected: string = readFixture('list_struct')
    const actual: string = make(content)

    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a struct with a nested list field', () => {
    const content: string = `
      struct MyStruct {
          1: required list<list<string>> field1
      }
    `;
    const expected: string = readFixture('nested_list_struct')
    const actual: string = make(content)

    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a struct with a set field', () => {
    const content: string = `
      struct MyStruct {
          1: required set<string> field1
      }
    `;
    const expected: string = readFixture('set_struct')
    const actual: string = make(content)

    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a struct with a nested set field', () => {
    const content: string = `
      struct MyStruct {
          1: required set<set<string>> field1
      }
    `;
    const expected: string = readFixture('nested_set_struct')
    const actual: string = make(content)

    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a struct with a set field', () => {
    const content: string = `
      struct MyStruct {
          1: required set<string> field1
      }
    `;
    const expected: string = readFixture('set_struct')
    const actual: string = make(content)

    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a struct with a nested set field', () => {
    const content: string = `
      struct MyStruct {
          1: required set<set<string>> field1
      }
    `;
    const expected: string = readFixture('nested_set_struct')
    const actual: string = make(content)

    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a struct with an identifier field type', () => {
    const content: string = `
      struct OtherStruct {
        1: required string name
      }

      struct MyStruct {
          1: required OtherStruct field1
      }
    `;
    const expected: string = readFixture('return_id_struct')
    const actual: string = make(content)

    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a struct with an identifier inside of a container', () => {
    const content: string = `
      struct OtherStruct {
        1: required string name
      }

      struct MyStruct {
          1: required set<OtherStruct> field1
      }
    `;
    const expected: string = readFixture('container_id_struct')
    const actual: string = make(content)

    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a class for an exception', () => {
    const content: string = `
      exception MyException {
          1: required string message;
      }
    `;
    const expected: string = readFixture('basic_exception')
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
    const expected: string = readFixture('basic_union')
    const actual: string = make(content)

    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a class for a union with nested container types', () => {
    const content: string = `
      union MyUnion {
          1: string field1;
          2: list<list<string>> field2;
      }
    `;
    const expected: string = readFixture('nested_list_union')
    const actual: string = make(content)

    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a service', () => {
    const content: string = `
      service MyService {
          void ping();
      }
    `;
    const expected: string = readFixture('basic_service')
    const actual: string = make(content)

    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a service with functions that throw', () => {
    const content: string = `
      exception MyException {
        1: string message
      }

      service MyService {
          void ping() throws (1: MyException exp);
      }
    `;
    const expected: string = readFixture('throw_service')
    const actual: string = make(content)

    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a service with functions that return', () => {
    const content: string = `
      exception MyException {
        1: string message
      }

      service MyService {
          string ping(1: i32 status) throws (1: MyException exp);
      }
    `;
    const expected: string = readFixture('return_service')
    const actual: string = make(content)

    assert.deepEqual(actual, expected)
  })
})
