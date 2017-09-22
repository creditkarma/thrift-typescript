import {
  Connection,
  createClient,
  createHttpConnection,
  TBinaryProtocol,
  TBufferedTransport,
} from 'thrift'

import * as express from 'express'

import * as MyService from './codegen/com/creditkarma/service'

import {
  Client
} from './codegen/com/creditkarma/service'

const config = {
  hostName: 'localhost',
  port: 8045
}

// const express = require('express')
const app = express();

const options = {
  transport: TBufferedTransport,
  protocol: TBinaryProtocol,
  https: false,
  headers: {
    Host: config.hostName,
  }
}

const connection: Connection = createHttpConnection(config.hostName, config.port, options)
const thriftClient: Client = createClient(MyService, connection)

connection.on('error', (err: Error) => {
  console.log('err: ', err)
  process.exit(1)
})

app.get('/', (req, res) => {
  thriftClient.ping(1).then((val: string) => {
    res.send(val)
  })
});

const server = app.listen(8044, () => {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Web server listening at http://%s:%s', host, port);
});