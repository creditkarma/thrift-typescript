import { expect } from 'chai'
import { loadSchema } from './index'
import * as graphql from 'graphql'
import * as fs from 'fs'
import * as rimraf from 'rimraf'
import * as mkdirp from 'mkdirp'

const glob = './fixtures/**/*.graphql'
const invalidGlob = './error/*.graphql'
const invalidSchemaGlob = './fixtures/*.graphql'

const invalidGlobPattern = /has zero matches/
const invalidSchemaPattern = /Type .* not found in document./

describe('Sync Schema Loader', () => {
  describe(`when glob loading with complete schema "${glob}"`, () => {
    const schema = loadSchema.sync(glob)

    it('expect schema to be a graphql schema', () => {
      expect(schema).to.exist
      expect(schema).to.be.an.instanceof(graphql.GraphQLSchema)
    })
  })

  describe(`when loading an invalid glob "${invalidGlob}"`, () => {
    it('expect error to be triggered', () => {
      expect( () => loadSchema.sync(invalidGlob) ).to.throw(invalidGlobPattern)
    })
  })
  describe(`when loading glob with invalid schema ${invalidSchemaGlob}`, () => {
    it('expect schema errors to exist', () => {
      expect( () => loadSchema.sync(invalidSchemaGlob) ).to.throw(invalidSchemaPattern)
    })
  })
})

describe('Schema Loader', () => {
  describe(`when loading glob with complete schema "${glob}"`, () => {
    let schema
    let cbSchema
    before((done) => {
      loadSchema(glob).then((results) => {
        schema = results
        loadSchema(glob, (err, cbResults) => {
          cbSchema = cbResults
          done()
        })
      })
    })

    it('expect schema to be a graphql schema', () => {
      expect(schema).to.exist
      expect(schema).to.be.an.instanceof(graphql.GraphQLSchema)
    })

    it('expect callback schema to be a graphql schema', () => {
      expect(cbSchema).to.exist
      expect(cbSchema).to.be.an.instanceof(graphql.GraphQLSchema)
    })
  })

  describe(`when loading an invalid glob "${invalidGlob}"`, () => {
    let schemaErrors
    let cbSchemaErrors
    before((done) => {
      loadSchema(invalidGlob).catch((err) => {
        schemaErrors = err
        loadSchema(invalidGlob, (cbErr) => {
          cbSchemaErrors = cbErr
          done()
        })
      })
    })

    it('expect glob error to be triggered', () => {
      expect(schemaErrors).to.exist
      expect(schemaErrors.message).to.match(invalidGlobPattern)
    })

    it('expect callbaack glob error to be triggered', () => {
      expect(cbSchemaErrors).to.exist
      expect(cbSchemaErrors.message).to.match(invalidGlobPattern)
    })
  })

  describe(`when loading glob with invalid schema "${invalidSchemaGlob}"`, () => {
    let schemaErrors
    let cbSchemaErrors
    before((done) => {
      loadSchema(invalidSchemaGlob).catch((err) => {
        schemaErrors = err
        loadSchema(invalidSchemaGlob, (cbErr) => {
          cbSchemaErrors = cbErr
          done()
        })
      })
    })

    it('expect error to be invalidSchemaPattern', () => {
      expect(schemaErrors).to.exist
      expect(schemaErrors).to.match(invalidSchemaPattern)
    })
    it('expect callback error to be invalidSchemaPattern', () => {
      expect(schemaErrors).to.exist
      expect(schemaErrors).to.match(invalidSchemaPattern)
    })
  })

  describe('when loading glob with unreadable files', () => {
    const root = './fixtures/unreadable'
    const badGlob = `${root}/*.graphql`
    let results
    let cbResults
    before((done) => {
      mkdirp(root, () => {
        fs.writeFile(`${root}/schema.graphql`, 'hello', {mode: '333'}, (err) => {
          loadSchema(badGlob).catch((r) => {
            results = r
            loadSchema(badGlob, (cbr) => {
              cbResults = cbr
              rimraf(root, done)
            })
          })
        })
      })
    })

    it('expect error to exist', () => {
      expect(results).to.exist
    })
    it('expect callback error to exist', () => {
      expect(cbResults).to.exist
    })
  })
})
