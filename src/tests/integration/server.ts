import {
  createWebServer,
  TBinaryProtocol,
  TBufferedTransport,
  Int64,
} from 'thrift'

import {
  Calculator,
  Operation,
  Work,
} from './codegen/tutorial/tutorial'

import {
  SharedStruct
} from './codegen/shared/shared'

import {
  SERVER_CONFIG
} from './config'

function delay(val: number): Promise<number> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(val)
    }, 1000)
  })
}

// ServiceHandler: Implement the hello service
const myServiceHandler = {
  ping(): void {},
  add(a: Int64, b: Int64): Int64 {
    return new Int64(a.toNumber() + b.toNumber())
  },
  calculate(logId: number, work: Work): Promise<number> {
    switch (work.op) {
      case Operation.ADD:
        return delay(work.num1 + work.num2)
      case Operation.SUBTRACT:
        return delay(work.num1 - work.num2)
      case Operation.DIVIDE:
        return delay(work.num1 / work.num2)
      case Operation.MULTIPLY:
        return delay(work.num1 * work.num2)
    }
  },
  zip(): void {},
  getStruct(): SharedStruct {
    return new SharedStruct()
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
createWebServer(serverOpt).listen(SERVER_CONFIG.port, () => {
  console.log(`Thrift server listening on port ${SERVER_CONFIG.port}`)
});
