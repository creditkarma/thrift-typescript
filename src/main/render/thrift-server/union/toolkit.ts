import * as ts from 'typescript'

import { UnionDefinition } from '@creditkarma/thrift-parser'

import { createConst } from '../utils'

import { THRIFT_IDENTIFIERS } from '../identifiers'

import { createEncodeMethod } from './encode'

import { createDecodeMethod } from './decode'

import { createCreateMethod } from './create'

import { IRenderState } from '../../../types'
import {
    looseNameForStruct,
    strictNameForStruct,
    tokens,
    toolkitNameForStruct,
} from '../struct/utils'

function renderMethodsForCodec(
    node: UnionDefinition,
    state: IRenderState,
): Array<ts.MethodDeclaration> {
    if (state.options.strictUnions) {
        return [
            createCreateMethod(node, state),
            createEncodeMethod(node, state),
            createDecodeMethod(node, state),
        ]
    } else {
        return [
            createEncodeMethod(node, state),
            createDecodeMethod(node, state),
        ]
    }
}

function toolkitBaseClass(state: IRenderState): ts.Identifier {
    if (state.options.strictUnions) {
        return THRIFT_IDENTIFIERS.IStructToolkit
    } else {
        return THRIFT_IDENTIFIERS.IStructCodec
    }
}

function renderToolkitTypeNode(
    node: UnionDefinition,
    state: IRenderState,
): ts.TypeNode {
    return ts.createTypeReferenceNode(toolkitBaseClass(state), [
        ts.createTypeReferenceNode(
            ts.createIdentifier(looseNameForStruct(node, state)),
            undefined,
        ),
        ts.createTypeReferenceNode(
            ts.createIdentifier(strictNameForStruct(node, state)),
            undefined,
        ),
    ])
}

export function renderToolkit(
    node: UnionDefinition,
    state: IRenderState,
    isExported: boolean,
): ts.Statement {
    return ts.createVariableStatement(
        tokens(isExported),
        createConst(
            ts.createIdentifier(toolkitNameForStruct(node, state)),
            renderToolkitTypeNode(node, state),
            ts.createObjectLiteral(renderMethodsForCodec(node, state), true),
        ),
    )
}
