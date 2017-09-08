import * as fs from 'fs'
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
    const expected: string = fs.readFileSync('./fixtures/basic_const.solution.ts', 'utf-8')
    assert.equal(actual, expected)
  })

  it('should correctly generate a type alias', () => {
    const content: string = `
      typedef string name
    `;
    const expected: string = fs.readFileSync('./fixtures/basic_typedef.solution.ts', 'utf-8');
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
    const expected: string = fs.readFileSync('./fixtures/basic_enum.solution.ts', 'utf-8');
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
    const expected: string = fs.readFileSync('./fixtures/field_initialized_enum.solution.ts', 'utf-8');
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
    const expected: string = fs.readFileSync('./fixtures/multi_field_struct.solution.ts', 'utf-8');
    const actual: string = make(content)
    assert.deepEqual(actual, expected)
  })
  
  it('should correctly generate a struct with a map field', () => {
    const content: string = `
      struct MyStruct {
          1: required map<string,string> field1
      }
    `;
    const expected: string = fs.readFileSync('./fixtures/map_struct.solution.ts', 'utf-8');
    const actual: string = make(content)
    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a struct with a nested map field', () => {
    const content: string = `
      struct MyStruct {
          1: required map<string,map<string,i32>> field1
      }
    `;
    const expected: string = fs.readFileSync('./fixtures/nested_map_struct.solution.ts', 'utf-8');
    const actual: string = make(content)
    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a struct with a list field', () => {
    const content: string = `
      struct MyStruct {
          1: required list<string> field1
      }
    `;
    const expected: string = fs.readFileSync('./fixtures/list_struct.solution.ts', 'utf-8');
    const actual: string = make(content)
    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a struct with a nested list field', () => {
    const content: string = `
      struct MyStruct {
          1: required list<list<string>> field1
      }
    `;
    const expected: string = fs.readFileSync('./fixtures/nested_list_struct.solution.ts', 'utf-8');
    const actual: string = make(content)
    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a struct with a set field', () => {
    const content: string = `
      struct MyStruct {
          1: required set<string> field1
      }
    `;
    const expected: string = fs.readFileSync('./fixtures/set_struct.solution.ts', 'utf-8');
    const actual: string = make(content)
    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a struct with a nested set field', () => {
    const content: string = `
      struct MyStruct {
          1: required set<set<string>> field1
      }
    `;
    const expected: string = fs.readFileSync('./fixtures/nested_set_struct.solution.ts', 'utf-8');
    const actual: string = make(content)
    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a struct with an identifier field type', () => {
    const content: string = `
      struct MyStruct {
          1: required OtherStruct field1
      }
    `;
    const expected: string = fs.readFileSync('./fixtures/return_id_struct.solution.ts', 'utf-8');
    const actual: string = make(content)
    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a struct with an identifier inside of a container', () => {
    const content: string = `
      struct MyStruct {
          1: required set<OtherStruct> field1
      }
    `;
    const expected: string = fs.readFileSync('./fixtures/container_id_struct.solution.ts', 'utf-8');
    const actual: string = make(content)
    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a class for an exception', () => {
    const content: string = `
      exception MyException {
          1: required string message;
      }
    `;
    const expected: string = fs.readFileSync('./fixtures/basic_exception.solution.ts', 'utf-8');
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
    const expected: string = fs.readFileSync('./fixtures/basic_union.solution.ts', 'utf-8');
    const actual: string = make(content)
    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a service', () => {
    const content: string = `
      service MyService {
          void ping();
      }
    `;
    const expected: string = fs.readFileSync('./fixtures/basic_service.solution.ts', 'utf-8');

    const actual: string = make(content)
    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a service with functions that throw', () => {
    const content: string = `
      service MyService {
          void ping() throws (1: MyException exp);
      }
    `;
    const expected: string = fs.readFileSync('./fixtures/throw_service.solution.ts', 'utf-8');

    const actual: string = make(content)
    assert.deepEqual(actual, expected)
  })

  it('should correctly generate a service with functions that return', () => {
    const content: string = `
      service MyService {
          string ping(1: i32 status) throws (1: MyException exp);
      }
    `;
    const expected: string = fs.readFileSync('./fixtures/return_service.solution.ts', 'utf-8');

    const actual: string = make(content)
    assert.deepEqual(actual, expected)
  })
})
