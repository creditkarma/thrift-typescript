import { assert } from 'chai'
import * as fs from 'fs'
import * as path from 'path'

import { DEFAULT_OPTIONS } from '../../main/options'
import { resolveFile } from '../../main/resolver'
import {
    ErrorType,
    IParsedFile,
    IResolvedFile,
    IThriftError,
} from '../../main/types'
import { parseSource, parseThriftString } from '../../main/utils'
import { validateFile } from '../../main/validator'

function loadSolution(name: string): any {
    return JSON.parse(
        fs.readFileSync(
            path.join(__dirname, `./fixtures/validator/${name}.solution.json`),
            'utf-8',
        ),
    )
}

function objectify(thrift: any): any {
    return JSON.parse(JSON.stringify(thrift))
}

describe('Thrift TypeScript Validator', () => {
    it('should return error if oneway keyword is not followed by void type', () => {
        const content: string = `
            service Test {
                oneway string test()
            }
        `
        const parsedFile: IParsedFile = parseSource(content)
        const resolvedFile: IResolvedFile = resolveFile(
            '',
            parsedFile,
            DEFAULT_OPTIONS,
        )
        const validatedFile: IResolvedFile = validateFile(resolvedFile)
        const expected: Array<IThriftError> = [
            {
                type: ErrorType.ValidationError,
                message:
                    'Oneway function must have return type of void, instead found string',
                loc: {
                    start: {
                        line: 3,
                        column: 24,
                        index: 51,
                    },
                    end: {
                        line: 3,
                        column: 37,
                        index: 64,
                    },
                },
            },
        ]

        assert.deepEqual(validatedFile.errors, expected)
    })

    it('should not return error if oneway keyword is followed by void type', () => {
        const content: string = `
            service Test {
                oneway void test()
            }
        `
        const parsedFile: IParsedFile = parseSource(content)
        const resolvedFile: IResolvedFile = resolveFile(
            '',
            parsedFile,
            DEFAULT_OPTIONS,
        )
        const validatedFile: IResolvedFile = validateFile(resolvedFile)
        const expected: Array<IThriftError> = []

        assert.deepEqual(validatedFile.errors, expected)
    })

    it('should return an error if a service tries to extend a non-service', () => {
        const content: string = `
            struct TestStruct {
                1: string field1;
            }

            service ServiceOne extends TestStruct {
                void ping()
            }
        `
        const parsedFile: IParsedFile = parseSource(content)
        const resolvedFile: IResolvedFile = resolveFile(
            '',
            parsedFile,
            DEFAULT_OPTIONS,
        )
        const validatedFile: IResolvedFile = validateFile(resolvedFile)
        const expected: Array<IThriftError> = [
            {
                type: ErrorType.ValidationError,
                message:
                    'Service type expected but found type StructDefinition',
                loc: {
                    start: {
                        line: 6,
                        column: 32,
                        index: 113,
                    },
                    end: {
                        line: 6,
                        column: 50,
                        index: 131,
                    },
                },
            },
        ]

        assert.deepEqual(validatedFile.errors, expected)
    })

    it('should not return an error if a service extends a service', () => {
        const content: string = `
            service ServiceOne {
                void sendMessage(1: string msg)
            }

            service ServiceTwo extends ServiceOne {
                void ping()
            }
        `
        const parsedFile: IParsedFile = parseSource(content)
        const resolvedFile: IResolvedFile = resolveFile(
            '',
            parsedFile,
            DEFAULT_OPTIONS,
        )
        const validatedFile: IResolvedFile = validateFile(resolvedFile)
        const expected: Array<IThriftError> = []

        assert.deepEqual(validatedFile.errors, expected)
    })

    it('should not return an error when using identifier as valid value', () => {
        const content: string = `
            const i32 VALUE = 32
            const list<i32> TEST = [ VALUE ]
        `
        const parsedFile: IParsedFile = parseSource(content)
        const resolvedFile: IResolvedFile = resolveFile(
            '',
            parsedFile,
            DEFAULT_OPTIONS,
        )
        const validatedFile: IResolvedFile = validateFile(resolvedFile)
        const expected: Array<IThriftError> = []

        assert.deepEqual(validatedFile.errors, expected)
    })

    it('should return an error if it finds incorrect list types', () => {
        const content: string = `
            const list<string> TEST = [ 32, 41, 65 ]
        `
        const parsedFile: IParsedFile = parseSource(content)
        const resolvedFile: IResolvedFile = resolveFile(
            '',
            parsedFile,
            DEFAULT_OPTIONS,
        )
        const validatedFile: IResolvedFile = validateFile(resolvedFile)
        const expected: Array<IThriftError> = [
            {
                type: ErrorType.ValidationError,
                message: 'Expected type string but found type number',
                loc: {
                    start: {
                        line: 2,
                        column: 41,
                        index: 41,
                    },
                    end: {
                        line: 2,
                        column: 43,
                        index: 43,
                    },
                },
            },
        ]

        assert.deepEqual(validatedFile.errors, expected)
    })

    it('should not return an error if it finds correct list types', () => {
        const content: string = `
            const list<i32> TEST = [ 32, 41, 65 ]
        `
        const parsedFile: IParsedFile = parseSource(content)
        const resolvedFile: IResolvedFile = resolveFile(
            '',
            parsedFile,
            DEFAULT_OPTIONS,
        )
        const validatedFile: IResolvedFile = validateFile(resolvedFile)
        const expected: Array<IThriftError> = []

        assert.deepEqual(validatedFile.errors, expected)
    })

    it('should return an error if it finds incorrect nested list types', () => {
        const content: string = `
            const list<list<string>> TEST = [ [ 32, 41, 65 ], [ 2, 3 ] ]
        `
        const parsedFile: IParsedFile = parseSource(content)
        const resolvedFile: IResolvedFile = resolveFile(
            '',
            parsedFile,
            DEFAULT_OPTIONS,
        )
        const validatedFile: IResolvedFile = validateFile(resolvedFile)
        const expected: Array<IThriftError> = [
            {
                type: ErrorType.ValidationError,
                message: 'Expected type string but found type number',
                loc: {
                    start: {
                        line: 2,
                        column: 49,
                        index: 49,
                    },
                    end: {
                        line: 2,
                        column: 51,
                        index: 51,
                    },
                },
            },
        ]

        assert.deepEqual(validatedFile.errors, expected)
    })

    it('should not return an error if it finds correct nested list types', () => {
        const content: string = `
            const list<list<i32>> TEST = [ [ 32, 41, 65 ], [ 2, 3 ] ]
        `
        const parsedFile: IParsedFile = parseSource(content)
        const resolvedFile: IResolvedFile = resolveFile(
            '',
            parsedFile,
            DEFAULT_OPTIONS,
        )
        const validatedFile: IResolvedFile = validateFile(resolvedFile)
        const expected: Array<IThriftError> = []

        assert.deepEqual(validatedFile.errors, expected)
    })

    it('should return an error if it finds incorrect set types', () => {
        const content: string = `
            const set<string> TEST = [ 32, 41, 65 ]
        `
        const parsedFile: IParsedFile = parseSource(content)
        const resolvedFile: IResolvedFile = resolveFile(
            '',
            parsedFile,
            DEFAULT_OPTIONS,
        )
        const validatedFile: IResolvedFile = validateFile(resolvedFile)
        const expected: Array<IThriftError> = [
            {
                type: ErrorType.ValidationError,
                message: 'Expected type string but found type number',
                loc: {
                    start: {
                        line: 2,
                        column: 40,
                        index: 40,
                    },
                    end: {
                        line: 2,
                        column: 42,
                        index: 42,
                    },
                },
            },
        ]

        assert.deepEqual(validatedFile.errors, expected)
    })

    it('should not return an error if it finds correct set types', () => {
        const content: string = `
            const set<i32> TEST = [ 32, 41, 65 ]
        `
        const parsedFile: IParsedFile = parseSource(content)
        const resolvedFile: IResolvedFile = resolveFile(
            '',
            parsedFile,
            DEFAULT_OPTIONS,
        )
        const validatedFile: IResolvedFile = validateFile(resolvedFile)
        const expected: Array<IThriftError> = []

        assert.deepEqual(validatedFile.errors, expected)
    })

    it('should return an error if it finds incorrect map types', () => {
        const content: string = `
            const map<string,string> TEST = { 'one': 1, 'two': 2 }
        `
        const parsedFile: IParsedFile = parseSource(content)
        const resolvedFile: IResolvedFile = resolveFile(
            '',
            parsedFile,
            DEFAULT_OPTIONS,
        )
        const validatedFile: IResolvedFile = validateFile(resolvedFile)
        const expected: Array<IThriftError> = [
            {
                type: ErrorType.ValidationError,
                message: 'Expected type string but found type number',
                loc: {
                    start: {
                        line: 2,
                        column: 54,
                        index: 54,
                    },
                    end: {
                        line: 2,
                        column: 55,
                        index: 55,
                    },
                },
            },
        ]

        assert.deepEqual(validatedFile.errors, expected)
    })

    it('should not return an error if it finds correct map types', () => {
        const content: string = `
            const map<string,string> TEST = { 'one': 'value one', 'two': 'value two' }
        `
        const parsedFile: IParsedFile = parseSource(content)
        const resolvedFile: IResolvedFile = resolveFile(
            '',
            parsedFile,
            DEFAULT_OPTIONS,
        )
        const validatedFile: IResolvedFile = validateFile(resolvedFile)
        const expected: Array<IThriftError> = []

        assert.deepEqual(validatedFile.errors, expected)
    })

    it('should return an error if it finds incorrect nested map types', () => {
        const content: string = `
            const map<string,map<string,string>> TEST = { 'one': { 'a': 1 }, 'two': { 'b': 4 } }
        `
        const parsedFile: IParsedFile = parseSource(content)
        const resolvedFile: IResolvedFile = resolveFile(
            '',
            parsedFile,
            DEFAULT_OPTIONS,
        )
        const validatedFile: IResolvedFile = validateFile(resolvedFile)
        const expected: Array<IThriftError> = [
            {
                type: ErrorType.ValidationError,
                message: 'Expected type string but found type number',
                loc: {
                    start: {
                        line: 2,
                        column: 73,
                        index: 73,
                    },
                    end: {
                        line: 2,
                        column: 74,
                        index: 74,
                    },
                },
            },
        ]

        assert.deepEqual(validatedFile.errors, expected)
    })

    it('should not return an error if it finds correct nested map types', () => {
        const content: string = `
            const map<string,map<string,string>> TEST = { 'one': { 'a': 'blah' }, 'two': { 'b': 'blam' } }
        `
        const parsedFile: IParsedFile = parseSource(content)
        const resolvedFile: IResolvedFile = resolveFile(
            '',
            parsedFile,
            DEFAULT_OPTIONS,
        )
        const validatedFile: IResolvedFile = validateFile(resolvedFile)
        const expected: Array<IThriftError> = []

        assert.deepEqual(validatedFile.errors, expected)
    })

    it('should return an error if it finds duplicate field IDs', () => {
        const content: string = `
            struct TestStruct {
                1: i32 field1
                1: string field2
            }
        `
        const parsedFile: IParsedFile = parseSource(content)
        const resolvedFile: IResolvedFile = resolveFile(
            '',
            parsedFile,
            DEFAULT_OPTIONS,
        )
        const validatedFile: IResolvedFile = validateFile(resolvedFile)
        const expected: Array<IThriftError> = [
            {
                type: ErrorType.ValidationError,
                message: 'Found duplicate usage of fieldID: 1',
                loc: {
                    start: {
                        line: 4,
                        column: 17,
                        index: 79,
                    },
                    end: {
                        line: 4,
                        column: 19,
                        index: 81,
                    },
                },
            },
        ]

        assert.deepEqual(validatedFile.errors, expected)
    })

    it('should return an error if unable to resolve type of identifier', () => {
        const content: string = `
            struct TestStruct {
                1: i32 test = status.Status.SUCCESS
            }
        `
        const parsedFile: IParsedFile = parseSource(content)
        const resolvedFile: IResolvedFile = resolveFile(
            '',
            parsedFile,
            DEFAULT_OPTIONS,
        )
        const validatedFile: IResolvedFile = validateFile(resolvedFile)
        const expected: Array<IThriftError> = [
            {
                type: ErrorType.ValidationError,
                message:
                    'Expected type number but found type status.Status.SUCCESS',
                loc: {
                    start: {
                        line: 3,
                        column: 31,
                        index: 63,
                    },
                    end: {
                        line: 3,
                        column: 52,
                        index: 84,
                    },
                },
            },
        ]

        assert.deepEqual(validatedFile.errors, expected)
    })

    it('should not return an error if assigning an int to and int field', () => {
        const content: string = `
            struct TestStruct {
                1: i32 test = 45
            }
        `
        const parsedFile: IParsedFile = parseSource(content)
        const resolvedFile: IResolvedFile = resolveFile(
            '',
            parsedFile,
            DEFAULT_OPTIONS,
        )
        const validatedFile: IResolvedFile = validateFile(resolvedFile)
        const expected: Array<IThriftError> = []

        assert.deepEqual(validatedFile.errors, expected)
    })

    it('should return an error if assigning a string to an int field', () => {
        const content: string = `
            struct TestStruct {
                1: i32 test = 'whoa'
            }
        `
        const parsedFile: IParsedFile = parseSource(content)
        const resolvedFile: IResolvedFile = resolveFile(
            '',
            parsedFile,
            DEFAULT_OPTIONS,
        )
        const validatedFile: IResolvedFile = validateFile(resolvedFile)
        const expected: Array<IThriftError> = [
            {
                type: ErrorType.ValidationError,
                message: 'Expected type number but found type string',
                loc: {
                    start: {
                        line: 3,
                        column: 31,
                        index: 63,
                    },
                    end: {
                        line: 3,
                        column: 37,
                        index: 69,
                    },
                },
            },
        ]

        assert.deepEqual(validatedFile.errors, expected)
    })

    it('should return an error when assigning an enum member to i32 field', () => {
        const content: string = `
            enum Status {
                SUCCESS,
                FAILURE
            }

            struct TestStruct {
                1: i32 test = Status.SUCCESS
            }
        `
        const parsedFile: IParsedFile = parseSource(content)
        const resolvedFile: IResolvedFile = resolveFile(
            '',
            parsedFile,
            DEFAULT_OPTIONS,
        )
        const validatedFile: IResolvedFile = validateFile(resolvedFile)
        const expected: Array<IThriftError> = [
            {
                type: ErrorType.ValidationError,
                message: 'Expected type number but found type Status.SUCCESS',
                loc: {
                    start: {
                        line: 8,
                        column: 31,
                        index: 153,
                    },
                    end: {
                        line: 8,
                        column: 45,
                        index: 167,
                    },
                },
            },
        ]

        assert.deepEqual(validatedFile.errors, expected)
    })

    it('should not return an error if assigning valid int to enum type', () => {
        const content: string = `
            enum TestEnum {
                ONE,
                TWO,
                THREE
            }

            const TestEnum test = 1
        `
        const parsedFile: IParsedFile = parseSource(content)
        const resolvedFile: IResolvedFile = resolveFile(
            '',
            parsedFile,
            DEFAULT_OPTIONS,
        )
        const validatedFile: IResolvedFile = validateFile(resolvedFile)
        const expected: Array<IThriftError> = []

        assert.deepEqual(validatedFile.errors, expected)
    })

    it('should return an error if assigning to enum out of range', () => {
        const content: string = `
            enum TestEnum {
                ONE,
                TWO,
                THREE
            }

            const TestEnum test = 6
        `
        const parsedFile: IParsedFile = parseSource(content)
        const resolvedFile: IResolvedFile = resolveFile(
            '',
            parsedFile,
            DEFAULT_OPTIONS,
        )
        const validatedFile: IResolvedFile = validateFile(resolvedFile)
        const expected: Array<IThriftError> = [
            {
                type: ErrorType.ValidationError,
                message: 'The value 6 is not assignable to type TestEnum',
                loc: {
                    start: {
                        line: 8,
                        column: 35,
                        index: 142,
                    },
                    end: {
                        line: 8,
                        column: 36,
                        index: 143,
                    },
                },
            },
        ]

        assert.deepEqual(validatedFile.errors, expected)
    })

    it('should add missing field IDs', () => {
        const content: string = `
            struct TestStruct {
                i32 status
                required string message
            }
        `
        const parsedFile: IParsedFile = parseSource(content)
        const resolvedFile: IResolvedFile = resolveFile(
            '',
            parsedFile,
            DEFAULT_OPTIONS,
        )
        const validatedFile: IResolvedFile = validateFile(resolvedFile)
        const expected: IResolvedFile = loadSolution('missing-ids')

        assert.deepEqual(
            objectify(validatedFile.identifiers),
            expected.identifiers,
        )
    })

    it('should validate types for includes', () => {
        const content: string = `
            include 'exception.thrift'

            exception MyException {
                1: exception.Status status = exception.Status.SUCCESS;
            }
        `
        const mockIncludeContent: string = `
            enum Status {
                SUCCESS,
                FAILURE
            }
        `
        const parsedFile: IParsedFile = {
            name: '',
            path: '',
            source: `
                include 'exception.thrift'

                exception MyException {
                    1: exception.Status status = exception.Status.SUCCESS;
                }
            `,
            includes: [
                {
                    name: 'exception',
                    path: '',
                    source: '',
                    includes: [],
                    ast: parseThriftString(mockIncludeContent),
                },
            ],
            ast: parseThriftString(content),
        }
        const resolvedFile: IResolvedFile = resolveFile(
            '',
            parsedFile,
            DEFAULT_OPTIONS,
        )
        const validatedFile: IResolvedFile = validateFile(resolvedFile)
        const expected: IResolvedFile = loadSolution('include-types')

        assert.deepEqual(
            objectify(validatedFile.identifiers),
            expected.identifiers,
        )
    })

    it('should not return an error if assigning an int with value 0 or 1 to a bool field', () => {
        const content: string = `
            struct TestStruct {
                1: bool testFalse = 0
                2: bool testTrue = 1
            }
        `
        const parsedFile: IParsedFile = parseSource(content)
        const resolvedFile: IResolvedFile = resolveFile(
            '',
            parsedFile,
            DEFAULT_OPTIONS,
        )
        const validatedFile: IResolvedFile = validateFile(resolvedFile)
        const expected: Array<IThriftError> = []

        assert.deepEqual(validatedFile.errors, expected)
    })

    it('should return an error if assigning an int with value not 0 or 1 to a bool field', () => {
        const content: string = `
            struct TestStruct {
                1: bool test = 2
            }
        `
        const parsedFile: IParsedFile = parseSource(content)
        const resolvedFile: IResolvedFile = resolveFile(
            '',
            parsedFile,
            DEFAULT_OPTIONS,
        )
        const validatedFile: IResolvedFile = validateFile(resolvedFile)
        const expected: Array<IThriftError> = [
            {
                type: ErrorType.ValidationError,
                message: 'Expected type boolean but found type number',
                loc: {
                    start: {
                        line: 3,
                        column: 32,
                        index: 64,
                    },
                    end: {
                        line: 3,
                        column: 33,
                        index: 65,
                    },
                },
            },
        ]

        assert.deepEqual(validatedFile.errors, expected)
    })

    it('should not return an error if assigning a binary to a string', () => {
        const content: string = `
            struct TestStruct {
                1: binary blob = "test"
            }
        `
        const parsedFile: IParsedFile = parseSource(content)
        const resolvedFile: IResolvedFile = resolveFile(
            '',
            parsedFile,
            DEFAULT_OPTIONS,
        )
        const validatedFile: IResolvedFile = validateFile(resolvedFile)
        const expected: Array<IThriftError> = []

        assert.deepEqual(validatedFile.errors, expected)
    })

    it('should return an error if assigning a binary to a number', () => {
        const content: string = `
            struct TestStruct {
                1: binary blob = 1
            }
        `
        const parsedFile: IParsedFile = parseSource(content)
        const resolvedFile: IResolvedFile = resolveFile(
            '',
            parsedFile,
            DEFAULT_OPTIONS,
        )
        const validatedFile: IResolvedFile = validateFile(resolvedFile)
        const expected: Array<IThriftError> = [
            {
                type: ErrorType.ValidationError,
                message: 'Expected type string but found type number',
                loc: {
                    start: {
                        line: 3,
                        column: 34,
                        index: 66,
                    },
                    end: {
                        line: 3,
                        column: 35,
                        index: 67,
                    },
                },
            },
        ]

        assert.deepEqual(validatedFile.errors, expected)
    })
})
