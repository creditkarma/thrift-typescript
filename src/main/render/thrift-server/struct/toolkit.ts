import * as ts from 'typescript'

import { InterfaceWithFields } from '@creditkarma/thrift-parser'

import { createConst } from '../utils'

import { THRIFT_IDENTIFIERS } from '../identifiers'

import { createEncodeMethod } from './encode'

import { createDecodeMethod } from './decode'

import ResolverFile from '../../../resolver/file'

import {
    looseNameForStruct,
    strictNameForStruct,
    tokens,
    toolkitNameForStruct,
} from './utils'

export function renderToolkit(
    node: InterfaceWithFields,
    file: ResolverFile,
    isExported: boolean,
): ts.Statement {
    return ts.createVariableStatement(
        tokens(isExported),
        createConst(
            ts.createIdentifier(toolkitNameForStruct(node)),
            ts.createTypeReferenceNode(THRIFT_IDENTIFIERS.IStructCodec, [
                ts.createTypeReferenceNode(
                    ts.createIdentifier(looseNameForStruct(node, file)),
                    undefined,
                ),
                ts.createTypeReferenceNode(
                    ts.createIdentifier(strictNameForStruct(node, file)),
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
