import {
  HttpConnection,
  createHttpClient,
  createHttpConnection,
  TBinaryProtocol,
  TBufferedTransport,
} from 'thrift'

import * as express from 'express'

import {
  MyService
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

const connection: HttpConnection = createHttpConnection(config.hostName, config.port, options)
const thriftClient: MyService.Client = createHttpClient(MyService.Client, connection)

connection.on('error', (err: Error) => {
  process.exit(1)
})

app.get('/ping', (req, res) => {
  thriftClient.ping(1).then((val: string) => {
    res.send(val)
  }, (err: any) => {
    res.send('fail')
  })
});

app.get('/peg', (req, res) => {
  thriftClient.peg().then((val: string) => {
    res.send(val)
  }, (err: any) => {
    res.send('fail')
  })
});

const server = app.listen(8044, () => {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Web server listening at http://%s:%s', host, port);
});