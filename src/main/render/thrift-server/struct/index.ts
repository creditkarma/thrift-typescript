import * as ts from 'typescript'

import { InterfaceWithFields } from '@creditkarma/thrift-parser'

import { IRenderState } from '../../../types'

import { renderInterface } from './interface'

import { renderToolkit } from './toolkit'

import { renderClass } from './class'

export function renderStruct(
    node: InterfaceWithFields,
    state: IRenderState,
    extendError: boolean = false,
): Array<ts.Statement> {
    return [
        ...renderInterface(node, state, true),
        renderToolkit(node, state, true),
        renderClass(node, state, true, extendError),
    ]
}
