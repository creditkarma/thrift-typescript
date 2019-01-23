import { assert } from 'chai'
import * as fs from 'fs'
import * as path from 'path'

import { resolveFile } from '../../main/resolver'
import { parseThriftString } from '../../main/utils'

import { DEFAULT_OPTIONS } from '../../main/options'
import { IParsedFile, IResolvedFile } from '../../main/types'

function loadSolution(name: string): any {
    return JSON.parse(
        fs.readFileSync(
            path.join(__dirname, `./fixtures/resolver/${name}.solution.json`),
            'utf-8',
        ),
    )
}

function objectify(thrift: any): any {
    return JSON.parse(JSON.stringify(thrift))
}

describe('Thrift TypeScript Resolver', () => {
    it('should find and resolve imported identifiers as types', () => {
        const content: string = `
            include 'exception.thrift'

            service MyService {
                void ping() throws (1: exception.MyException exp)
            }
        `
        const mockIncludeContent = `
            exception MyException {
                1: required string message
            }
        `
        const mockParsedFile: IParsedFile = {
            name: 'test',
            path: '',
            source: '',
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
        const actual: IResolvedFile = resolveFile(
            '',
            mockParsedFile,
            DEFAULT_OPTIONS,
        )
        const expected: IResolvedFile = loadSolution('imported-id-types')

        assert.deepEqual(
            objectify(actual.identifiers),
            objectify(expected.identifiers),
        )
    })

    it('should find and resolve imported identifiers as values', () => {
        const content: string = `
            include 'exception.thrift'

            struct MyStruct {
                1: exception.Status status = exception.Status.SUCCESS
            }
        `
        const mockIncludeContent: string = `
            enum Status {
                SUCCESS,
                FAILURE
            }
        `
        const mockParsedFile: IParsedFile = {
            name: 'test',
            path: '',
            source: '',
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
        const actual: IResolvedFile = resolveFile(
            '',
            mockParsedFile,
            DEFAULT_OPTIONS,
        )
        const expected: IResolvedFile = loadSolution('imported-id-values')

        assert.deepEqual(
            objectify(actual.identifiers),
            objectify(expected.identifiers),
        )
    })
})
