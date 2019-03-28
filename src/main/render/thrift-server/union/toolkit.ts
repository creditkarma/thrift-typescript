import * as ts from 'typescript'

import { UnionDefinition } from '@creditkarma/thrift-parser'

import { createConst } from '../utils'

import { THRIFT_IDENTIFIERS } from '../identifiers'

import { createEncodeMethod } from './encode'

import { createDecodeMethod } from './decode'

import { createCreateMethod } from './create'

import ResolverFile from '../../../resolver/file'
import {
    looseNameForStruct,
    strictNameForStruct,
    tokens,
    toolkitNameForStruct,
} from '../struct/utils'

function renderMethodsForCodec(
    node: UnionDefinition,
    file: ResolverFile,
): Array<ts.MethodDeclaration> {
    if (file.schema.options.strictUnions) {
        return [
            createCreateMethod(node, file),
            createEncodeMethod(node, file),
            createDecodeMethod(node, file),
        ]
    } else {
        return [createEncodeMethod(node, file), createDecodeMethod(node, file)]
    }
}

function toolkitBaseClass(file: ResolverFile): ts.Identifier {
    if (file.schema.options.strictUnions) {
        return THRIFT_IDENTIFIERS.IStructToolkit
    } else {
        return THRIFT_IDENTIFIERS.IStructCodec
    }
}

function renderToolkitTypeNode(
    node: UnionDefinition,
    file: ResolverFile,
): ts.TypeNode {
    return ts.createTypeReferenceNode(toolkitBaseClass(file), [
        ts.createTypeReferenceNode(
            ts.createIdentifier(looseNameForStruct(node, file)),
            undefined,
        ),
        ts.createTypeReferenceNode(
            ts.createIdentifier(strictNameForStruct(node, file)),
            undefined,
        ),
    ])
}

export function renderToolkit(
    node: UnionDefinition,
    file: ResolverFile,
    isExported: boolean,
): ts.Statement {
    return ts.createVariableStatement(
        tokens(isExported),
        createConst(
            ts.createIdentifier(toolkitNameForStruct(node)),
            renderToolkitTypeNode(node, file),
            ts.createObjectLiteral(renderMethodsForCodec(node, file), true),
        ),
    )
}
