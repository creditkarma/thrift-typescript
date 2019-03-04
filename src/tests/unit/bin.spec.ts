import { assert } from 'chai'
import { resolveOptions } from '../../main/bin/resolveOptions'
import { IMakeOptions } from '../../main/types'

describe('resolveOptions', () => {
    it('should return defaults with empty options', async () => {
        const result: IMakeOptions = resolveOptions([])

        assert.deepEqual(result, {
            rootDir: '.',
            outDir: './codegen',
            sourceDir: './thrift',
            target: 'apache',
            files: [],
            fallbackNamespace: 'java',
            library: 'thrift',
            strictUnions: false,
        })
    })

    it('should correctly merge options with defaults', async () => {
        const result: IMakeOptions = resolveOptions([
            '--rootDir',
            'src',
            '--fallbackNamespace',
            'scala',
            'test.thrift',
            'test-two.thrift',
        ])

        assert.deepEqual(result, {
            rootDir: 'src',
            outDir: './codegen',
            sourceDir: './thrift',
            target: 'apache',
            files: ['test.thrift', 'test-two.thrift'],
            fallbackNamespace: 'scala',
            library: 'thrift',
            strictUnions: false,
        })
    })
})
