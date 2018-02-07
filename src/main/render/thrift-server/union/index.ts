import * as ts from 'typescript'

import {
    UnionDefinition,
} from '@creditkarma/thrift-parser'

import {
    IIdentifierMap
} from '../../../types'

import {
    renderInterface,
} from './interface'

import {
    renderCodec,
} from './codec'

export function renderUnion(node: UnionDefinition, identifiers: IIdentifierMap): Array<ts.Statement> {
    return [
        renderInterface(node),
        renderCodec(node, identifiers),
    ]
}
