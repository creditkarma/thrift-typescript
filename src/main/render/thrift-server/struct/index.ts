import * as ts from 'typescript'

import {
    InterfaceWithFields,
} from '@creditkarma/thrift-parser'

import {
    IIdentifierMap,
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

export function renderStruct(node: InterfaceWithFields, identifiers: IIdentifierMap): Array<ts.Statement> {
    return [
        ...renderInterface(node, identifiers),
        renderCodec(node, identifiers),
        renderClass(node, identifiers),
    ]
}
