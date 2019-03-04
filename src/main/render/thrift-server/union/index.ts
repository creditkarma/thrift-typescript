import * as ts from 'typescript'

import { UnionDefinition } from '@creditkarma/thrift-parser'

import { IRenderState } from '../../../types'

import { renderInterface } from '../struct/interface'

import { renderToolkit } from './toolkit'

import { renderClass } from './class'

import { renderUnionsForFields, renderUnionTypes } from './union-fields'

export function renderUnion(
    node: UnionDefinition,
    state: IRenderState,
    isExported: boolean = true,
): Array<ts.Statement> {
    return [
        ...renderInterface(node, state, isExported),
        renderToolkit(node, state, isExported),
        renderClass(node, state, isExported),
    ]
}

export function renderStrictUnion(
    node: UnionDefinition,
    state: IRenderState,
    isExported: boolean = true,
): Array<ts.Statement> {
    return [
        renderUnionTypes(node, isExported),
        ...renderUnionsForFields(node, state, isExported, true),
        ...renderUnionsForFields(node, state, isExported, false),
        renderToolkit(node, state, isExported),
    ]
}
