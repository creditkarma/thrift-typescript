import {
  Statement,
} from 'typescript'

import {
  SyntaxType,
  ThriftDocument,
  ThriftStatement,
} from '@creditkarma/thrift-parser'

import { renderException } from './exception'
import { renderInterface } from './interface'
import {
  renderArgsStruct,
  renderClient,
  renderProcessor,
  renderResultStruct,
  renderHandlerInterface
} from './service'
import { renderStruct } from './struct'
import { renderUnion } from './union'
import { renderEnum } from './enum'
import { renderTypeDef } from './typedef'
import { renderConst } from './const'

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
      return [ renderTypeDef(statement) ]

    case SyntaxType.StructDefinition:
      return [ renderInterface(statement), renderStruct(statement) ]

    case SyntaxType.UnionDefinition:
      return [ renderInterface(statement), renderUnion(statement) ]

    case SyntaxType.ExceptionDefinition:
      return [ renderInterface(statement), renderException(statement) ]

    case SyntaxType.ServiceDefinition:
      return [
        ...renderArgsStruct(statement),
        ...renderResultStruct(statement),
        renderClient(statement),
        renderHandlerInterface(statement),
        renderProcessor(statement),
      ]

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
