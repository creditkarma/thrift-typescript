import * as ts from 'typescript'

import { EnumDefinition, EnumMember } from '@creditkarma/thrift-parser'

import { IRenderState } from '../../types'
import { renderIntConstant } from './values'

/**
 * EXAMPE
 *
 * // thrift
 * enum MyEnum {
 *   ONE,
 *   TWO
 * }
 *
 * // typescript
 * export enum MyEnum {
 *   ONE,
 *   TWO
 * }
 */
export function renderEnum(
    node: EnumDefinition,
    state: IRenderState,
): ts.Statement {
    return ts.createEnumDeclaration(
        undefined, // decorators
        [ts.createToken(ts.SyntaxKind.ExportKeyword)], // modifiers
        node.name.value, // enum name
        node.members.map((field: EnumMember) => {
            return ts.createEnumMember(
                field.name.value,
                field.initializer !== null
                    ? state.options.useStringLiteralsForEnums
                        ? ts.createLiteral(field.name.value)
                        : renderIntConstant(field.initializer)
                    : undefined,
            )
        }), // enum members
    )
}
