import * as ts from 'typescript'

import { FunctionType, SyntaxType } from '@creditkarma/thrift-parser'

import { DefinitionType, IRenderState, IResolveResult } from '../../types'

import {
    APPLICATION_EXCEPTION,
    COMMON_IDENTIFIERS,
    PROTOCOL_EXCEPTION,
    THRIFT_TYPES,
} from './identifiers'

import { Resolver } from '../../resolver'
import {
    createArrayType,
    createBooleanType,
    createBufferType,
    createNumberType,
    createStringType,
    createVoidType,
} from '../shared/types'

export * from '../shared/types'

export type TProtocolException =
    | 'UNKNOWN'
    | 'INVALID_DATA'
    | 'NEGATIVE_SIZE'
    | 'SIZE_LIMIT'
    | 'BAD_VERSION'
    | 'NOT_IMPLEMENTED'
    | 'DEPTH_LIMIT'

export type TApplicationException =
    | 'UNKNOWN'
    | 'UNKNOWN_METHOD'
    | 'INVALID_MESSAGE_TYPE'
    | 'WRONG_METHOD_NAME'
    | 'BAD_SEQUENCE_ID'
    | 'MISSING_RESULT'
    | 'INTERNAL_ERROR'
    | 'PROTOCOL_ERROR'
    | 'INVALID_TRANSFORM'
    | 'INVALID_PROTOCOL'
    | 'UNSUPPORTED_CLIENT_TYPE'

export function protocolException(
    exceptionType: TProtocolException,
): ts.Identifier {
    switch (exceptionType) {
        case 'UNKNOWN':
            return PROTOCOL_EXCEPTION.UNKNOWN
        case 'INVALID_DATA':
            return PROTOCOL_EXCEPTION.INVALID_DATA
        case 'NEGATIVE_SIZE':
            return PROTOCOL_EXCEPTION.NEGATIVE_SIZE
        case 'SIZE_LIMIT':
            return PROTOCOL_EXCEPTION.SIZE_LIMIT
        case 'BAD_VERSION':
            return PROTOCOL_EXCEPTION.BAD_VERSION
        case 'NOT_IMPLEMENTED':
            return PROTOCOL_EXCEPTION.NOT_IMPLEMENTED
        case 'DEPTH_LIMIT':
            return PROTOCOL_EXCEPTION.DEPTH_LIMIT
        default:
            const msg: never = exceptionType
            throw new Error(`Non-exhaustive match for: ${msg}`)
    }
}

export function applicationException(
    exceptionType: TApplicationException,
): ts.Identifier {
    switch (exceptionType) {
        case 'UNKNOWN':
            return APPLICATION_EXCEPTION.UNKNOWN
        case 'UNKNOWN_METHOD':
            return APPLICATION_EXCEPTION.UNKNOWN_METHOD
        case 'INVALID_MESSAGE_TYPE':
            return APPLICATION_EXCEPTION.INVALID_MESSAGE_TYPE
        case 'WRONG_METHOD_NAME':
            return APPLICATION_EXCEPTION.WRONG_METHOD_NAME
        case 'BAD_SEQUENCE_ID':
            return APPLICATION_EXCEPTION.BAD_SEQUENCE_ID
        case 'MISSING_RESULT':
            return APPLICATION_EXCEPTION.MISSING_RESULT
        case 'INTERNAL_ERROR':
            return APPLICATION_EXCEPTION.INTERNAL_ERROR
        case 'PROTOCOL_ERROR':
            return APPLICATION_EXCEPTION.PROTOCOL_ERROR
        case 'INVALID_TRANSFORM':
            return APPLICATION_EXCEPTION.INVALID_TRANSFORM
        case 'INVALID_PROTOCOL':
            return APPLICATION_EXCEPTION.INVALID_PROTOCOL
        case 'UNSUPPORTED_CLIENT_TYPE':
            return APPLICATION_EXCEPTION.UNSUPPORTED_CLIENT_TYPE
        default:
            const msg: never = exceptionType
            throw new Error(`Non-exhaustive match for: ${msg}`)
    }
}

function thriftTypeForIdentifier(
    definition: DefinitionType,
    state: IRenderState,
): ts.Identifier {
    switch (definition.type) {
        case SyntaxType.ConstDefinition:
            throw new TypeError(
                `Identifier ${definition.name.value} is a value being used as a type`,
            )

        case SyntaxType.ServiceDefinition:
            throw new TypeError(
                `Service ${definition.name.value} is being used as a type`,
            )

        case SyntaxType.StructDefinition:
        case SyntaxType.UnionDefinition:
        case SyntaxType.ExceptionDefinition:
            return THRIFT_TYPES.STRUCT

        case SyntaxType.EnumDefinition:
            return THRIFT_TYPES.I32

        case SyntaxType.TypedefDefinition:
            return thriftTypeForFieldType(definition.definitionType, state)

        default:
            const msg: never = definition
            throw new Error(`Non-exhaustive match for: ${msg}`)
    }
}

/**
 * Gets the type access for the 'Thrift' object for a given FieldType.
 *
 * This could and should probably be a map of FieldType -> ThriftAccess.
 * However, using a switch statement gives us the safety of exhaustive matching
 * for FieldTypes.
 *
 * @todo Clean up so that we can use the strictNullChecks compiler flag which
 * would allow us to use a map and get the same safety as the switch.
 */
export function thriftTypeForFieldType(
    fieldType: FunctionType,
    state: IRenderState,
): ts.Identifier {
    switch (fieldType.type) {
        case SyntaxType.Identifier:
            const result: IResolveResult = Resolver.resolveIdentifierDefinition(
                fieldType,
                {
                    currentNamespace: state.currentNamespace,
                    namespaceMap: state.project.namespaces,
                },
            )

            return thriftTypeForIdentifier(result.definition, state)

        case SyntaxType.SetType:
            return THRIFT_TYPES.SET

        case SyntaxType.MapType:
            return THRIFT_TYPES.MAP

        case SyntaxType.ListType:
            return THRIFT_TYPES.LIST

        case SyntaxType.BinaryKeyword:
        case SyntaxType.StringKeyword:
            return THRIFT_TYPES.STRING

        case SyntaxType.BoolKeyword:
            return THRIFT_TYPES.BOOL

        case SyntaxType.DoubleKeyword:
            return THRIFT_TYPES.DOUBLE

        case SyntaxType.I8Keyword:
        case SyntaxType.ByteKeyword:
            return THRIFT_TYPES.BYTE

        case SyntaxType.I16Keyword:
            return THRIFT_TYPES.I16

        case SyntaxType.I32Keyword:
            return THRIFT_TYPES.I32

        case SyntaxType.I64Keyword:
            return THRIFT_TYPES.I64

        case SyntaxType.VoidKeyword:
            return THRIFT_TYPES.VOID

        default:
            const msg: never = fieldType
            throw new Error(`Non-exhaustive match for: ${msg}`)
    }
}

/**
 * Creates type annotations for Thrift types
 *
 * EXAMPLE
 *
 * // thrift
 * const bool FALSE_CONST = false
 *
 * // typescript
 * const FALSE_CONST: boolean = false
 *
 * This function provides the ': boolean' bit.
 *
 * Container types:
 *
 * SetType | MapType | ListType
 *
 * Base types:
 *
 * SyntaxType.StringKeyword | SyntaxType.DoubleKeyword | SyntaxType.BoolKeyword |
 * SyntaxType.I8Keyword | SyntaxType.I16Keyword | SyntaxType.I32Keyword |
 * SyntaxType.I64Keyword | SyntaxType.BinaryKeyword | SyntaxType.ByteKeyword;
 *
 * Function types:
 *
 * SyntaxType.VoidKeyword
 */
export function typeNodeForFieldType(
    fieldType: FunctionType,
    state: IRenderState,
    loose: boolean = false,
): ts.TypeNode {
    switch (fieldType.type) {
        case SyntaxType.Identifier:
            return ts.createTypeReferenceNode(
                Resolver.resolveIdentifierName(fieldType.value, {
                    currentNamespace: state.currentNamespace,
                    currentDefinitions: state.currentDefinitions,
                    namespaceMap: state.project.namespaces,
                }).fullName,
                undefined,
            )

        case SyntaxType.SetType:
            return ts.createTypeReferenceNode(COMMON_IDENTIFIERS.Set, [
                typeNodeForFieldType(fieldType.valueType, state, loose),
            ])

        case SyntaxType.MapType:
            return ts.createTypeReferenceNode(COMMON_IDENTIFIERS.Map, [
                typeNodeForFieldType(fieldType.keyType, state, loose),
                typeNodeForFieldType(fieldType.valueType, state, loose),
            ])

        case SyntaxType.ListType:
            return createArrayType(
                typeNodeForFieldType(fieldType.valueType, state, loose),
            )

        case SyntaxType.StringKeyword:
            return createStringType()

        case SyntaxType.BoolKeyword:
            return createBooleanType()

        case SyntaxType.I64Keyword:
            if (loose === true) {
                return ts.createUnionTypeNode([
                    createNumberType(),
                    ts.createTypeReferenceNode(
                        COMMON_IDENTIFIERS.Node_Int64,
                        undefined,
                    ),
                ])
            } else {
                return ts.createTypeReferenceNode(
                    COMMON_IDENTIFIERS.Node_Int64,
                    undefined,
                )
            }

        case SyntaxType.BinaryKeyword:
            return createBufferType()

        case SyntaxType.DoubleKeyword:
        case SyntaxType.I8Keyword:
        case SyntaxType.I16Keyword:
        case SyntaxType.I32Keyword:
        case SyntaxType.ByteKeyword:
            return createNumberType()

        case SyntaxType.VoidKeyword:
            return createVoidType()

        default:
            const msg: never = fieldType
            throw new Error(`Non-exhaustive match for: ${msg}`)
    }
}
