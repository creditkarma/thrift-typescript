import * as ts from 'typescript'

import {
    InterfaceWithFields,
} from '@creditkarma/thrift-parser'

import {
    IRenderState,
} from '../../../types'

import {
    renderInterface,
} from './interface'

import {
    renderCodec,
} from './codec'

import {
    renderClass,
} from './class'

export function renderStruct(node: InterfaceWithFields, state: IRenderState): Array<ts.Statement> {
    return [
        ...renderInterface(node, state),
        renderCodec(node, state),
        renderClass(node, state),
    ]
}

export function renderStructInterfaces(node: InterfaceWithFields, state: IRenderState): Array<ts.Statement> {
    return renderInterface(node, state)
}
