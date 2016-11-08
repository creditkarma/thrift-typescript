import { expect } from 'chai'
import { parseFile, generateCode, loadTemplate } from './index'

const simple = './fixtures/simple.thrift'
const typesTpl = './templates/types.handlebars'

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

  describe(`when loading tempalte from "${typesTpl}"`, () => {
    let tpl
    before((done) => {
      loadTemplate(simple).then((results) => {
        tpl = results
        done()
      })
    })

    it('expect template to exist', () => {
      expect(tpl).to.exist
    })
  })

  describe(`when generating types from thrift file "${simple}"`, () => {
    let types
    before((done) => {
      generateCode(simple).then((results) => {
        types = results
        done()
      })
    })

    it('expect types to exist', () => {
      expect(types).to.exist
    })
    it('expect only one class', () => {
      expect(types.length).to.equal(1)
    })
    it('expect class to contain MyStruct', () => {
      expect(types[0]).include('MyStruct')
    })
    it('expect class to contain id field to be a number', () => {
      expect(types[0]).include('id: number')
    })
  })
})
