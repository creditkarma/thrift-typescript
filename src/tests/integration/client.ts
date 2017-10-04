import {
  HttpConnection,
  createHttpClient,
  createHttpConnection,
  TBinaryProtocol,
  TBufferedTransport,
} from 'thrift'

import * as express from 'express'

import {
  Calculator,
  Operation,
  Work,
} from './codegen/tutorial/tutorial'

const config = {
  hostName: 'localhost',
  port: 8045
}

const app = express();

const options = {
  transport: TBufferedTransport,
  protocol: TBinaryProtocol,
  https: false,
  headers: {
    Host: config.hostName,
  }
}

const connection: HttpConnection = createHttpConnection(config.hostName, config.port, options)
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

const server = app.listen(8044, () => {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Web server listening at http://%s:%s', host, port);
})