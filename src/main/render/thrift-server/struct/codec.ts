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
    IIdentifierMap,
} from '../../../types'

import {
    codecNameForStruct,
    looseNameForStruct,
    strictNameForStruct,
    tokens,
} from './utils'

export function renderCodec(node: InterfaceWithFields, identifiers: IIdentifierMap, isExported: boolean): ts.Statement {
    return ts.createVariableStatement(
        tokens(isExported),
        createConst(
            ts.createIdentifier(codecNameForStruct(node)),
            ts.createTypeReferenceNode(
                THRIFT_IDENTIFIERS.IStructCodec,
                [
                    ts.createTypeReferenceNode(
                        ts.createIdentifier(looseNameForStruct(node)),
                        undefined,
                    ),
                    ts.createTypeReferenceNode(
                        ts.createIdentifier(strictNameForStruct(node)),
                        undefined,
                    ),
                ],
            ),
            ts.createObjectLiteral([
                createEncodeMethod(node, identifiers),
                createDecodeMethod(node, identifiers),
            ], true),
        ),
    )
}
