import * as ts from 'typescript'

import {
    UnionDefinition,
} from '@creditkarma/thrift-parser'

import {
    IIdentifierMap, IMakeFlags
} from '../../../types'

import {
    renderInterface,
} from '../struct/interface'

import {
    renderStrictInterface
} from './interface'

import {
    renderCodec,
} from './codec'

import {
    renderClass
} from './class'

export function renderUnion(node: UnionDefinition, identifiers: IIdentifierMap, flags: IMakeFlags): Array<ts.Statement> {
    if (flags.strict || flags.strictUnions) {
        return [
            ...renderStrictInterface(node, identifiers),
            renderCodec(node, identifiers),
        ]

    } else {
        return [
            ...renderInterface(node, identifiers),
            renderCodec(node, identifiers),
            renderClass(node, identifiers),
        ]
    }
}
