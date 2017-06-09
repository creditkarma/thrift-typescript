import { expect } from 'chai'
import { parseFile, generateIDLTypes } from './index'
import {
  generateIDLTypes as generateIDLTypesHbs,
  generateIDLServices as generateIDLServicesHbs,
  loadTemplate
} from './handlebars'

const simple = './fixtures/simple.thrift'
const complex = './fixtures/complex.thrift'
const calculator = './fixtures/calculator.thrift'
const typesTpl = 'types.hbs'

describe('Thrift Loader', () => {
  describe(`when loading a simple thrift file "${simple}"`, () => {
    let idl
    before(() => {
      return parseFile(simple).then((results) => {
        idl = results
      })
    })

    it('expect idl to exist', () => {
      expect(idl).to.exist
    })
  })

  describe(`when loading template from "${typesTpl}"`, () => {
    let tpl
    before(() => {
      return loadTemplate(typesTpl).then((results) => {
        tpl = results
      })
    })

    it('expect template to exist', () => {
      expect(tpl).to.exist
    })
  })

  describe(`when generating types from thrift file "${simple}"`, () => {
    let types
    before(() => {
      return generateIDLTypesHbs(simple).then((results) => {
        types = results
      })
    })

    it('expect types to exist', () => {
      expect(types).to.exist
    })
    it('expect only one class', () => {
      expect((types.match(/class/g) || []).length).to.equal(1)
    })
    it('expect class to contain MyStruct', () => {
      expect(types).include('class MyStruct')
    })
    it('expect class to contain id field to be a number', () => {
      expect(types).include('id: number')
    })
  })

  describe(`AST: when generating types from thrift file "${simple}"`, () => {
    let types
    before(() => {
      return generateIDLTypes(simple).then((results) => {
        types = results
      })
    })
    let handlebars
    before(() => {
      return generateIDLTypesHbs(simple).then((results) => {
        handlebars = results
      })
    })

    it('expect types to exist', () => {
      expect(types).to.exist
    })
    it('expect only one class', () => {
      expect((types.match(/class/g) || []).length).to.equal(1)
    })
    it('expect class to contain MyStruct', () => {
      expect(types).include('class MyStruct')
    })
    it('expect class to contain id field to be a number', () => {
      expect(types).include('id: number')
    })
    it('matches handlebars', () => {
      expect(types).equals(handlebars);
    })
  })

  describe(`AST: when generating types from thrift file "${complex}"`, () => {
    let types
    before(() => {
      return generateIDLTypes(complex).then((results) => {
        types = results
      })
    })

    it('expect types to exist', () => {
      expect(types).to.exist
    })
  })

  describe(`when generating services from thrift file "${simple}"`, () => {
    let services
    before(() => {
      return generateIDLServicesHbs(simple).then((results) => {
        services = results
      })
    })

    it('expect services to exist', () => {
      expect(services).to.exist
    })
    it('expect 6 classes', () => {
      expect((services.match(/class/g) || []).length).to.equal(6)
    })
    it('expect class to contain Service1PingArgs', () => {
      expect(services).include('class Service1PingArgs')
    })
    it('expect class to contain Service1TestArgs', () => {
      expect(services).include('class Service1TestArgs')
    })
    it('expect class to contain Service1Client', () => {
      expect(services).include('class Service1Client')
    })
    it('expect class to contain property', () => {
      expect(services).include('public ms: ttypes.MyStruct')
    })
  })

  describe(`when generating services from thrift file "${calculator}"`, () => {
    let services
    before(() => {
      return generateIDLServicesHbs(calculator).then((results) => {
        services = results
      });
    })

    it('expect services to exist', () => {
      expect(services).to.exist
    })
    it('expect 4 classes', () => {
      expect((services.match(/class/g) || []).length).to.equal(4)
    })
    it('expect class to contain CalculatorAddArgs', () => {
      expect(services).include('class CalculatorAddArgs')
    })
    it('expect add method with params', () => {
      expect(services).include('add(x: number, y: number, callback)')
    })
  })
})
