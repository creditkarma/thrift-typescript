import {
  HttpConnection,
  createHttpClient,
  createHttpConnection,
  TBinaryProtocol,
  TBufferedTransport,
  Int64,
} from 'thrift'

import * as express from 'express'

import {
  Calculator,
  Operation,
  Work,
} from './codegen/tutorial/tutorial'

import {
  CLIENT_CONFIG,
  SERVER_CONFIG
} from './config'

const app = express();

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

function symbolToOperation(sym: string): Operation {
  switch (sym) {
    case 'add':
      return Operation.ADD;
    case 'subtract':
      return Operation.SUBTRACT;
    case 'multiply':
      return Operation.MULTIPLY;
    case 'divide':
      return Operation.DIVIDE;
    default:
      throw new Error(`Unrecognized operation: ${sym}`);
  }
}

app.get('/ping', (req, res) => {
  thriftClient.ping().then(() => {
    res.send('success')
  }, (err: any) => {
    res.send('fail')
  })
})

app.get('/add', (req, res) => {
  const left: Int64 = new Int64(req.query.left)
  const right: Int64 = new Int64(req.query.right)
  thriftClient.add(left, right).then((val: Int64) => {
    res.send(`result: ${val.toNumber()}`)
  }, (err: any) => {
    res.status(500).send(err)
  })
})

app.get('/calculate', (req, res) => {
  const work: Work = new Work({
    num1: req.query.left,
    num2: req.query.right,
    op: symbolToOperation(req.query.op)
  })
  thriftClient.calculate(1, work).then((val: number) => {
    res.send(`result: ${val}`)
  }, (err: any) => {
    res.status(500).send(err);
  })
})

app.listen(CLIENT_CONFIG.port, () => {
  console.log(`Web server listening at http://${CLIENT_CONFIG.hostName}:${CLIENT_CONFIG.port}`);
})
