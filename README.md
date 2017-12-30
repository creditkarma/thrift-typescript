# Thrift TypeScript

Generate TypeScript from Thrift IDL files.

## Installation

```sh
$ npm install --save @creditkarma/thrift-typescript
```

## Usage

Thrift TypeScript provides both a JavaScript and a command line API.

Given the following files

thrift/simple.thrift

```c
struct MyStruct {
    1: required int id,
    2: required bool field1,
    # 3: required string field,
    4: required i16 field,
}
```

You can generate TypeScript via the command line:

```sh
$ thrift-typescript --target apache --rootDir . --sourceDir thrift --outDir codegen simple.thrift
```

The available options are:

* --rootDir: This is used to resolve out and source directories. Defaults to current directory.
* --outDir: The directory to save generated files to. Will be created if it doesn't exist. Defaults to 'codegen'.
* --sourceDir: The directory to search for source Thrift files. Defaults to 'thrift'.
* --target: The core library to generate for, either 'apache' or 'thrift-server'. Defaults to 'apache'.

All other fields are assumed to be source files.

If no explicit list of files is provided all files ending in '.thrift' found in the sourceDir will be used.

You can gen code from more than one Thrift file:

```sh
$ thrift-typescript one.thrift two.thrift three.thrift
```

You can also generate files using the JavaScript API:

```typescript
import { generate } from '@creditkarma/thrift-typescript'

// Generates TypeScript and saves to given outDir
generate({
  rootDir: '.',
  sourceDir: 'thirft',
  outDir: 'codegen',
  target: 'apache',
  files: [
    'simple.thrift'
  ]
})
```

You can generate TypeScript from a string of Thrift without saving to file.

Note: This method of code generation does not support includes. The Thrift generator must be able to resolve all identifiers which it can't do without a description of the file structure.

```typescript
import { readFileSync } from 'fs'
import { make } from '@creditkarma/thrift-typescript'

const rawThrift: string = readFileSync('./thrift/simple.thrift', 'utf-8')
const generatedCode: string = make(rawThrift)
```

### Thrift Server

While Thrift TypeScript can be used to generate code comaptible with the [Apache Thrift Library](https://github.com/apache/thrift/tree/master/lib/nodejs), it is recommended to use with [Thrift Server](https://github.com/creditkarma/thrift-server). Details on the Apache usage are below.

Thrift Server adds Thrift support to Express or Hapi with plugins or middleware. The other advantange of using the codegen with Thrift Server is the addition of context to service clients and service handlers. Context can be used to do things like auth or tracing in Thrift service methods. Context is an optional final parameter to all service handler methods and all service client methods.

Install the Thrift Server implementation for your server of choice. For this example we will be using express middleware and the request http client library.

```sh
$ npm install --save @creditkarma/thrift-server-express
$ npm install --save @creditkarma/thrift-client
$ npm install --save express
$ npm install --save request
$ npm install --save @types/express
$ npm install --save @types/request
```

Given this service let's build a client and server based on our generated code.

```c
service Caluculator {
  i32 add(1: i32 left, 2: i32 right)
  i32 subtract(1: i32 left, 2: i32 right)
}
```

Run codegen for your Thrift service. The `target` option is required here, otherwise the generated code will only work with the Apache libs.

```sh
$ thrift-typescript --target thrift-server --rootDir . --sourceDir thrift --outDir codegen
```

#### Client

In this example we are using the Request library as our underlying connection instance. The options for Request (CoreOptions) are our request context.

You'll notice that the Client class is a generic. The type parameter represents the type of the context. For Request this is CoreOptions, for Axios this is AxiosRequestConfig.

```typescript
import {
  createClient,
  fromRequest,
  RequestConnection,
  RequestInstance,
} from '@creditkarma/thrift-client'

import * as request from 'request'
import { CoreOptions } from 'request'

import { Calculator } from './codegen/calculator'

const CONFIG = {
  hostName: 'localhost',
  port: 8045
}

const requestClient: RequestInstance = request.defaults({})
const connection: RequestConnection = fromRequest(requestClient, CONFIG)
const client: Calculator.Client<CoreOptions> = new Calculator.Client(connection)

client.add(5, 7, { headers: { 'X-Trace-Id': 'xxxxxx' } })
  .then((response: number) => {
    expect(response).to.equal(12)
    done()
  })
```

#### Server

In the server we can then inspect the headers we set in the client.

```typescript
import * as bodyParser from 'body-parser'
import * as express from 'express'
import { thriftExpress } from '@creditkarma/thrift-server-express'

import {
  Calculator,
  Operation,
  Work,
} from './codegen/calculator'

// express.Request is the context for each of the service handlers
const serviceHandlers: Calculator.IHandler<express.Request> = {
  add(left: number, right: number, context?: express.Request): number {
    if (context && context.headers['x-trace-id']) {
      // You can trace this request, perform auth, or use additional middleware to handle that.
    }
    return left + right
  },
  subtract(left: number, right: number, context?: express.Request): number {
    return left - right;
  },
}

const PORT = 8090

const app = express()

app.use(
  '/thrift',
  bodyParser.raw(),
  thriftExpress(Calculator.Processor, serviceHandlers),
)

app.listen(PORT, () => {
  console.log(`Express server listening on port: ${PORT}`)
})

```

### Apache Thrift

The generated code can also work with the [Apache Thrift Library](https://github.com/apache/thrift/tree/master/lib/nodejs).

```sh
$ npm install --save thrift
$ npm install --save @types/thrift
```

Given this service let's build a client and server based on our generated code.

```c
service Calculator {
  i32 add(1: i32 left, 2: i32 right)
  i32 subtract(1: i32 left, 2: i32 right)
}
```

Run codegen for your Thrift service. Here the `--target` option isn't needed as `apache` is the default build target.

```sh
$ thrift-typescript --rootDir . --sourceDir thrift --outDir codegen
```

#### Client

```typescript
import {
  createHttpConnection,
  createHttpClient,
  HttpConnection,
} from 'thrift'

import { Calculator } from './codegen/calculator'

// The location of the server endpoint
const CONFIG = {
  hostName: 'localhost',
  port: 8045
}

const options = {
  transport: TBufferedTransport,
  protocol: TBinaryProtocol,
  https: false,
  headers: {
    Host: config.hostName,
  }
}

const connection: HttpConnection = createHttpConnection(CONFIG.hostName, CONFIG.port, options)
const thriftClient: Calculator.Client = createHttpClient(Calculator.Client, connection)

// All client methods return a Promise of the expected result.
thriftClient.add(5, 6).then((result: number) =>{
  console.log(`result: ${result}`)
})
```

#### Server

```typescript
import {
  createWebServer,
  TBinaryProtocol,
  TBufferedTransport,
} from 'thrift'

import { Calculator } from './codegen/calculator'

// ServiceHandler: Implement the Calculator service
const myServiceHandler = {
  add(left: number, right: number): number {
    return left + right;
  },
  subtract(left: number, right: number): number {
    return left - right;
  },
};

// ServiceOptions: The I/O stack for the service
const myServiceOpts = {
  handler: myServiceHandler,
  processor: Calculator,
  protocol: TBinaryProtocol,
  transport: TBufferedTransport
};

// ServerOptions: Define server features
const serverOpt = {
   services: {
      '/': myServiceOpts
   }
}

// Create and start the web server
const port: number = 8045;
createWebServer(serverOpt).listen(port, () => {
  console.log(`Thrift server listening on port ${port}`)
});
```

### Notes

The gererated code can be used with many of the more strict tsc compiler options.

```json
{
  "compilerOptions": {
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true
  }
}
```

## Development

Install dependencies with

```sh
npm install
```

### Build

```sh
npm run build
```

### Run test in watch mode

```sh
npm run test:watch
```

## Contributing

For more information about contributing new features and bug fixes, see our [Contribution Guidelines](https://github.com/creditkarma/CONTRIBUTING.md).
External contributors must sign Contributor License Agreement (CLA)

## License

This project is licensed under [Apache License Version 2.0](./LICENSE)
