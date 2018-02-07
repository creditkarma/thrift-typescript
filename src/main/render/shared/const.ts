import * as ts from 'typescript'

import {
    ConstDefinition
} from '@creditkarma/thrift-parser'

import {
    typeNodeForFieldType
} from './types'

import {
    renderValue
} from './values'

import {
    createConst
} from './utils'

/**
 * EXAMPLE
 *
 * // thrift
 * const i32 myConst = 45
 *
 * // typescript
 * const myConst: number = 45
 *
 * @param node
 */
export function renderConst(node: ConstDefinition): ts.Statement {
    return ts.createVariableStatement(
        [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
        createConst(
            node.name.value,
            typeNodeForFieldType(node.fieldType),
            renderValue(node.fieldType, node.initializer),
        ),
    )
}
