import { renderer as ApacheRenderer } from './apache'

import { renderer as ThriftRenderer } from './thrift-server'

import { CompileTarget, IRenderer } from '../types'

export function rendererForTarget(target: CompileTarget = 'apache'): IRenderer {
    switch (target) {
        case 'thrift-server':
            return ThriftRenderer

        case 'apache':
            return ApacheRenderer

        default:
            const msg: never = target
            throw new Error(`Non-exhaustive match for ${msg}`)
    }
}
