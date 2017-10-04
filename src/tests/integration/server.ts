import {
  createWebServer,
  TBinaryProtocol,
  TBufferedTransport,
} from 'thrift'

import {
  Calculator,
  Operation,
  Work,
} from './codegen/tutorial/tutorial'

import {
  SharedStruct
} from './codegen/shared/shared'

// ServiceHandler: Implement the hello service
const myServiceHandler = {
  ping(): void {},
    add(a: number, b: number): number {
      return a + b;
    },
    calculate(logId: number, work: Work): number {
      switch (work.op) {
        case Operation.ADD:
          return work.num1 + work.num2;
        case Operation.SUBTRACT:
          return work.num1 - work.num2;
        case Operation.DIVIDE:
          return work.num1 / work.num2;
        case Operation.MULTIPLY:
          return work.num1 * work.num2;
      }
    },
    zip(): void {},
    getStruct(): SharedStruct {
      return new SharedStruct();
    }
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
