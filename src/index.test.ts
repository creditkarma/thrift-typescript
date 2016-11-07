import { expect } from 'chai'
import { parseFile } from './index'

const simple = './fixtures/simple.thrift'

describe('Thrift Loader', () => {
  describe(`when loading a simple thrift file "${simple}"`, () => {
    let idl
    before((done) => {
      parseFile(simple).then((results) => {
        idl = results
        done()
      })
    })

    it('expect idl to exist', () => {
      expect(idl).to.exist
    })
  })
})
