import { assert } from 'chai'
import { exec } from 'child_process'
import { generate } from '../../main/'

process.chdir(__dirname)

generate({
  rootDir: '.',
  outDir: 'codegen',
  sourceDir: 'thrift/',
  files: []
})

const clientProc = exec('../../../node_modules/.bin/ts-node ./client.ts')
const serverProc = exec('../../../node_modules/.bin/ts-node ./server.ts')

describe('Thrift TypeScript', () => {

  before((done) => {
    setTimeout(done, 5000)
  })

  it('should call an endpoint with no arguments', (done) => {
    exec('curl "http://localhost:8044/ping"', (err, stout, sterr) => {
      assert.equal(stout, 'success')
      done()
    });
  })

  it('should correctly call endpoint with arguments', (done) => {
    exec('curl "http://localhost:8044/calculate?left=3&op=add&right=5"', (err, stout, sterr) => {
      assert.equal(stout, 'result: 8')
      done()
    })
  })

  it('should correctly call endpoint with i64 args', (done) => {
    exec('curl "http://localhost:8044/add?left=5&right=6"', (err, stout, sterr) => {
      assert.equal(stout, 'result: 11')
      done()
    })
  })

  after((done) => {
    clientProc.kill()
    serverProc.kill()
    setTimeout(done, 1000)
  })
})