import * as ts from 'typescript'

import { UnionDefinition } from '@creditkarma/thrift-parser'

import { createConst } from '../utils'

import { THRIFT_IDENTIFIERS } from '../identifiers'

import { createEncodeMethod } from './encode'

import { createDecodeMethod } from './decode'

import ResolverFile from '../../../resolver/file'
import {
    codecNameForStruct,
    looseNameForStruct,
    strictNameForStruct,
    tokens,
} from '../struct/utils'

export function renderCodec(
    node: UnionDefinition,
    file: ResolverFile,
    isExported: boolean,
): ts.Statement {
    return ts.createVariableStatement(
        tokens(isExported),
        createConst(
            ts.createIdentifier(codecNameForStruct(node)),
            ts.createTypeReferenceNode(THRIFT_IDENTIFIERS.IStructCodec, [
                ts.createTypeReferenceNode(
                    ts.createIdentifier(looseNameForStruct(node)),
                    undefined,
                ),
                ts.createTypeReferenceNode(
                    ts.createIdentifier(strictNameForStruct(node)),
                    undefined,
                ),
            ]),
            ts.createObjectLiteral(
                [
                    createEncodeMethod(node, file),
                    createDecodeMethod(node, file),
                ],
                true,
            ),
        ),
    )
}
