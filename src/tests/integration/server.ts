import {
  createWebServer,
  TBinaryProtocol,
  TBufferedTransport,
} from 'thrift'

import * as MyService from './codegen/com/creditkarma/service'

//ServiceHandler: Implement the hello service
const myServiceHandler = {
  ping(status: number): string {
    return `${status}: goodbye`
  }
};

//ServiceOptions: The I/O stack for the service
const myServiceOpts = {
  handler: myServiceHandler,
  processor: MyService.Processor,
  protocol: TBinaryProtocol,
  transport: TBufferedTransport
};

//ServerOptions: Define server features
const serverOpt = {
   services: {
      "/": myServiceOpts
   }
}

//Create and start the web server
const port: number = 8045;
createWebServer<MyService.Processor<void>, MyService.IMyServiceHandler<void>>(serverOpt).listen(port, () => {
  console.log(`Thrift server listening on port ${port}`)
});
