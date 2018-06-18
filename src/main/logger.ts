export interface ILogger {
    log(msg: string, data?: any): void
    warn(msg: string, data?: any): void
    error(msg: string, data?: any): void
}

export const createLogger = (name: string): ILogger => {
    return {
        log(msg: string, data?: any): void {
            if (data !== undefined && process.env.DUBUG !== undefined) {
                console.log(`[${name}:info] ${msg}`, data)
            } else if (process.env.DUBUG !== undefined) {
                console.log(`[${name}:info] ${msg}`)
            }
        },

        warn(msg: string, data?: any): void {
            if (data !== undefined) {
                console.warn(`[${name}:warn] ${msg}`, data)
            } else {
                console.warn(`[${name}:warn] ${msg}`)
            }
        },

        error(msg: string, data?: any): void {
            if (data !== undefined) {
                console.error(`[${name}:error] ${msg}`, data)
            } else {
                console.error(`[${name}:error] ${msg}`)
            }
        },
    }
}

export const logger: ILogger = createLogger('thrift-typescript')
