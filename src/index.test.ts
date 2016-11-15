import { expect } from 'chai'
import { parseFile, generateCode, loadTemplate, generateServiceScript } from './index'

const simple = './fixtures/simple.thrift'
const calculator = './fixtures/calculator.thrift'
const typesTpl = 'types.hbs'

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

  describe(`when loading template from "${typesTpl}"`, () => {
    let tpl
    before((done) => {
      loadTemplate(typesTpl).then((results) => {
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

  describe(`when generating services from thrift file "${simple}"`, () => {
    let services
    before((done) => {
      generateServiceScript(simple).then((results) => {
        services = results
        done()
      })
    })

    it('expect services to exist', () => {
      expect(services).to.exist
    })
    it('expect only one class', () => {
      expect(services.length).to.equal(1)
    })
    it('expect class to contain Service1PingArgs', () => {
      expect(services[0]).include('class Service1PingArgs')
    })
    it('expect class to contain Service1TestArgs', () => {
      expect(services[0]).include('class Service1TestArgs')
    })
    it('expect class to contain Service1Client', () => {
      expect(services[0]).include('class Service1Client')
    })
    it('expect class to contain property', () => {
      expect(services[0]).include('public ms: MyStruct')
    })
  })

  describe(`when generating services from thrift file "${calculator}"`, () => {
    let services
    before((done) => {
      generateServiceScript(simple).then((results) => {
        services = results
        done()
      })
    })

    it('expect services to exist', () => {
      expect(services).to.exist
    })
    it('expect only one class', () => {
      expect(services.length).to.equal(1)
    })
  })
})
