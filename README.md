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
    target: 'thrift-server',
    files: [
        'simple.thrift'
    ],
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

## Thrift Server

While Thrift TypeScript can be used to generate code comaptible with the [Apache Thrift Library](https://github.com/apache/thrift/tree/master/lib/nodejs), it is recommended to use with [Thrift Server](https://github.com/creditkarma/thrift-server). Details on the Apache usage are below.

Thrift Server adds Thrift support to Express or Hapi with plugins or middleware. The other advantange of using the codegen with Thrift Server is the addition of context to service clients and service handlers. Context can be used to do things like auth or tracing in Thrift service methods. Context is an optional final parameter to all service handler methods and all service client methods.

Install the Thrift Server implementation for your server of choice. For this example we will be using express middleware and the request http client library.

```sh
$ npm install --save @creditkarma/thrift-server-core
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

### Client

In this example we are using the Request library as our underlying connection instance. The options for Request (CoreOptions) are our request context.

You'll notice that the Client class is a generic. The type parameter represents the type of the context. This is usually going to be of type `CoreOptions` from the Request library.

```typescript
import {
    createHttpClient,
    HttpConnection,
} from '@creditkarma/thrift-client'

import * as request from 'request'
import { CoreOptions } from 'request'

import { Calculator } from './codegen/calculator'

const CONFIG = {
    hostName: 'localhost',
    port: 8045
}

const thriftClient: Calculator.Client<CoreOptions> = createHttpClient(Calculator.Client, CONFIG)

thriftClient.add(5, 7, { headers: { 'X-Trace-Id': 'xxxxxx' } })
    .then((response: number) => {
        expect(response).to.equal(12)
        done()
    })
```

### Server

In the server we can then inspect the headers we set in the client.

```typescript
import * as bodyParser from 'body-parser'
import * as express from 'express'
import { ThriftServerExpress } from '@creditkarma/thrift-server-express'

import {
    Calculator,
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
    ThriftServerExpress(Calculator.Processor, serviceHandlers),
)

app.listen(PORT, () => {
    console.log(`Express server listening on port: ${PORT}`)
})

```

### Generated Data Types

When generating TypeScript from Thrift source what data types are generated?

#### Simple Types

These are: booleans, strings, numbers, sets, maps, lists, enums and typedefs. All of these translate almost directly to TypeScript.

Given Thrift:

```c
const bool FALSE_CONST = false
const i32 INT_32 = 32
const i64 INT_64 = 64
const list<string> LIST_CONST = ['hello', 'world', 'foo', 'bar']
const set<string> SET_CONST = ['hello', 'world', 'foo', 'bar']
const map<string,string> MAP_CONST = { 'hello': 'world', 'foo': 'bar' }

enum Colors {
    RED,
    GREEN,
    BLUE,
}

typedef string name
```

Generated TypeScript:

```typescript
export const FALSE_CONST: boolean = false;
export const INT_32: number = 32;
export const INT_64: thrift.Int64 = new thrift.Int64(64);
export const LIST_CONST: Array<string> = ["hello", "world", "foo", "bar"];
export const SET_CONST: Set<string> = new Set(["hello", "world", "foo", "bar"]);
export const MAP_CONST: Map<string, string> = new Map([["hello", "world"], ["foo", "bar"]]);

export enum Colors {
    RED,
    GREEN,
    BLUE
}

export type name = string;
```

The only interesting thing here is the handling of `i64`. JavaScript doesn't support a full 64-bits of integer percision, so we wrap the value in an `Int64` object. You will notice that this doesn't really help in cases where you define a constant or default value in your Thrift file, but it does allow 64-bit integers received from outside of JS to be handled correctly. The object is exported from `@creditkarma/thrift-server-core` and extends [node-int64](https://github.com/broofa/node-int64).

#### Struct

A struct is intuitively analogous to an interface.

Given Thrift:

```c
struct User {
    1: required string name
    2: string email
    3: required i32 id
}
```

Generated TypeScript:

```typescript
export interface IUser {
    name: string
    email?: string
    id: number
}
```

*Note: We adopt the convention of prefixing interfaces names with a capital 'I'.*

Only fields that are explicitly required loose the `?`.

#### Union

Unions in Thrift are very similar to structs. The difference is they only allow one field to be set. They also require that one field is set. Implicitly all fields are optional, but one field must be set.

So, this translates into a struct with all optional fields:

Given Thrift:

```c
union MyUnion {
    1: string option1
    2: i32 option2
}
```

Generated TypeScript (with 'strictUnions' set to 'false'):

```typescript
export interface IMyUnion = {
    option1?: string
    option2?: undefined
}
```

*Note: The difference here is that a runtime error will be raised if one of the fields isn't set or if more than one of the fields is set.*

#### Exception

Exceptions are errors that can be thrown by service methods. It is more natural in JS/TS to create and throw new errors. So our defined exceptions will become JS classes.

Given Thrift:

```c
exception MyException {
    1: string message
    2: i32 code
}
```

Generated TypeScript:

```typescript
export class MyException extends thrift.StructLike implements IMyException {
    public message: string
    public code?: number
    constructor(args?: { message?: string, code?: number }) {
        // ...
    }
}
```

Then in your service client you could just throw the exception as you would any JS error `throw new MyException({ message: 'whoops', code: 500 });`

#### Service

Services are a little more complex. There are two parts to a service. There is the `Client` for sending service requests and the `Processor` for handling service requests. The service `Client` and the service `Processor` are each generated classes. They are wrapped, along with some other internal objects, in a `namespace` that has the name of your service.

Given Thrift:

```c
service MyService {
    User getUser(1: i32 id) throws (1: MyException exp);
}
```

Generated TypeScript:

```typescript
export namespace MyService {
    export class Client<Context> {
        constructor(connection: thrift.IThriftConnection<Context>) {
            // ...
        }
        getUser(id: number): Promise<User> {
            // ...
        }
    }
    export interface IHandler<Context> {
        getUser(id: number, context?: Context): User | Promise<User>
    }
    export class Processor {
        constructor(handler: IHandler<Context>) {
            // ...
        }
        public process(input: thrift.TProtocol, output: thrift.TProtocol, context: Context): Promise<Buffer> {
            // ...
        }
    }
}
```

The `Client` is pretty straight forward. You create a `Client` instance and you can call service methods on it. The inner-workings of the `Processor` aren't something consumers need to concern themselves with. The more interesting bit is `IHandler`. This is the interface that service teams need to implement in order to meet the promises of their service contract. Create an object that satisfies `<service-name>.IHandler` and pass it to the construction of `<service-name>.Processor` and everything else is handled for you.

#### Loose Interfaces

Given these two structs:

```c
struct User {
    1: required i64 id
}

struct Profile {
    1: required User user
    2: binary data
    3: i64 lastModified
}
```

There is something of a difference between how we want to handle things in TypeScript and how data is going to be sent over the wire. Because of this when we generate interfaces for these structs we generate two interfaces for each struct, one is an exact representation of the Thrift, the other is something looser that more represents how the data will be worked with in TypeScript.

The main difference is that fields marked as `i64` can be represented as either `number` or an `Int64` object and `binary` can be represented as either a `string` or a `Buffer` object.

Generated TypeScript:

```typescript
interface IUser {
    id: thrift.Int64
}
interface IUserArgs {
    id: number | thrift.Int64
}
interface IProfile {
    user: IUser
    data?: Buffer
    lastModified?: thrift.Int64
}
interface IProfileArgs {
    user: IUserArgs
    data?: string | Buffer
    lastModified?: number | thrift.Int64
}
```

The names of loose interfaces just append `Args` onto the end of the interface name. The reason for this is these interfaces will most often be used as arguments in your code.

Where are the loose interfaces used? The loose interfaces can be passed to client methods.

If we had this service:

```c
service ProfileService {
    Profile getProfileForUser(1: User user)
}
```

And generated TypeScript:

```typescript
namespace ProfileService {
    export class Client<Context> {
        constructor(connection: thrift.IThriftConnection<Context>) {
            // ...
        }
        getProfileForUser(user: IUserArgs): Promise<Profile> {
            // ...
        }
    }
    // Handler, Processor
}
```

We can use a `User` object where the `id` is a `number` without having to wrap it in `Int64`. These conversions are handled for us, similarly `string` data can be passed to a `binary` field and the conversion to `Buffer` is handled under the hood. This are just convinience interfaces to make handling the Thrift objects in TypeScript a little easier. You will notice service methods always return an object of the more strict interface. Also, the more strict interface can always be passed where the loose interface is expected.

#### Sending Data Over the Wire

When it comes to struct-like data types (struct, union and exception) usually you don't need to know much more than what data types are generated. However, in addition to the generated interface/union/class the code generator also creates a companion object that knows how to send the given object over the wire.

Looking back at the `User` object from our struct example, in addition to the interface, the code generator creates a codec object like this:

```typescript
export const UserCodec: thrift.IStructCodec<IUserArgs, IUser> {
    encode(obj: IUserArgs, output: thrift.TProtocol): void {
        // ...
    },
    decode(input: thrift.TProtocol): IUser {
        // ...
    }
}
```

It's just an object that knows how to read the given object from a Thrift Protocol or write the given object to a Thrift Protocol.

The codec will always follow this naming convention, just appending 'Codec' onto the end of your struct name.

## Apache Thrift

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

### Client

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

### Server

```typescript
import {
    createWebServer,
    TBinaryProtocol,
    TBufferedTransport,
} from 'thrift'

import { Calculator } from './codegen/calculator'

// Handler: Implement the Calculator service
const myServiceHandler = {
    add(left: number, right: number): number {
        return left + right
    },
    subtract(left: number, right: number): number {
        return left - right
    },
}

// ServiceOptions: The I/O stack for the service
const myServiceOpts = {
    handler: myServiceHandler,
    processor: Calculator,
    protocol: TBinaryProtocol,
    transport: TBufferedTransport
}

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
})
```

## Notes

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
