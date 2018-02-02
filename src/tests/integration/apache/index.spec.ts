import { assert } from 'chai'

import {
    HttpConnection,
    createHttpClient,
    createHttpConnection,
    TBufferedTransport,
    TBinaryProtocol,
    Int64,
} from 'thrift'

import {
    Calculator,
    Operation,
    Work,
    Choice,
    FirstName,
    LastName,
} from './codegen/calculator/calculator'

import {
    SharedStruct,
} from './codegen/shared/shared'

import './server'

import {
    SERVER_CONFIG
} from './config'

describe('Thrift TypeScript', () => {
    const options = {
        transport: TBufferedTransport,
        protocol: TBinaryProtocol,
        https: false,
        headers: {
            Host: SERVER_CONFIG.hostName,
        }
    }
    const connection: HttpConnection = createHttpConnection(SERVER_CONFIG.hostName, SERVER_CONFIG.port, options)
    const thriftClient: Calculator.Client = createHttpClient(Calculator.Client, connection)

    connection.on('error', (err: Error) => {
        process.exit(1)
    })

    // Allow servers to spin up
    before((done) => {
        setTimeout(done, 5000)
    })

    it('should call an endpoint with no arguments', async () => {
        return thriftClient.ping().then((val: any) => {
            assert.equal(val, undefined)
        })
    })

    it('should correctly call endpoint with arguments', async () => {
        const add: Work = new Work({
            num1: 4,
            num2: 8,
            op: Operation.ADD
        })

        const subtract: Work = new Work({
            num1: 67,
            num2: 13,
            op: Operation.SUBTRACT
        })

        return Promise.all([
            thriftClient.calculate(1, add),
            thriftClient.calculate(1, subtract)
        ]).then((val: Array<number>) => {
            assert.equal(val[0], 12)
            assert.equal(val[1], 54)
        })
    })

    it('should call an endpoint with union arguments', async () => {
        const firstName: Choice = new Choice({ firstName: new FirstName({ name: 'Louis' })})
        const lastName: Choice = new Choice({ lastName: new LastName({ name: 'Smith' })})

        return Promise.all([
            thriftClient.checkName(firstName),
            thriftClient.checkName(lastName),
        ]).then((val: Array<string>) => {
            assert.equal(val[0], 'FirstName: Louis')
            assert.equal(val[1], 'LastName: Smith')
        })
    })

    it('should correctly call endpoint with i64 args', async () => {
        const left: Int64 = new Int64(5)
        const right: Int64 = new Int64(3)

        return thriftClient.add(left, right).then((val: Int64) => {
            assert.equal(val.toNumber(), 8)
        })
    })

    it('should correctly call endpoint that returns struct', async () => {
        return thriftClient.getStruct(5).then((val: SharedStruct) => {
            assert.deepEqual(val, new SharedStruct({ key: 5, value: 'test' }))
        })
    })

    it('should corrently call endpoint with binary data', async () => {
        const word: string = 'test_binary'
        const data: Buffer = Buffer.from(word, 'utf-8')
        return thriftClient.echoBinary(data)
            .then((response: string) => {
                assert.equal(response, word)
            })
    })

    it('should corrently call endpoint that string data', async () => {
        const word: string = 'test_string'
        return thriftClient.echoString(word)
            .then((response: string) => {
                assert.equal(response, word)
            })
    })

    it('should correctly call endpoint with optional parameters', async () => {
        return Promise.all([
            thriftClient.checkOptional('test_first'),
            thriftClient.checkOptional(),
        ]).then((val: Array<string>) => {
            assert.equal(val[0], 'test_first')
            assert.equal(val[1], 'undefined')
        })
    })

    it('should correctly call endpoint with lists as parameters', async () => {
        return thriftClient.mapOneList([1,2,3,4]).then((val: Array<number>) => {
            assert.deepEqual(val, [2,3,4,5])
        })
    })

    it('should correctly call endpoint with maps as parameters', async () => {
        return thriftClient.mapValues(new Map([['key1', 6], ['key2', 5]])).then((response: number[]) => {
            assert.deepEqual(response, [6, 5])
        })
    })

    it('should correctly call endpoint that returns a map', async () => {
        return thriftClient.listToMap([['key_1','value_1'], ['key_2','value_2']]).then((response: Map<string,string>) => {
            assert.deepEqual(response, new Map([['key_1','value_1'], ['key_2','value_2']]))
        })
    })
})
