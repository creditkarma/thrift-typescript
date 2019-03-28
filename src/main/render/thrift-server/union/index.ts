import * as ts from 'typescript'

import { UnionDefinition } from '@creditkarma/thrift-parser'

import { renderInterface } from '../struct/interface'

import { renderToolkit } from './toolkit'

import ResolverFile from '../../../resolver/file'
import { renderClass } from './class'

import { renderUnionsForFields, renderUnionTypes } from './union-fields'

export function renderUnion(
    node: UnionDefinition,
    file: ResolverFile,
    isExported: boolean = true,
): Array<ts.Statement> {
    return [
        ...renderInterface(node, file, isExported),
        renderToolkit(node, file, isExported),
        renderClass(node, file, isExported),
    ]
}

export function renderStrictUnion(
    node: UnionDefinition,
    file: ResolverFile,
    isExported: boolean = true,
): Array<ts.Statement> {
    return [
        renderUnionTypes(node, file, isExported),
        ...renderUnionsForFields(node, file, isExported, true),
        ...renderUnionsForFields(node, file, isExported, false),
        renderToolkit(node, file, isExported),
    ]
}
