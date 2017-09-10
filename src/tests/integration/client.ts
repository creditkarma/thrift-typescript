// function getClient(errCallback, context: IFrontierContext): Client {
//   if (!this.thriftClient) {
//     console.log(`creating Mortgage client at ${this.config.mortgageHostname}:${this.config.mortgagePort}`)

//     const options = {
//       transport: TBufferedTransport,
//       protocol: TBinaryProtocol,
//       https: false,
//       headers: {
//         Host: this.config.mortgageHostname,
//       },
//       nodeOptions: {
//         timeout: this.config.mortgageDownstreamRequestTimeout,
//       },
//     }

//     if (context.headers.authorization) {
//       options.headers[AUTH_HEADER] = context.headers.authorization
//     }

//     this.connection = createHttpConnection(this.config.mortgageHostname, this.config.mortgagePort, options)
//     this.thriftClient = createClient(MortgageService, this.connection)
//   }

//   this.connection.once('error', errCallback)
//   return this.thriftClient
// }