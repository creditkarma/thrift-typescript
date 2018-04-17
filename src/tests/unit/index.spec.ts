import * as fs from 'fs'
import * as path from 'path'
import { assert } from 'chai'
import { make } from '../../main/index'
import { CompileTarget } from '../../main/types'

function readFixture(name: string, target: CompileTarget = 'apache'): string {
    return fs.readFileSync(path.join(__dirname, `./fixtures/${target}/${name}.solution.ts`), 'utf-8')
}

describe('Thrift TypeScript Generator', () => {
    describe('Thrift Server v2', () => {
        it('should correctly generate a struct', () => {
            const content: string = `
                struct MyStruct {
                    1: required i32 id = 45
                    2: required i64 bigID = 23948234
                    3: required string word
                    4: optional double field1
                    5: optional binary blob = "binary"
                }
            `
            const expected: string = readFixture('multi_field_struct', 'thrift-server')
            const actual: string = make(content, 'thrift-server')

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate an empty struct', () => {
            const content: string = `
                struct MyStruct {}
            `
            const expected: string = readFixture('empty_struct', 'thrift-server')
            const actual: string = make(content, 'thrift-server')

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a struct that uses a struct as a field', () => {
            const content: string = `
                struct User {
                    1: required string name
                    2: optional i64 age = 45
                }

                struct MyStruct {
                    1: required string name
                    2: required User user
                }
            `
            const expected: string = readFixture('nested_struct', 'thrift-server')
            const actual: string = make(content, 'thrift-server')

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a struct containing a list of structs', () => {
            const content: string = `
                struct OtherStruct {
                    1: required i64 id
                    2: required string name = "John"
                }

                struct MyStruct {
                    1: required list<OtherStruct> idList
                    2: required map<string,OtherStruct> idMap
                    3: required set<OtherStruct> idSet
                }
            `
            const expected: string = readFixture('complex_nested_struct', 'thrift-server')
            const actual: string = make(content, 'thrift-server')

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a union', () => {
            const content: string = `
                union MyUnion {
                    1: i32 field1
                    2: i64 field2
                }
            `
            const expected: string = readFixture('basic_union', 'thrift-server')
            const actual: string = make(content, 'thrift-server')

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a strict union', () => {
            const content: string = `
                union MyUnion {
                    1: i32 field1
                    2: i64 field2
                }
            `
            const expected: string = readFixture('strict_union', 'thrift-server')
            const actual: string = make(content, 'thrift-server', { strict: true })

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate an empty union', () => {
            const content: string = `
                union MyUnion {}
            `
            const expected: string = readFixture('empty_union', 'thrift-server')
            const actual: string = make(content, 'thrift-server')

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a union that uses a union as a field', () => {
            const content: string = `
                union Option {
                    1: binary option1
                    2: i64 option2
                }

                union MyUnion {
                    1: string name
                    2: Option option
                }
            `
            const expected: string = readFixture('nested_union', 'thrift-server')
            const actual: string = make(content, 'thrift-server')

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a strict union that uses a union as a field', () => {
            const content: string = `
                union Option {
                    1: binary option1
                    2: i64 option2
                }

                union MyUnion {
                    1: string name
                    2: Option option
                }
            `
            const expected: string = readFixture('nested_strict_union', 'thrift-server')
            const actual: string = make(content, 'thrift-server', { strict: true })

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate an exception', () => {
            const content: string = `
                exception MyException {
                    1: string message
                    2: i32 code = 200
                }
            `
            const expected: string = readFixture('basic_exception', 'thrift-server')
            const actual: string = make(content, 'thrift-server')

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate an exception with required fields', () => {
            const content: string = `
                exception MyException {
                    1: required string description
                    2: i32 code
                }
            `
            const expected: string = readFixture('required_field_exception', 'thrift-server')
            const actual: string = make(content, 'thrift-server')

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate an exception with struct fields', () => {
            const content: string = `
                struct Code {
                    1: i64 status = 200
                    2: binary data = "data"
                }

                exception MyException {
                    1: required string description
                    3: Code code
                }
            `
            const expected: string = readFixture('nested_exception', 'thrift-server')
            const actual: string = make(content, 'thrift-server')

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a basic service', () => {
            const content: string = `
                struct User {
                    1: required string name
                    2: required i32 id
                }

                service MyService {
                    User getUser(1: i32 id)
                    void ping()
                }
            `
            const expected: string = readFixture('basic_service', 'thrift-server')
            const actual: string = make(content, 'thrift-server')

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a service that extends another service', () => {
            const content: string = `
                service ParentService {
                    string ping(1: i32 status)
                }

                service ChildService extends ParentService {
                    string peg(1: string name)
                    string pong(1: optional string name)
                }
            `
            const expected: string = readFixture('extend_service', 'thrift-server')
            const actual: string = make(content, 'thrift-server')

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a service that handles i64', () => {
            const content: string = `
                struct Code {
                    1: i64 status
                }

                service MyService {
                    string peg(1: string name)
                    i64 pong(1: optional Code code)
                }
            `
            const expected: string = readFixture('i64_service', 'thrift-server')
            const actual: string = make(content, 'thrift-server')

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a service that throws', () => {
            const content: string = `
                exception ServiceException {
                    1: string message
                }

                service MyService {
                    string peg(1: string name) throws (1: ServiceException exp)
                    string pong(1: optional string name)
                }
            `
            const expected: string = readFixture('throws_service', 'thrift-server')
            const actual: string = make(content, 'thrift-server')

            assert.deepEqual(actual, expected)
        })
    })

    describe('Apache', () => {
        it('should correctly generate a const', () => {
            const content: string = `
                const bool FALSE_CONST = false
                const i64 INT_64 = 64
                const set<string> SET_CONST = ['hello', 'world', 'foo', 'bar']
                const map<string,string> MAP_CONST = {'hello': 'world', 'foo': 'bar' }
                const list<string> LIST_CONST = ['hello', 'world', 'foo', 'bar']
            `
            const actual: string = make(content)
            const expected: string = readFixture('basic_const')

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a type alias', () => {
            const content: string = `
                typedef string name
            `
            const expected: string = readFixture('basic_typedef')
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a type alias for an identifier', () => {
            const content: string = `
                enum MyEnum {
                    ONE,
                    TWO
                }

                typedef MyEnum AnotherName
            `
            const expected: string = readFixture('enum_typedef')
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a complex type alias for an identifier', () => {
            const content: string = `
                enum MyEnum {
                    ONE,
                    TWO
                }

                typedef i32 MyInt

                typedef MyEnum AnotherName

                const MyInt INT_32 = 32

                const AnotherName WHAT = AnotherName.ONE
            `
            const expected: string = readFixture('complex_typedef')
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
            `
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
            `
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
                    5: optional binary blob = "binary"
                }
            `
            const expected: string = readFixture('multi_field_struct')
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })

        it('struct fields should default to optional', () => {
            const content: string = `
                struct MyStruct {
                    1: i32 id
                    2: string name
                }
            `
            const expected: string = readFixture('implicit_optional_struct')
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a struct with a map field', () => {
            const content: string = `
                struct MyStruct {
                    1: required map<string,string> field1
                }
            `
            const expected: string = readFixture('map_struct')
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a struct with a nested map field', () => {
            const content: string = `
                struct MyStruct {
                    1: required map<string,map<string,i32>> field1
                }
            `
            const expected: string = readFixture('nested_map_struct')
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a struct with a list field', () => {
            const content: string = `
                struct MyStruct {
                    1: required list<string> field1
                }
            `
            const expected: string = readFixture('list_struct')
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a struct with a nested list field', () => {
            const content: string = `
                struct MyStruct {
                    1: required list<list<string>> field1
                }
            `
            const expected: string = readFixture('nested_list_struct')
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a struct with a set field', () => {
            const content: string = `
                struct MyStruct {
                    1: required set<string> field1
                }
            `
            const expected: string = readFixture('set_struct')
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a struct with a nested set field', () => {
            const content: string = `
                struct MyStruct {
                    1: required set<set<string>> field1
                }
            `
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
            `
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
            `
            const expected: string = readFixture('container_id_struct')
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a class for an exception', () => {
            const content: string = `
                exception MyException {
                    1: required string message
                }
            `
            const expected: string = readFixture('basic_exception')
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a class for a union', () => {
            const content: string = `
                union MyUnion {
                    1: string field1
                    2: string field2
                }
            `
            const expected: string = readFixture('basic_union')
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a class for a union with nested container types', () => {
            const content: string = `
                union MyUnion {
                    1: string field1
                    2: list<list<string>> field2
                }
            `
            const expected: string = readFixture('nested_list_union')
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a service', () => {
            const content: string = `
                service MyService {
                    void ping()
                }
            `
            const expected: string = readFixture('basic_service')
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a service with i64 fields', () => {
            const content: string = `
                service MyService {
                    i64 add(1: i64 num1, 2: i64 num2)
                }
            `
            const expected: string = readFixture('i64_service')
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a service with functions that throw', () => {
            const content: string = `
                exception MyException {
                    1: string message
                }

                service MyService {
                    void ping() throws (1: MyException exp)
                }
            `
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
                    string ping(1: i32 status) throws (1: MyException exp)
                }
            `
            const expected: string = readFixture('return_service')
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a service that extends another service', () => {
            const content: string = `
                service ParentService {
                    string ping(1: i32 status)
                }

                service ChildService extends ParentService {
                    string peg(1: string name)
                }
            `
            const expected: string = readFixture('extend_service')
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })
    })
})
