import * as ts from 'typescript'

import {
    ExceptionDefinition,
} from '@creditkarma/thrift-parser'

import {
    createConst,
} from '../../shared/utils'

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

export function renderCodec(exp: ExceptionDefinition, identifiers: IIdentifierMap): ts.Statement {
    return ts.createVariableStatement(
        [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
        createConst(
            ts.createIdentifier(`${exp.name.value}Codec`),
            ts.createTypeReferenceNode(
                THRIFT_IDENTIFIERS.IStructCodec,
                [
                    ts.createTypeReferenceNode(
                        ts.createIdentifier(exp.name.value),
                        undefined
                    )
                ],
            ),
            ts.createObjectLiteral([
                createEncodeMethod(exp, identifiers),
                createDecodeMethod(exp, identifiers),
            ], true)
        ),
    )
}
