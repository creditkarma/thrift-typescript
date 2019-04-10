import * as path from 'path'
import * as ts from 'typescript'

import {
    ConstDefinition,
    FieldDefinition,
    FunctionDefinition,
    SyntaxType,
    ThriftStatement,
    TypedefDefinition,
} from '@creditkarma/thrift-parser'

import { INamespacePath, IRenderState } from '../../types'
import { identifiersForStatements } from '../../utils'
import { COMMON_IDENTIFIERS } from './identifiers'

function constUsesThrift(statement: ConstDefinition): boolean {
    return statement.fieldType.type === SyntaxType.I64Keyword
}

function typedefUsesThrift(statement: TypedefDefinition): boolean {
    return statement.definitionType.type === SyntaxType.I64Keyword
}

function statementUsesThrift(statement: ThriftStatement): boolean {
    switch (statement.type) {
        case SyntaxType.StructDefinition:
        case SyntaxType.UnionDefinition:
        case SyntaxType.ExceptionDefinition:
        case SyntaxType.ServiceDefinition:
            return true

        case SyntaxType.NamespaceDefinition:
        case SyntaxType.IncludeDefinition:
        case SyntaxType.CppIncludeDefinition:
        case SyntaxType.EnumDefinition:
            return false

        case SyntaxType.ConstDefinition:
            return constUsesThrift(statement)

        case SyntaxType.TypedefDefinition:
            return typedefUsesThrift(statement)

        default:
            const msg: never = statement
            throw new Error(`Non-exhaustive match for ${msg}`)
    }
}

function statementUsesInt64(statement: ThriftStatement): boolean {
    switch (statement.type) {
        case SyntaxType.ServiceDefinition:
            return statement.functions.some((func: FunctionDefinition) => {
                if (func.returnType.type === SyntaxType.I64Keyword) {
                    return true
                }

                for (const field of func.fields) {
                    if (field.fieldType.type === SyntaxType.I64Keyword) {
                        return true
                    }
                }

                return false
            })

        case SyntaxType.StructDefinition:
        case SyntaxType.UnionDefinition:
        case SyntaxType.ExceptionDefinition:
            return statement.fields.some((field: FieldDefinition) => {
                return field.fieldType.type === SyntaxType.I64Keyword
            })

        case SyntaxType.NamespaceDefinition:
        case SyntaxType.IncludeDefinition:
        case SyntaxType.CppIncludeDefinition:
        case SyntaxType.EnumDefinition:
            return false

        case SyntaxType.ConstDefinition:
            return constUsesThrift(statement)

        case SyntaxType.TypedefDefinition:
            return typedefUsesThrift(statement)

        default:
            const msg: never = statement
            throw new Error(`Non-exhaustive match for ${msg}`)
    }
}

export function statementsUseThrift(
    statements: Array<ThriftStatement>,
): boolean {
    for (const statement of statements) {
        if (statementUsesThrift(statement)) {
            return true
        }
    }

    return false
}

export function statementsUseInt64(
    statements: Array<ThriftStatement>,
): boolean {
    for (const statement of statements) {
        if (statementUsesInt64(statement)) {
            return true
        }
    }

    return false
}

/**
 * import * as thrift from 'thrift';
 *
 * I would really like this to only import what is being used by the file we're
 * generating. We'll need to keep track of what each files uses.
 */
export function renderThriftImports(thriftLib: string): ts.ImportDeclaration {
    return ts.createImportDeclaration(
        undefined,
        undefined,
        ts.createImportClause(
            undefined,
            ts.createNamespaceImport(COMMON_IDENTIFIERS.thrift),
        ),
        ts.createLiteral(thriftLib),
    )
}

/**
 * Given a hash of included files this will return a list of import statements.
 *
 * @param currentPath The path of the file performing imports. Import paths are
 *                    resolved relative to this.
 * @param includes A hash of all included files
 * @param resolved A hash of include name to a list of ids used from this include
 */
export function renderIncludes(
    statements: Array<ThriftStatement>,
    state: IRenderState,
): Array<ts.ImportDeclaration> {
    const importedNamespaces: Set<string> = new Set()
    const imports: Array<ts.ImportDeclaration> = []
    const identifiers: Array<string> = identifiersForStatements(statements)
    let importNamespace: boolean = false

    identifiers.forEach((next: string) => {
        const [head] = next.split('.')
        if (
            state.currentNamespace.exports[head] &&
            state.currentDefinitions[head] === undefined
        ) {
            importNamespace = true
        } else if (
            state.currentNamespace.includedNamespaces[head] !== undefined
        ) {
            if (!importedNamespaces.has(head)) {
                importedNamespaces.add(head)

                const includedNamespace: INamespacePath =
                    state.currentNamespace.includedNamespaces[head]

                imports.push(
                    ts.createImportDeclaration(
                        undefined,
                        undefined,
                        ts.createImportClause(
                            undefined,
                            ts.createNamespaceImport(ts.createIdentifier(head)),
                        ),
                        ts.createLiteral(
                            `./${path.relative(
                                path.resolve(
                                    state.project.outDir,
                                    state.currentNamespace.namespace.path,
                                ),
                                path.resolve(
                                    state.project.outDir,
                                    includedNamespace.path,
                                ),
                            )}`,
                        ),
                    ),
                )
            }
        }
    })

    if (importNamespace) {
        imports.push(
            ts.createImportDeclaration(
                undefined,
                undefined,
                ts.createImportClause(
                    undefined,
                    ts.createNamespaceImport(COMMON_IDENTIFIERS.__NAMESPACE__),
                ),
                ts.createLiteral(`./.`),
            ),
        )
    }

    return imports
}
