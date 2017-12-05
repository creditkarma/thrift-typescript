import { assert } from 'chai'

import {
  HttpConnection,
  createHttpClient,
  createHttpConnection,
  TBufferedTransport,
  TBinaryProtocol,
  Int64,
} from 'thrift'

import {
  Calculator,
  Operation,
  Work,
} from './codegen/calculator/calculator'

import './server'

import {
  SERVER_CONFIG
} from './config'

describe('Thrift TypeScript', () => {
  const options = {
    transport: TBufferedTransport,
    protocol: TBinaryProtocol,
    https: false,
    headers: {
      Host: SERVER_CONFIG.hostName,
    }
  }
  const connection: HttpConnection = createHttpConnection(SERVER_CONFIG.hostName, SERVER_CONFIG.port, options)
  const thriftClient: Calculator.Client = createHttpClient(Calculator.Client, connection)

  connection.on('error', (err: Error) => {
    process.exit(1)
  })

  // Allow servers to spin up
  before((done) => {
    setTimeout(done, 5000)
  })

  it('should call an endpoint with no arguments', (done) => {
    thriftClient.ping().then((val: any) => {
      assert.equal(val, undefined)
      done()
    }, (err: any) => {
      done(err)
    })
  })

  it('should correctly call endpoint with arguments', (done) => {
    const add: Work = new Work({
      num1: 4,
      num2: 8,
      op: Operation.ADD
    })

    const subtract: Work = new Work({
      num1: 67,
      num2: 13,
      op: Operation.SUBTRACT
    })

    Promise.all([
      thriftClient.calculate(1, add),
      thriftClient.calculate(1, subtract)
    ]).then((val: Array<number>) => {
      assert.equal(val[0], 12)
      assert.equal(val[1], 54)
      done()
    }, (err: any) => {
      done(err)
    })
  })

  it('should correctly call endpoint with i64 args', (done) => {
    const left: Int64 = new Int64(5)
    const right: Int64 = new Int64(3)

    thriftClient.add(left, right).then((val: Int64) => {
      assert.equal(val.toNumber(), 8)
      done()
    }, (err: any) => {
      done(err)
    })
  })
})
