import {
    ConstValue,
    FieldDefinition,
    FunctionDefinition,
    FunctionType,
    PropertyAssignment,
    SyntaxType,
    ThriftStatement,
} from '@creditkarma/thrift-parser'

import { IResolveContext, IResolveResult } from '../types'
import { resolveIdentifierDefinition } from './resolveIdentifierDefinition'

function identifiersForFieldType(
    fieldType: FunctionType,
    results: Set<string>,
    context: IResolveContext,
    // Is this identifier being resolved in a context where we need to know the underlying type of typedefs?
    resolveTypedefs: boolean = false,
): void {
    switch (fieldType.type) {
        case SyntaxType.Identifier:
            if (resolveTypedefs) {
                const result: IResolveResult = resolveIdentifierDefinition(
                    fieldType,
                    {
                        currentNamespace: context.currentNamespace,
                        namespaceMap: context.namespaceMap,
                    },
                )

                const definition = result.definition

                if (definition.type === SyntaxType.TypedefDefinition) {
                    identifiersForFieldType(
                        definition.definitionType,
                        results,
                        context,
                    )
                }
            }

            results.add(fieldType.value)
            break

        case SyntaxType.MapType:
            identifiersForFieldType(fieldType.keyType, results, context)
            identifiersForFieldType(fieldType.valueType, results, context)
            break

        case SyntaxType.SetType:
        case SyntaxType.ListType:
            identifiersForFieldType(fieldType.valueType, results, context)
            break
    }
}

function identifiersForConstValue(
    constValue: ConstValue | null,
    results: Set<string>,
): void {
    if (constValue !== null) {
        switch (constValue.type) {
            case SyntaxType.Identifier:
                results.add(constValue.value)
                break

            case SyntaxType.ConstList:
                constValue.elements.forEach((next: ConstValue) => {
                    identifiersForConstValue(next, results)
                })
                break

            case SyntaxType.ConstMap:
                constValue.properties.forEach((next: PropertyAssignment) => {
                    identifiersForConstValue(next.name, results)
                    identifiersForConstValue(next.initializer, results)
                })
        }
    }
}

/**
 * We're going to loop through the provided statements and find the Identifiers being used by these statements.
 *
 * The complicating factor here is that this is used to determine imports for a given file. In some cases a
 * file may need an identifier not explicitly in the AST node. For instance if a Identifer refers to a typedef
 * that aliases a map we may need to know the key and value types of the map so the including file can import
 * those types to handle encoding/decoding of those types.
 */
export function identifiersForStatements(
    statements: Array<ThriftStatement>,
    context: IResolveContext,
): Array<string> {
    const results: Set<string> = new Set()

    statements.forEach((next: ThriftStatement) => {
        switch (next.type) {
            case SyntaxType.IncludeDefinition:
            case SyntaxType.CppIncludeDefinition:
            case SyntaxType.NamespaceDefinition:
            case SyntaxType.EnumDefinition:
                // Ignore
                break

            case SyntaxType.ConstDefinition:
                identifiersForFieldType(next.fieldType, results, context)
                identifiersForConstValue(next.initializer, results)
                break

            case SyntaxType.TypedefDefinition:
                identifiersForFieldType(next.definitionType, results, context)
                break

            case SyntaxType.StructDefinition:
            case SyntaxType.UnionDefinition:
            case SyntaxType.ExceptionDefinition:
                next.fields.forEach((field: FieldDefinition) => {
                    identifiersForFieldType(
                        field.fieldType,
                        results,
                        context,
                        true,
                    )
                    identifiersForConstValue(field.defaultValue, results)
                })
                break

            case SyntaxType.ServiceDefinition:
                if (next.extends) {
                    results.add(next.extends.value)
                }

                next.functions.forEach((func: FunctionDefinition) => {
                    func.fields.forEach((field: FieldDefinition) => {
                        identifiersForFieldType(
                            field.fieldType,
                            results,
                            context,
                            true,
                        )
                        identifiersForConstValue(field.defaultValue, results)
                    })

                    func.throws.forEach((field: FieldDefinition) => {
                        identifiersForFieldType(
                            field.fieldType,
                            results,
                            context,
                            true,
                        )
                        identifiersForConstValue(field.defaultValue, results)
                    })

                    identifiersForFieldType(
                        func.returnType,
                        results,
                        context,
                        true,
                    )
                })

                break

            default:
                const _exhaustiveCheck: never = next
                throw new Error(`Non-exhaustive match for ${_exhaustiveCheck}`)
        }
    })

    return Array.from(results)
}
