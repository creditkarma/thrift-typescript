import * as ts from 'typescript'

import { UnionDefinition } from '@creditkarma/thrift-parser'

import { IRenderState } from '../../../types'

import { renderInterface } from '../struct/interface'

import { renderCodec } from './codec'

import { renderClass } from './class'

import { renderUnionsForFields } from './union-fields'

export function renderUnion(
    node: UnionDefinition,
    state: IRenderState,
    isExported: boolean = true,
): Array<ts.Statement> {
    return [
        ...renderInterface(node, state, isExported),
        renderCodec(node, state, isExported),
        renderClass(node, state, isExported),
    ]
}

export function renderStrictUnion(
    node: UnionDefinition,
    state: IRenderState,
    isExported: boolean = true,
): Array<ts.Statement> {
    return [
        ...renderUnionsForFields(node, state, isExported, true),
        ...renderUnionsForFields(node, state, isExported, false),
        renderCodec(node, state, isExported),
    ]
}
