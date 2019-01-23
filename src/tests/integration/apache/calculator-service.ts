import {
    createHttpClient,
    createHttpConnection,
    createWebServer,
    HttpConnection,
    Int64,
    TBinaryProtocol,
    TBufferedTransport,
} from 'thrift'

import {
    Calculator,
    Choice,
    CommonStruct,
    ExceptionOne,
    ExceptionTwo,
    Operation,
    Work,
} from './codegen/calculator'

import { AddService } from './codegen/add-service'

import { SharedStruct, SharedUnion } from './codegen/shared'

import { Server } from 'net'

import { ADD_SERVER_CONFIG } from './config'

function delay(val: number): Promise<number> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(val)
        }, 1000)
    })
}

export function createCalculatorServer(): Server {
    const options = {
        transport: TBufferedTransport,
        protocol: TBinaryProtocol,
        https: false,
        headers: {
            Host: ADD_SERVER_CONFIG.hostName,
        },
    }
    const connection: HttpConnection = createHttpConnection(
        ADD_SERVER_CONFIG.hostName,
        ADD_SERVER_CONFIG.port,
        options,
    )
    const thriftClient: AddService.Client = createHttpClient(
        AddService.Client,
        connection,
    )

    // Handler: Implement the hello service
    const myServiceHandler: Calculator.IHandler = {
        ping(): void {
            return
        },
        add(a: number, b: number): Promise<number> {
            return thriftClient.add(a, b)
        },
        addInt64(a: Int64, b: Int64): Promise<Int64> {
            return thriftClient.addInt64(a, b)
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
                default:
                    throw new Error(`Unsupported operation: ${work.op}`)
            }
        },
        zip(): void {
            return
        },
        getStruct(key: number): SharedStruct {
            return new SharedStruct({ key, value: 'test' })
        },
        getUnion(index: number): SharedUnion {
            if (index === 1) {
                return SharedUnion.fromOption1('foo')
            } else {
                return SharedUnion.fromOption2('bar')
            }
        },
        echoBinary(word: Buffer): string {
            return word.toString('utf-8')
        },
        echoString(word: string): string {
            return word
        },
        checkName(choice: Choice): string {
            if (choice.firstName !== undefined) {
                return `FirstName: ${choice.firstName.name}`
            } else if (choice.lastName !== undefined) {
                return `LastName: ${choice.lastName.name}`
            } else {
                throw new Error(`Unknown choice`)
            }
        },
        checkOptional(type?: string): string {
            if (type === undefined) {
                return 'undefined'
            } else {
                return type
            }
        },
        mapOneList(list: Array<number>): Array<number> {
            return list.map((next: number) => next + 1)
        },
        mapValues(map: Map<string, number>): Array<number> {
            return Array.from(map.values())
        },
        listToMap(list: Array<Array<string>>): Map<string, string> {
            return list.reduce(
                (acc: Map<string, string>, next: Array<string>) => {
                    acc.set(next[0], next[1])
                    return acc
                },
                new Map(),
            )
        },
        fetchThing(): CommonStruct {
            return new SharedStruct({ key: 5, value: 'test' })
        },
        throw(num: number): void {
            if (num === 1) {
                throw new ExceptionOne({ message: 'test one' })
            } else {
                throw new ExceptionTwo({ whatHappened: 'test two' })
            }
        },
    }

    // ServiceOptions: The I/O stack for the service
    const myServiceOpts = {
        handler: myServiceHandler,
        processor: Calculator,
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
