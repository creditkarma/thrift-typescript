import {
    ConstValue,
    createBooleanLiteral,
    FunctionType,
    PropertyAssignment,
    SyntaxType,
    ThriftStatement,
} from '@creditkarma/thrift-parser'

import { ValidationError } from '../errors'
import { INamespace, INamespacePath, IResolveContext } from '../types'
import { stubIdentifier } from '../utils'
import { resolveIdentifier } from './resolveIdentifier'

/**
 * It makes things easier to rewrite all const values to their literal values.
 * For example you can use the identifier of a constant as the initializer of another constant
 * or the default value of a field in a struct.
 *
 * const i32 VALUE = 32
 * cosnt list<i32> LIST = [ VALUE ]
 *
 * This can be safely rewritten to:
 *
 * const i32 VALUE = 32
 * const list<i32> LIST = [ 32 ]
 *
 * This is blunt, but it makes type-checking later very easy.
 */
export function resolveConstValue(
    value: ConstValue,
    expectedType: FunctionType,
    context: IResolveContext,
): ConstValue {
    switch (value.type) {
        case SyntaxType.IntConstant:
            if (expectedType.type === SyntaxType.BoolKeyword) {
                if (value.value.value === '1' || value.value.value === '0') {
                    return createBooleanLiteral(
                        value.value.value === '1',
                        value.loc,
                    )
                } else {
                    throw new ValidationError(
                        `Can only assign booleans to the int values '1' or '0'`,
                        value.loc,
                    )
                }
            } else {
                return value
            }

        case SyntaxType.Identifier:
            const resolvedIdentifier = resolveIdentifier(
                value,
                context.currentNamespace,
            )
            const [head, ...tail] = resolvedIdentifier.value.split('.')
            if (context.currentNamespace.exports[head]) {
                const statement: ThriftStatement =
                    context.currentNamespace.exports[head]
                if (statement.type === SyntaxType.ConstDefinition) {
                    return resolveConstValue(
                        statement.initializer,
                        expectedType,
                        context,
                    )
                } else {
                    return resolvedIdentifier
                }
            } else {
                const nextNamespacePath: INamespacePath | undefined =
                    context.currentNamespace.includedNamespaces[head]

                if (nextNamespacePath !== undefined) {
                    const nextNamespace: INamespace =
                        context.namespaceMap[nextNamespacePath.accessor]

                    const stub = stubIdentifier(tail.join('.'))
                    const resolvedValue = resolveConstValue(
                        stub,
                        expectedType,
                        {
                            currentNamespace: nextNamespace,
                            namespaceMap: context.namespaceMap,
                        },
                    )

                    // Check if returned identifier matches stub, if it does, return the correct identifier
                    return stub.type === resolvedValue.type &&
                        stub.value === resolvedValue.value
                        ? resolvedIdentifier
                        : resolvedValue
                }
            }
            throw new ValidationError(
                `Unable to resolve value of identifier[${value.value}]`,
                value.loc,
            )

        case SyntaxType.ConstMap:
            return {
                type: SyntaxType.ConstMap,
                properties: value.properties.map(
                    (next: PropertyAssignment): PropertyAssignment => {
                        return {
                            type: SyntaxType.PropertyAssignment,
                            name: resolveConstValue(
                                next.name,
                                expectedType,
                                context,
                            ),
                            initializer: resolveConstValue(
                                next.initializer,
                                expectedType,
                                context,
                            ),
                            loc: next.loc,
                        }
                    },
                ),
                loc: value.loc,
            }

        case SyntaxType.ConstList:
            return {
                type: SyntaxType.ConstList,
                elements: value.elements.map(
                    (next: ConstValue): ConstValue => {
                        return resolveConstValue(next, expectedType, context)
                    },
                ),
                loc: value.loc,
            }

        default:
            return value
    }
}
