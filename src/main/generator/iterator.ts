import { SyntaxType, ThriftStatement } from '@creditkarma/thrift-parser'
import ResolverFile from '../resolver/file'
import ResolverNamespace from '../resolver/namespace'
import NamespaceGenerator from './namespace'

/**
 * Given a Thrift declaration return the corresponding TypeScript statement
 *
 * @param statement
 */
export function renderStatement(
    statement: ThriftStatement,
    generator: NamespaceGenerator,
    file: ResolverFile,
): void {
    switch (statement.type) {
        case SyntaxType.ConstDefinition:
            return generator.renderConst(statement, file)

        case SyntaxType.EnumDefinition:
            return generator.renderEnum(statement, file)

        case SyntaxType.TypedefDefinition:
            return generator.renderTypeDef(statement, file)

        case SyntaxType.StructDefinition:
            return generator.renderStruct(statement, file)

        case SyntaxType.UnionDefinition:
            return generator.renderUnion(statement, file)

        case SyntaxType.ExceptionDefinition:
            return generator.renderException(statement, file)

        case SyntaxType.ServiceDefinition:
            return generator.renderService(statement, file)
        case SyntaxType.NamespaceDefinition:
        case SyntaxType.CppIncludeDefinition:
        case SyntaxType.IncludeDefinition:
            return

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
    namespace: ResolverNamespace,
    generator: NamespaceGenerator,
) {
    namespace.files.forEach((file) => {
        file.body.forEach((next: ThriftStatement) => {
            renderStatement(next, generator, file)
        })
    })
}
