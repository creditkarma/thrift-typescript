import { assert } from 'chai'
import * as fs from 'fs'
import * as path from 'path'
import { make } from './index'

function test(filestem: string) {
    const base = path.join(__dirname, `../fixtures/${filestem}`)
    const content = fs.readFileSync(`${base}.src.thrift`, 'utf-8')
    const expected = fs.readFileSync(`${base}.expected.ts`, 'utf-8')

    return () => {
        const actual = make(content)
        assert.equal(actual, expected)
    }
}

describe('Thrift TypeScript Generator', () => {

  it('should correctly generate a const', test('const'))

  it('should correctly generate a type alias', test('alias'))

  it('should correctly generate an enum', test('enum'))

  it('should correctly generate an enum with member initializer', test('enum-init'))

  it('should correctly generate a struct', test('struct'))

  it('should correctly generate a struct with a map field', test('struct-map'))

  it('should correctly generate a struct with a nested map field', test('struct-nested-map'))

  it('should correctly generate a struct with a list field', test('struct-list'))

  it('should correctly generate a struct with a nested list field', test('struct-nested-list'))

  it('should correctly generate a struct with a set field', test('struct-set'))

  it('should correctly generate a struct with a nested set field', test('struct-nested-set'))

  it('should correctly generate a struct with an identifier field type', test('struct-identifier'))

  it('should correctly generate a struct with an identifier inside of a container', test('struct-container-identifier'))
})
