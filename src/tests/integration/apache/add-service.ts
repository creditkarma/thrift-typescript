import {
    createWebServer,
    Int64,
    TBinaryProtocol,
    TBufferedTransport,
} from 'thrift'

import { AddService } from './codegen/add-service'

import { Server } from 'net'

export function createAddServer(): Server {
    // Handler: Implement the hello service
    const myServiceHandler: AddService.IHandler = {
        ping(): void {
            return
        },
        add(a: number, b: number): number {
            return a + b
        },
        addInt64(a: Int64, b: Int64): Int64 {
            return new Int64(a.toNumber() + b.toNumber())
        },
    }

    // ServiceOptions: The I/O stack for the service
    const myServiceOpts = {
        handler: myServiceHandler,
        processor: AddService,
        protocol: TBinaryProtocol,
        transport: TBufferedTransport,
    }

    // ServerOptions: Define server features
    const serverOpt = {
        services: {
            '/': myServiceOpts,
        },
    }

    // Create and start the web server
    return createWebServer(serverOpt)
}
