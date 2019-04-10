import * as ts from 'typescript'

import { InterfaceWithFields } from '@creditkarma/thrift-parser'

import { createConst } from '../utils'

import { THRIFT_IDENTIFIERS } from '../identifiers'

import { createEncodeMethod } from './encode'

import { createDecodeMethod } from './decode'

import { IRenderState } from '../../../types'
import {
    looseNameForStruct,
    strictNameForStruct,
    tokens,
    toolkitNameForStruct,
} from './utils'

export function renderToolkit(
    node: InterfaceWithFields,
    state: IRenderState,
    isExported: boolean,
): ts.Statement {
    return ts.createVariableStatement(
        tokens(isExported),
        createConst(
            toolkitNameForStruct(node, state),
            ts.createTypeReferenceNode(THRIFT_IDENTIFIERS.IStructCodec, [
                ts.createTypeReferenceNode(
                    looseNameForStruct(node, state),
                    undefined,
                ),
                ts.createTypeReferenceNode(
                    strictNameForStruct(node, state),
                    undefined,
                ),
            ]),
            ts.createObjectLiteral(
                [
                    createEncodeMethod(node, state),
                    createDecodeMethod(node, state),
                ],
                true,
            ),
        ),
    )
}
