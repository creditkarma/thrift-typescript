import * as ts from 'typescript'

import {
    InterfaceWithFields,
} from '@creditkarma/thrift-parser'

import {
    createConst,
} from '../utils'

import {
    THRIFT_IDENTIFIERS,
} from '../identifiers'

import {
    createEncodeMethod,
} from './encode'

import {
    createDecodeMethod,
} from './decode'

import {
    IIdentifierMap
} from '../../../types';

export function renderCodec(node: InterfaceWithFields, identifiers: IIdentifierMap): ts.Statement {
    return ts.createVariableStatement(
        [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
        createConst(
            ts.createIdentifier(`${node.name.value}Codec`),
            ts.createTypeReferenceNode(
                THRIFT_IDENTIFIERS.IStructCodec,
                [
                    ts.createTypeReferenceNode(
                        ts.createIdentifier(node.name.value),
                        undefined
                    )
                ],
            ),
            ts.createObjectLiteral([
                createEncodeMethod(node, identifiers),
                createDecodeMethod(node, identifiers),
            ], true)
        ),
    )
}
