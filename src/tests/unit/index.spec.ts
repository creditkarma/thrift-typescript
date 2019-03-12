import { assert } from 'chai'
import * as fs from 'fs'
import * as path from 'path'

import { generate, make } from '../../main/index'

import { CompileTarget } from '../../main/types'

function readSolution(name: string, target: CompileTarget = 'apache'): string {
    return fs.readFileSync(
        path.join(__dirname, `./fixtures/${target}/${name}.solution.ts`),
        'utf-8',
    )
}

function readGenerated(name: string, location: string = 'generated'): string {
    return fs.readFileSync(
        path.join(__dirname, `./${location}/${name}/index.ts`),
        'utf-8',
    )
}

function readGeneratedSolution(
    name: string,
    location: string = 'generated',
): string {
    const contents: string = fs.readFileSync(
        path.join(__dirname, `./fixtures/${location}/${name}/index.ts`),
        'utf-8',
    )
    return contents.replace('{{VERSION}}', process.env.npm_package_version!)
}

describe('Thrift TypeScript Generator', () => {
    describe('Thrift Server v2 Generated', () => {
        before(() => {
            generate({
                rootDir: __dirname,
                outDir: 'generated',
                sourceDir: 'fixtures/thrift',
                target: 'thrift-server',
                files: [],
                library: 'test-lib',
            })
        })

        it('should correctly generate typedefs for includes', () => {
            const actual: string = readGenerated('operation')
            const expected: string = readGeneratedSolution('operation')
            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a struct using includes', () => {
            const actual: string = readGenerated('common')
            const expected: string = readGeneratedSolution('common')
            assert.deepEqual(actual, expected)
        })

        it('should correctly generate an exception using includes', () => {
            const actual: string = readGenerated('exceptions')
            const expected: string = readGeneratedSolution('exceptions')
            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a service', () => {
            const actual: string = readGenerated('shared')
            const expected: string = readGeneratedSolution('shared')
            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a service using includes', () => {
            const actual: string = readGenerated('calculator')
            const expected: string = readGeneratedSolution('calculator')
            assert.deepEqual(actual, expected)
        })
    })

    describe('Thrift Server v2 Generated w Strict Unions', () => {
        before(() => {
            generate({
                rootDir: __dirname,
                outDir: 'generated/strict-unions',
                sourceDir: 'fixtures/thrift',
                target: 'thrift-server',
                files: [],
                library: 'test-lib',
                strictUnions: true,
            })
        })
        it('should correctly generate typedefs for includes', () => {
            const actual: string = readGenerated(
                'operation',
                'generated/strict-unions',
            )
            const expected: string = readGeneratedSolution(
                'operation',
                'generated/strict-unions',
            )
            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a struct using includes', () => {
            const actual: string = readGenerated(
                'common',
                'generated/strict-unions',
            )
            const expected: string = readGeneratedSolution(
                'common',
                'generated/strict-unions',
            )
            assert.deepEqual(actual, expected)
        })

        it('should correctly generate an exception using includes', () => {
            const actual: string = readGenerated(
                'exceptions',
                'generated/strict-unions',
            )
            const expected: string = readGeneratedSolution(
                'exceptions',
                'generated/strict-unions',
            )
            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a service', () => {
            const actual: string = readGenerated(
                'shared',
                'generated/strict-unions',
            )
            const expected: string = readGeneratedSolution(
                'shared',
                'generated/strict-unions',
            )
            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a service using includes', () => {
            const actual: string = readGenerated(
                'calculator',
                'generated/strict-unions',
            )
            const expected: string = readGeneratedSolution(
                'calculator',
                'generated/strict-unions',
            )
            assert.deepEqual(actual, expected)
        })
    })

    describe('Thrift Server w/ Strict Unions', () => {
        it('should correctly generate a union', () => {
            const content: string = `
                union MyUnion {
                    1: i32 field1
                    2: i64 field2
                }
            `
            const expected: string = readSolution(
                'basic_union.strict_union',
                'thrift-server',
            )
            const actual: string = make(content, 'thrift-server', true)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a union with a union field', () => {
            const content: string = `
                union InnerUnion {
                    1: string name
                    2: i32 id
                }

                union MyUnion {
                    1: InnerUnion user
                    2: string field2
                }
            `
            const expected: string = readSolution(
                'nested_union.strict_union',
                'thrift-server',
            )
            const actual: string = make(content, 'thrift-server', true)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a service using a union', () => {
            const content: string = `
                union MyUnion {
                    1: i32 field1
                    2: i64 field2
                }

                service MyService {
                    string getUser(1: MyUnion arg1)
                    void ping()
                }
            `
            const expected: string = readSolution(
                'basic_service.strict_union',
                'thrift-server',
            )
            const actual: string = make(content, 'thrift-server', true)

            assert.deepEqual(actual, expected)
        })
    })

    describe('Thrift Server', () => {
        it('should correctly generate constants', () => {
            const content: string = `
                const i32 WHAT = 32
                const i32 VALUE = WHAT
                const list<i32> VALUE_LIST = [ VALUE ]
                const bool FALSE_CONST = false
                const i64 INT_64 = 64
                const set<string> SET_CONST = ['hello', 'world', 'foo', 'bar']
                const map<string,string> MAP_CONST = {'hello': 'world', 'foo': 'bar' }
                const map<i32,string> VALUE_MAP = { VALUE: 'world', 5: 'bar' }
                const list<string> LIST_CONST = ['hello', 'world', 'foo', 'bar']
            `
            const expected: string = readSolution(
                'complex_const',
                'thrift-server',
            )
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
            const expected: string = readSolution(
                'multi_field_struct',
                'thrift-server',
            )
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate an empty struct', () => {
            const content: string = `
                struct MyStruct {}
            `
            const expected: string = readSolution(
                'empty_struct',
                'thrift-server',
            )
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a struct with annotations', () => {
            const content: string = `
                struct MyStruct {
                    1: required i32 id = 45 ( foo = "bar", two = "three", lonely, dot.foo = "bar", dot.lonely )
                    2: required i64 bigID = 23948234
                } ( foo = "bar", two = "three", alone, dot.foo = "bar", dot.lonely )
            `
            const expected: string = readSolution(
                'annotations_struct',
                'thrift-server',
            )
            const actual: string = make(content)

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
            const expected: string = readSolution(
                'nested_struct',
                'thrift-server',
            )
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a struct containing a list of structs', () => {
            const content: string = `
                struct OtherStruct {
                    1: required i64 id
                    2: required binary name = "John"
                }

                struct MyStruct {
                    1: required list<OtherStruct> idList
                    2: required map<string,OtherStruct> idMap
                    3: required map<string, list<OtherStruct>> idMapList
                    4: required set<OtherStruct> idSet
                    5: required list<i64> intList
                    6: required list<list<OtherStruct>> listList
                    7: required list<list<string>> listListString
                    8: required map<i64, i64> i64KeyedMap
                }
            `
            const expected: string = readSolution(
                'complex_nested_struct',
                'thrift-server',
            )
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a union', () => {
            const content: string = `
                    union MyUnion {
                        1: i32 field1
                        2: i64 field2
                    }
                `
            const expected: string = readSolution(
                'basic_union',
                'thrift-server',
            )
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a union with annotations', () => {
            const content: string = `
                union MyUnion {
                    1: i32 field1 ( foo = "bar", two = "three", lonely, dot.foo = "bar", dot.lonely )
                    2: i64 field2
                } ( foo = "bar", two = "three", alone, dot.foo = "bar", dot.lonely )
            `
            const expected: string = readSolution(
                'annotations_union',
                'thrift-server',
            )
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate an empty union', () => {
            const content: string = `
                union MyUnion {}
            `
            const expected: string = readSolution(
                'empty_union',
                'thrift-server',
            )
            const actual: string = make(content)

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
            const expected: string = readSolution(
                'nested_union',
                'thrift-server',
            )
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate an exception', () => {
            const content: string = `
                exception MyException {
                    1: string message
                    2: i32 code = 200
                }
            `
            const expected: string = readSolution(
                'basic_exception',
                'thrift-server',
            )
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate an exception with annotations', () => {
            const content: string = `
                exception MyException {
                    1: string message ( foo = "bar", two = "three", lonely, dot.foo = "bar", dot.lonely )
                    2: i32 code = 200
                } ( foo = "bar", two = "three", alone, dot.foo = "bar", dot.lonely )
            `
            const expected: string = readSolution(
                'annotations_exception',
                'thrift-server',
            )
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate an exception with required fields', () => {
            const content: string = `
                exception MyException {
                    1: required string description
                    2: i32 code
                }
            `
            const expected: string = readSolution(
                'required_field_exception',
                'thrift-server',
            )
            const actual: string = make(content)

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
            const expected: string = readSolution(
                'nested_exception',
                'thrift-server',
            )
            const actual: string = make(content)

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
                    void saveUser(1: User user)
                    void ping()
                }
            `
            const expected: string = readSolution(
                'basic_service',
                'thrift-server',
            )
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a service with annotations', () => {
            const content: string = `
                struct User {
                    1: required string name
                    2: required i32 id
                }

                service MyService {
                    User getUser(1: i32 id) ( foo = "bar", two = "three", lonely, dot.foo = "bar", dot.lonely )
                    void saveUser(1: User user)
                    void ping()
                } ( foo = "bar", two = "three", alone, dot.foo = "bar", dot.lonely )
            `
            const expected: string = readSolution(
                'annotations_service',
                'thrift-server',
            )
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
                    string pong(1: optional string name)
                }
            `
            const expected: string = readSolution(
                'extend_service',
                'thrift-server',
            )
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a service that extends another service with annotations', () => {
            const content: string = `
                service ParentService {
                    string ping(1: i32 status) ( foo = "bar", two = "three", lonely )
                } ( foo = "boo", two = "three", alone )

                service ChildService extends ParentService {
                    string peg(1: string name)
                    string pong(1: optional string name)
                } ( foo = "bar", four = "five", secured )
            `
            const expected: string = readSolution(
                'annotations_extend_service',
                'thrift-server',
            )
            const actual: string = make(content)

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
            const expected: string = readSolution(
                'i64_service',
                'thrift-server',
            )
            const actual: string = make(content)

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
            const expected: string = readSolution(
                'throws_service',
                'thrift-server',
            )
            const actual: string = make(content)

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a service that throws multiple possible exceptions', () => {
            const content: string = `
                exception ServiceException {
                    1: string message
                }

                exception AuthException {
                    1: string message
                    2: i32 code
                }

                exception UnknownException {
                    1: string message
                }

                service MyService {
                    string peg(1: string name) throws (1: ServiceException exp, 2: AuthException authExp, 3: UnknownException unknownExp)
                }
            `
            const expected: string = readSolution(
                'throws_multi_service',
                'thrift-server',
            )
            const actual: string = make(content)

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
            const actual: string = make(content, 'apache')
            const expected: string = readSolution('basic_const')

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a type alias', () => {
            const content: string = `
                typedef string name
            `
            const expected: string = readSolution('basic_typedef')
            const actual: string = make(content, 'apache')

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
            const expected: string = readSolution('enum_typedef')
            const actual: string = make(content, 'apache')

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
            const expected: string = readSolution('complex_typedef')
            const actual: string = make(content, 'apache')

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
            const expected: string = readSolution('basic_enum')
            const actual: string = make(content, 'apache')

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
            const expected: string = readSolution('field_initialized_enum')
            const actual: string = make(content, 'apache')

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
            const expected: string = readSolution('multi_field_struct')
            const actual: string = make(content, 'apache')

            assert.deepEqual(actual, expected)
        })

        it('struct fields should default to optional', () => {
            const content: string = `
                struct MyStruct {
                    1: i32 id
                    2: string name
                }
            `
            const expected: string = readSolution('implicit_optional_struct')
            const actual: string = make(content, 'apache')

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a struct with a map field', () => {
            const content: string = `
                struct MyStruct {
                    1: required map<string,string> field1
                }
            `
            const expected: string = readSolution('map_struct')
            const actual: string = make(content, 'apache')

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a struct with a nested map field', () => {
            const content: string = `
                struct MyStruct {
                    1: required map<string,map<string,i32>> field1
                }
            `
            const expected: string = readSolution('nested_map_struct')
            const actual: string = make(content, 'apache')

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a struct with a list field', () => {
            const content: string = `
                struct MyStruct {
                    1: required list<string> field1
                }
            `
            const expected: string = readSolution('list_struct')
            const actual: string = make(content, 'apache')

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a struct with a nested list field', () => {
            const content: string = `
                struct MyStruct {
                    1: required list<list<string>> field1
                }
            `
            const expected: string = readSolution('nested_list_struct')
            const actual: string = make(content, 'apache')

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a struct with a set field', () => {
            const content: string = `
                struct MyStruct {
                    1: required set<string> field1
                }
            `
            const expected: string = readSolution('set_struct')
            const actual: string = make(content, 'apache')

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a struct with a nested set field', () => {
            const content: string = `
                struct MyStruct {
                    1: required set<set<string>> field1
                }
            `
            const expected: string = readSolution('nested_set_struct')
            const actual: string = make(content, 'apache')

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
            const expected: string = readSolution('return_id_struct')
            const actual: string = make(content, 'apache')

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
            const expected: string = readSolution('container_id_struct')
            const actual: string = make(content, 'apache')

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a class for an exception', () => {
            const content: string = `
                exception MyException {
                    1: required string message
                }
            `
            const expected: string = readSolution('basic_exception')
            const actual: string = make(content, 'apache')

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a class for a union', () => {
            const content: string = `
                union MyUnion {
                    1: string field1
                    2: string field2
                }
            `
            const expected: string = readSolution('basic_union')
            const actual: string = make(content, 'apache')

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a class for a union with nested container types', () => {
            const content: string = `
                union MyUnion {
                    1: string field1
                    2: list<list<string>> field2
                }
            `
            const expected: string = readSolution('nested_list_union')
            const actual: string = make(content, 'apache')

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a service', () => {
            const content: string = `
                service MyService {
                    void ping()
                }
            `
            const expected: string = readSolution('basic_service')
            const actual: string = make(content, 'apache')

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a service with i64 fields', () => {
            const content: string = `
                service MyService {
                    i64 add(1: i64 num1, 2: i64 num2)
                }
            `
            const expected: string = readSolution('i64_service')
            const actual: string = make(content, 'apache')

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
            const expected: string = readSolution('throws_service')
            const actual: string = make(content, 'apache')

            assert.deepEqual(actual, expected)
        })

        it('should correctly generate a service that throws multiple possible exceptions', () => {
            const content: string = `
                exception ServiceException {
                    1: string message
                }

                exception AuthException {
                    1: string message
                    2: i32 code
                }

                exception UnknownException {
                    1: string message
                }

                service MyService {
                    string peg(1: string name) throws (1: ServiceException exp, 2: AuthException authExp, 3: UnknownException unknownExp)
                }
            `
            const expected: string = readSolution('throws_multi_service')
            const actual: string = make(content, 'apache')

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
            const expected: string = readSolution('return_service')
            const actual: string = make(content, 'apache')

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
            const expected: string = readSolution('extend_service')
            const actual: string = make(content, 'apache')

            assert.deepEqual(actual, expected)
        })
    })
})
