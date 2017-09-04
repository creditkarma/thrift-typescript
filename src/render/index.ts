import {
  createEnumDeclaration,
  createEnumMember,
  createIdentifier,
  createLiteral,
  createToken,
  createTypeAliasDeclaration,
  createVariableStatement,
  Statement,
  SyntaxKind,
  TypeAliasDeclaration,
} from 'typescript'

import {
  ConstDefinition,
  EnumDefinition,
  EnumMember,
  SyntaxType,
  ThriftDocument,
  ThriftStatement,
  TypedefDefinition,
} from '@creditkarma/thrift-parser'

import { renderInterface } from './interface'
import { renderStruct } from './struct'
import { typeNodeForFieldType } from './types'
import { createConst } from './utils'
import { renderValue } from './values'

export function renderTypeAlias(node: TypedefDefinition): TypeAliasDeclaration {
  return createTypeAliasDeclaration(
    undefined,
    [ createToken(SyntaxKind.ExportKeyword) ],
    node.name.value,
    undefined,
    typeNodeForFieldType(node.definitionType),
  )
}

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
export function renderEnum(node: EnumDefinition): Statement {
  return createEnumDeclaration(
    undefined, // decorators
    [ createToken(SyntaxKind.ExportKeyword) ], // modifiers
    node.name.value, // enum name
    node.members.map((field: EnumMember) => {
      return createEnumMember(
        field.name.value,
        ((field.initializer !== null) ? createLiteral(field.initializer.value) : undefined),
      )
    }), // enum members
  )
}

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
export function renderConst(node: ConstDefinition): Statement {
  return createVariableStatement(
    [ createToken(SyntaxKind.ExportKeyword) ],
    createConst(
      node.name.value,
      typeNodeForFieldType(node.fieldType),
      renderValue(node.initializer),
    ),
  )
}

/**
 * Given a Thrift declaration return the corresponding TypeScript statement
 *
 * @param statement
 */
export function renderStatement(statement: ThriftStatement): Array<Statement> {
  switch (statement.type) {
    case SyntaxType.ConstDefinition:
      return [ renderConst(statement) ]

    case SyntaxType.EnumDefinition:
      return [ renderEnum(statement) ]

    case SyntaxType.TypedefDefinition:
      return [ renderTypeAlias(statement) ]

    case SyntaxType.StructDefinition:
      return [ renderInterface(statement), renderStruct(statement) ]

    case SyntaxType.UnionDefinition:
      return [ renderInterface(statement) ]

    case SyntaxType.ExceptionDefinition:
      return [ renderInterface(statement), renderStruct(statement, createIdentifier('Thrift.TException')) ]

    case SyntaxType.ServiceDefinition:
      return []

    case SyntaxType.NamespaceDefinition:
    case SyntaxType.CppIncludeDefinition:
    case SyntaxType.IncludeDefinition:
      return []

    default:
      const msg: never = statement
      throw new Error(`Non-exhaustive match for statement: ${msg}`)
  }
}

/**
 *
 * @param ast
 */
export function render(ast: ThriftDocument): Array<Statement> {
  return ast.body.reduce((acc: Array<Statement>, next: ThriftStatement) => {
    const newStatements: Array<Statement> = renderStatement(next)
    return [ ...acc, ...newStatements ]
  }, [])
}
