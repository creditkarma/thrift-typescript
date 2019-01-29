import {
    ConstDefinition,
    FieldDefinition,
    FunctionDefinition,
    SyntaxType,
    ThriftStatement,
    TypedefDefinition,
} from '@creditkarma/thrift-parser'

import { INamespaceFile } from '../../types'

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

export function fileUsesThrift(resolvedFile: INamespaceFile): boolean {
    for (const statement of resolvedFile.body) {
        if (statementUsesThrift(statement)) {
            return true
        }
    }

    return false
}

export function fileUsesInt64(resolvedFile: INamespaceFile): boolean {
    for (const statement of resolvedFile.body) {
        if (statementUsesInt64(statement)) {
            return true
        }
    }

    return false
}
