import { assert } from 'chai'
import * as fs from 'fs'
import * as path from 'path'

import { resolveFile } from '../../main/resolver'
import { parseThriftString } from '../../main/utils'

import { DEFAULT_OPTIONS } from '../../main/options'
import ResolverFile from '../../main/resolver/file'
import ResolverSchema from '../../main/resolver/schema'
import { IParsedFile } from '../../main/types'

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

function serializeSchema(schema: ResolverSchema) {
    return {
        files: [...schema.files.entries()].map(([fileName, file]) => ({
            fileName,
            body: file.body,
            identifiers: [...file.identifiers.keys()].map((identifier) =>
                file.resolveIdentifier(identifier),
            ),
            includes: [...file.includes.values()].map(
                (include) => include.fileName,
            ),
        })),
        namespaces: [...schema.namespaces.entries()].map(
            ([name, namespace]) => ({
                name,
                files: [...namespace.files.values()].map(
                    (file) => file.fileName,
                ),
            }),
        ),
    }
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
        const resolvedFile: ResolverFile = resolveFile(
            '',
            mockParsedFile,
            new ResolverSchema(DEFAULT_OPTIONS),
        )

        const actual = serializeSchema(resolvedFile.schema)
        const expected = loadSolution('imported-id-types')

        assert.deepEqual(objectify(actual), objectify(expected))
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
        const resolvedFile: ResolverFile = resolveFile(
            '',
            mockParsedFile,
            new ResolverSchema(DEFAULT_OPTIONS),
        )

        const actual = serializeSchema(resolvedFile.schema)
        const expected = loadSolution('imported-id-values')

        assert.deepEqual(objectify(actual), objectify(expected))
    })
})
