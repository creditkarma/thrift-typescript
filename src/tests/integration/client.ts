import {
  Connection,
  createClient,
  createHttpConnection,
  TBinaryProtocol,
  TBufferedTransport,
} from 'thrift'

import * as express from 'express'

import * as MyService from './thrift/test'

import {
  Client
} from './thrift/test'

const config = {
  hostName: 'localhost',
  port: 8080
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
})

app.get('/', (req, res) => {
  thriftClient.ping('hello').then((val: string) => {
    res.send(val)
  })
});

const server = app.listen(8000, () => {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Web server listening at http://%s:%s', host, port);
});