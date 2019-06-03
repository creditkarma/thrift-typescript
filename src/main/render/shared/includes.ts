import * as path from 'path'
import * as ts from 'typescript'

import {
    FieldDefinition,
    FieldType,
    FunctionDefinition,
    SyntaxType,
    ThriftStatement,
} from '@creditkarma/thrift-parser'

import { Resolver } from '../../resolver'
import { DefinitionType, INamespacePath, IRenderState } from '../../types'
import { COMMON_IDENTIFIERS } from './identifiers'

function fieldTypeUsesThrift(fieldType: FieldType): boolean {
    switch (fieldType.type) {
        case SyntaxType.I64Keyword:
            return true

        case SyntaxType.MapType:
            return (
                fieldTypeUsesThrift(fieldType.keyType) ||
                fieldTypeUsesThrift(fieldType.valueType)
            )

        case SyntaxType.ListType:
        case SyntaxType.SetType:
            return fieldTypeUsesThrift(fieldType.valueType)

        default:
            return false
    }
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
            return fieldTypeUsesThrift(statement.fieldType)

        case SyntaxType.TypedefDefinition:
            return fieldTypeUsesThrift(statement.definitionType)

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
            return fieldTypeUsesThrift(statement.fieldType)

        case SyntaxType.TypedefDefinition:
            return fieldTypeUsesThrift(statement.definitionType)

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

    const identifiers: Array<string> = Resolver.identifiersForStatements(
        statements,
        {
            currentNamespace: state.currentNamespace,
            currentDefinitions: state.currentDefinitions,
            namespaceMap: state.project.namespaces,
        },
    )

    const importedIdentifiers: Set<string> = new Set()

    identifiers.forEach((next: string) => {
        const [head] = next.split('.')

        if (
            state.currentNamespace.exports[head] &&
            state.currentDefinitions[head] === undefined &&
            importedIdentifiers.has(head) === false
        ) {
            importedIdentifiers.add(head)

            const def: DefinitionType = state.currentNamespace.exports[head]
            let importPath: ts.LiteralExpression = ts.createLiteral(`./${head}`)
            let importName: string = head

            if (def.type === SyntaxType.ConstDefinition) {
                importPath = ts.createLiteral('./constants')
                importName = '__CONSTANTS__'
            }

            imports.push(
                ts.createImportDeclaration(
                    undefined,
                    undefined,
                    ts.createImportClause(
                        undefined,
                        ts.createNamespaceImport(
                            ts.createIdentifier(importName),
                        ),
                    ),
                    importPath,
                ),
            )
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

    return imports
}
