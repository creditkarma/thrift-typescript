import * as path from 'path'
import * as ts from 'typescript'

import {
    // IIdentifierMap,
    INamespaceFile,
    IRenderState,
    IResolvedFile,
    IResolvedIdentifier,
} from '../../types'

import {
    ConstDefinition,
    FieldDefinition,
    FunctionType,
    // StructLike,
    Identifier,
    SyntaxType,
    ThriftStatement,
    TypedefDefinition,
} from '@creditkarma/thrift-parser'

/**
 * import * as thrift from 'thrift';
 *
 * I would really like this to only import what is being used by the file we're
 * generating. We'll need to keep track of what each files uses.
 */
export function renderThriftImports(): ts.ImportDeclaration {
    return ts.createImportDeclaration(
        undefined,
        undefined,
        ts.createImportClause(
            undefined,
            ts.createNamespaceImport(
                ts.createIdentifier('thrift'),
            ),
        ),
        ts.createLiteral('@creditkarma/thrift-server-core'),
    )
}

function identiferUsesIdentifer(name: string, statement: Identifier): boolean {
    return statement.value.startsWith(`${name}.`)
}

function constUsesIdentifier(name: string, statement: ConstDefinition): boolean {
    return (
        fieldTypeUsesIdentifer(name, statement.fieldType) ||
        (statement.initializer.type === SyntaxType.Identifier && identiferUsesIdentifer(name, statement.initializer))
    )
}

function typedefUsesIdentifer(name: string, statement: TypedefDefinition): boolean {
    return (
        statement.definitionType.type === SyntaxType.Identifier &&
        identiferUsesIdentifer(name, statement.definitionType)
    )
}

function fieldTypeUsesIdentifer(name: string, fieldType: FunctionType): boolean {
    switch (fieldType.type) {
        case SyntaxType.SetType:
        case SyntaxType.ListType:
            return fieldTypeUsesIdentifer(name, fieldType.valueType)

        case SyntaxType.MapType:
            return (
                fieldTypeUsesIdentifer(name, fieldType.valueType) ||
                fieldTypeUsesIdentifer(name, fieldType.keyType)
            )

        case SyntaxType.Identifier:
            return identiferUsesIdentifer(name, fieldType)

        default:
            return false
    }
}

function fieldUsesIdentifer(name: string, field: FieldDefinition): boolean {
    return fieldTypeUsesIdentifer(name, field.fieldType)
}

function fieldsUseIdetifier(name: string, fields: Array<FieldDefinition>): boolean {
    for (const field of fields) {
        if (fieldUsesIdentifer(name, field)) {
            return true
        }
    }

    return false
}

function statementUsesIdentifier(name: string, statement: ThriftStatement): boolean {
    switch (statement.type) {

        case SyntaxType.ServiceDefinition:
        case SyntaxType.NamespaceDefinition:
        case SyntaxType.IncludeDefinition:
        case SyntaxType.CppIncludeDefinition:
        case SyntaxType.EnumDefinition:
            return false

        case SyntaxType.StructDefinition:
        case SyntaxType.UnionDefinition:
        case SyntaxType.ExceptionDefinition:
            return fieldsUseIdetifier(name, statement.fields)

        case SyntaxType.ConstDefinition:
            return constUsesIdentifier(name, statement)

        case SyntaxType.TypedefDefinition:
            return typedefUsesIdentifer(name, statement)

        default:
            const msg: never = statement
            throw new Error(`Non-exhaustive match for ${msg}`)
    }
}

export function fileUsesIdentifier(name: string, resolvedFile: INamespaceFile): boolean {
    for (const statement of resolvedFile.body) {
        if (statementUsesIdentifier(name, statement)) {
            return true
        }
    }

    return false
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
    outPath: string,
    currentPath: string,
    resolvedFile: INamespaceFile,
    state: IRenderState,
): Array<ts.ImportDeclaration> {
    const imports: Array<ts.ImportDeclaration> = []
    for (const name of Object.keys(resolvedFile.includes)) {
        if (fileUsesIdentifier(name, resolvedFile)) {
            const resolvedIncludes: Array<IResolvedIdentifier> = resolvedFile.includes[name].identifiers
            const includeFile: IResolvedFile = resolvedFile.includes[name].file

            if (resolvedIncludes != null && resolvedFile != null) {
                const includePath: string = includeFile.namespace.path
                imports.push(ts.createImportDeclaration(
                    undefined,
                    undefined,
                    ts.createImportClause(
                        undefined,
                        ts.createNamespaceImport(
                            ts.createIdentifier(name),
                        ),
                    ),
                    ts.createLiteral(
                        `./${path.join(
                            path.relative(
                                path.dirname(currentPath),
                                path.dirname(includePath),
                            ),
                        )}`,
                    ),
                ))
            }
        }
    }
    return imports
}
