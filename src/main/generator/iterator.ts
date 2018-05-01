import * as ts from 'typescript'

import { SyntaxType, ThriftStatement } from '@creditkarma/thrift-parser'

import { IIdentifierMap, IRenderer, IMakeFlags } from '../types'

/**
 * Given a Thrift declaration return the corresponding TypeScript statement
 *
 * @param statement
 */
export function renderStatement(
    statement: ThriftStatement,
    identifiers: IIdentifierMap,
    renderer: IRenderer,
    flags: IMakeFlags
): Array<ts.Statement> {
    switch (statement.type) {
        case SyntaxType.ConstDefinition:
            return renderer.renderConst(statement, identifiers)

        case SyntaxType.EnumDefinition:
            return renderer.renderEnum(statement, identifiers)

        case SyntaxType.TypedefDefinition:
            return renderer.renderTypeDef(statement, identifiers)

        case SyntaxType.StructDefinition:
            return renderer.renderStruct(statement, identifiers)

        case SyntaxType.UnionDefinition:
            return renderer.renderUnion(statement, identifiers, flags)

        case SyntaxType.ExceptionDefinition:
            return renderer.renderException(statement, identifiers)

        case SyntaxType.ServiceDefinition:
            return renderer.renderService(statement, identifiers)

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
 * Our main iteration logic that visits each Thrift statement and calls a function to generate the
 * TypeScript statements for that Thrift statement. Usually this is a one to many mapping.
 *
 * @param ast
 */
export function processStatements(
    statements: Array<ThriftStatement>,
    identifiers: IIdentifierMap,
    renderer: IRenderer,
    flags: IMakeFlags,
): Array<ts.Statement> {
    return statements.reduce((acc: Array<ts.Statement>, next: ThriftStatement) => {
        return [...acc, ...renderStatement(next, identifiers, renderer, flags)]
    }, [])
}
