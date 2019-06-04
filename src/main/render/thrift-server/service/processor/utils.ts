import { FunctionDefinition, SyntaxType } from '@creditkarma/thrift-parser'
import * as ts from 'typescript'

import { IRenderState } from '../../../../types'
import { COMMON_IDENTIFIERS } from '../../identifiers'
import { strictName } from '../../struct/utils'
import { createStructArgsName } from '../utils'

export function argsTypeForFunction(
    funcDef: FunctionDefinition,
    state: IRenderState,
): ts.TypeNode {
    return ts.createTypeReferenceNode(
        ts.createIdentifier(
            strictName(
                createStructArgsName(funcDef),
                SyntaxType.StructDefinition,
                state,
            ),
        ),
        undefined,
    )
}

export function createWriteErrorCall(
    funcDef: FunctionDefinition,
): ts.ReturnStatement {
    return ts.createReturn(
        ts.createCall(
            ts.createPropertyAccess(
                COMMON_IDENTIFIERS.this,
                COMMON_IDENTIFIERS.writeError,
            ),
            undefined,
            [
                ts.createLiteral(funcDef.name.value),
                COMMON_IDENTIFIERS.requestId,
                COMMON_IDENTIFIERS.err,
            ],
        ),
    )
}
