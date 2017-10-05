# Thrift TypeScript

Generate TypeScript from Thrift IDL files.

## Installation

```sh
npm install --save @creditkarma/thrift-typescript
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
thrift-typescript --rootDir . --sourceDir thrift --outDir codegen simple.thrift
```

The available options are:

* --rootDir: This is used to resolve out and source directories. Defaults to current directory.
* --outDir: The directory to save generated files to. Will be created if it doesn't exist. Defaults to 'codegen'.
* --sourceDir: The directory to search for source Thrift files. Defaults to 'thrift'.

All other fields are assumed to be source files.

If no explicit list of files is provided all files ending in '.thrift' found in the sourceDir will be used.

You can gen code from more than one Thrift file:

```sh
thrift-typescript one.thrift two.thrift three.thrift
```

You can also generate files using the JavaScript API:

```typescript
import { generate } from '@creditkarma/thrift-typescript'

// Generates TypeScript and saves to given outDir
generate({
  rootDir: '.',
  sourceDir: 'thirft',
  outDir: 'codegen',
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

### Apache Thrift

The generated code works with the Apache Thrift nodejs library and the associated types. You will want to install these in your project.

```sh
npm install --save thrift
npm install --save @types/thrift
```

Given this service let's build a client and server based on our generated code.

```c
service Caluculator {
  i32 add(1: i32 left, 2: i32 right)
  i32 subtract(1: i32 left, 2: i32 right)
}
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
const config = {
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

const connection: HttpConnection = createHttpConnection(config.hostName, config.port, options)
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
