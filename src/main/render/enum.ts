import * as ts from 'typescript'

import {
  EnumDefinition,
  EnumMember
} from '@creditkarma/thrift-parser'

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
 *
 * @param node
 */
export function renderEnum(node: EnumDefinition): ts.Statement {
  return ts.createEnumDeclaration(
    undefined, // decorators
    [ ts.createToken(ts.SyntaxKind.ExportKeyword) ], // modifiers
    node.name.value, // enum name
    node.members.map((field: EnumMember) => {
      return ts.createEnumMember(
        field.name.value,
        (
          (field.initializer !== null) ?
            ts.createLiteral(parseInt(field.initializer.value)) :
            undefined
        ),
      )
    }), // enum members
  )
}
