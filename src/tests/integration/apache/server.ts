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
    Choice,
} from './codegen/calculator/calculator'

import {
    SharedStruct,
    SharedUnion,
} from './codegen/shared/shared'

import { Server } from 'net'

function delay(val: number): Promise<number> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(val)
        }, 1000)
    })
}

export function createServer(): Server {
    // ServiceHandler: Implement the hello service
    const myServiceHandler: Calculator.IHandler = {
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
                default:
                    throw new Error(`Unsupported operation: ${work.op}`)
            }
        },
        zip(): void {},
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
        mapValues(map: Map<string, number>): number[] {
            return Array.from(map.values())
        },
        listToMap(list: Array<Array<string>>): Map<string,string> {
            return list.reduce((acc: Map<string,string>, next: Array<string>) => {
                acc.set(next[0], next[1])
                return acc
            }, new Map())
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
    return createWebServer(serverOpt)
}
