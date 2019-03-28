import * as ts from 'typescript'

import { InterfaceWithFields } from '@creditkarma/thrift-parser'

import { renderInterface } from './interface'

import { renderToolkit } from './toolkit'

import ResolverFile from '../../../resolver/file'

import { renderClass } from './class'

export function renderStruct(
    node: InterfaceWithFields,
    file: ResolverFile,
): Array<ts.Statement> {
    return [
        ...renderInterface(node, file, true),
        renderToolkit(node, file, true),
        renderClass(node, file, true),
    ]
}
