import * as ts from 'typescript'

import {
    ExceptionDefinition,
} from '@creditkarma/thrift-parser'

import {
    IIdentifierMap,
} from '../../../types'

import {
    renderClass,
} from '../struct/class'

import {
    renderInterface,
} from '../struct/interface'

export function renderException(node: ExceptionDefinition, identifiers: IIdentifierMap): Array<ts.Statement> {
    return [
        ...renderInterface(node, identifiers),
        renderClass(node, identifiers),
    ]
}
