import {
  Statement,
} from 'typescript'

import {
  SyntaxType,
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

import {
  IIdentifierMap
} from '../types'

/**
 * Given a Thrift declaration return the corresponding TypeScript statement
 *
 * @param statement
 */
export function renderStatement(statement: ThriftStatement, identifiers: IIdentifierMap): Array<Statement> {
  switch (statement.type) {
    case SyntaxType.ConstDefinition:
      return [ renderConst(statement) ]

    case SyntaxType.EnumDefinition:
      return [ renderEnum(statement) ]

    case SyntaxType.TypedefDefinition:
      return [ renderTypeDef(statement) ]

    case SyntaxType.StructDefinition:
      return [ renderInterface(statement), renderStruct(statement, identifiers) ]

    case SyntaxType.UnionDefinition:
      return [ renderInterface(statement), renderUnion(statement, identifiers) ]

    case SyntaxType.ExceptionDefinition:
      return [ renderInterface(statement), renderException(statement, identifiers) ]

    case SyntaxType.ServiceDefinition:
      return [
        ...renderArgsStruct(statement, identifiers),
        ...renderResultStruct(statement, identifiers),
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
export function render(statements: Array<ThriftStatement>, identifiers: IIdentifierMap): Array<Statement> {
  return statements.reduce((acc: Array<Statement>, next: ThriftStatement) => {
    const newStatements: Array<Statement> = renderStatement(next, identifiers)
    return [ ...acc, ...newStatements ]
  }, [])
}
