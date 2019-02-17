import * as ts from 'typescript'

import { UnionDefinition } from '@creditkarma/thrift-parser'

import { renderInterface } from '../struct/interface'

import { renderCodec } from './codec'

import ResolverFile from '../../../resolver/file'
import { renderClass } from './class'

export function renderUnion(
    node: UnionDefinition,
    file: ResolverFile,
    isExported: boolean = true,
): Array<ts.Statement> {
    return [
        ...renderInterface(node, file, isExported),
        renderCodec(node, file, isExported),
        renderClass(node, file, isExported),
    ]
}
