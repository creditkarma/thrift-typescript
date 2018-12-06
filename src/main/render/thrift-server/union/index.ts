import * as ts from 'typescript'

import {
    UnionDefinition,
} from '@creditkarma/thrift-parser'

import {
    IRenderState,
} from '../../../types'

import {
    renderInterface,
} from '../struct/interface'

import {
    renderCodec,
} from './codec'

import {
    renderClass,
} from './class'

export function renderUnion(node: UnionDefinition, state: IRenderState): Array<ts.Statement> {
    return [
        ...renderInterface(node, state),
        renderCodec(node, state),
        renderClass(node, state),
    ]
}

export function renderUnionInterfaces(node: UnionDefinition, state: IRenderState): Array<ts.Statement> {
    return renderInterface(node, state)
}
