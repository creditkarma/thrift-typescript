import * as ts from 'typescript'

import { ConstDefinition } from '@creditkarma/thrift-parser'

import { TypeMapping } from './types'

import { renderValue } from './initializers'

import ResolverFile from '../../resolver/file'
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
    file: ResolverFile,
): ts.Statement {
    return ts.createVariableStatement(
        [ts.createToken(ts.SyntaxKind.ExportKeyword)],
        createConst(
            node.name.value,
            typeMapping(node.fieldType),
            renderValue(node.fieldType, node.initializer, file),
        ),
    )
}
