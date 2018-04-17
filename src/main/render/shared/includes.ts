import {
    SyntaxType,
    ConstDefinition,
    TypedefDefinition,
    ThriftStatement,
} from '@creditkarma/thrift-parser'

import {
    INamespaceFile,
} from '../../types'

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

export function fileUsesThrift(resolvedFile: INamespaceFile): boolean {
    for (let i = 0; i < resolvedFile.body.length; i++) {
        if (statementUsesThrift(resolvedFile.body[i])) {
            return true
        }
    }

    return false
}
