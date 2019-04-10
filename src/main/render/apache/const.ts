import * as ts from 'typescript'

import { ConstDefinition } from '@creditkarma/thrift-parser'

import { TypeMapping } from './types'

import { renderValue } from './values'

import { IRenderState } from '../../types'
import { createConst } from './utils'

/**
 * EXAMPLE
 *
 * // thrift
 * const i32 myConst = 45
 *
 * // typescript
 * const myConst: number = 45
 */
export function renderConst(
    node: ConstDefinition,
    typeMapping: TypeMapping,
    state: IRenderState,
): ts.Statement {
    return ts.createVariableStatement(
        [ts.createToken(ts.SyntaxKind.ExportKeyword)],
        createConst(
            node.name.value,
            typeMapping(node.fieldType, state),
            renderValue(node.fieldType, node.initializer, state),
        ),
    )
}
