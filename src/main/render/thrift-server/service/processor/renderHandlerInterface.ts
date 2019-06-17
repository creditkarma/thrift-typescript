import {
    FieldDefinition,
    FunctionDefinition,
    ServiceDefinition,
} from '@creditkarma/thrift-parser'
import * as ts from 'typescript'

import { IRenderState } from '../../../../types'
import { COMMON_IDENTIFIERS } from '../../identifiers'
import {
    createAnyType,
    createPromiseType,
    createUndefinedType,
    TypeMapping,
} from '../../types'

import { Resolver } from '../../../../resolver'

function funcReturnType(
    field: FieldDefinition,
    typeMapping: TypeMapping,
    state: IRenderState,
    requireContext: boolean,
): ts.TypeNode {
    if (field.requiredness === 'optional' && requireContext) {
        return ts.createUnionTypeNode([
            typeMapping(field.fieldType, state),
            createUndefinedType(),
        ])
    } else {
        return typeMapping(field.fieldType, state)
    }
}

function contextParameter(
    contextType: ts.TypeNode,
    requireContext: boolean,
): ts.ParameterDeclaration {
    if (requireContext) {
        return ts.createParameter(
            undefined,
            undefined,
            undefined,
            COMMON_IDENTIFIERS.context,
            undefined,
            contextType,
        )
    } else {
        return ts.createParameter(
            undefined,
            undefined,
            undefined,
            COMMON_IDENTIFIERS.context,
            ts.createToken(ts.SyntaxKind.QuestionToken),
            contextType,
        )
    }
}

function funcToMethodReducer(
    acc: Array<ts.MethodSignature>,
    func: FunctionDefinition,
    typeMapping: TypeMapping,
    state: IRenderState,
    contextType: ts.TypeNode = defaultContextType(),
    requireContext: boolean = false,
): Array<ts.MethodSignature> {
    return acc.concat([
        ts.createMethodSignature(
            undefined,
            [
                ...func.fields.map((field: FieldDefinition) => {
                    return ts.createParameter(
                        undefined,
                        undefined,
                        undefined,
                        ts.createIdentifier(field.name.value),
                        requireContext
                            ? undefined
                            : ts.createToken(ts.SyntaxKind.QuestionToken),
                        funcReturnType(
                            field,
                            typeMapping,
                            state,
                            requireContext,
                        ),
                    )
                }),
                contextParameter(contextType, requireContext),
            ],
            ts.createUnionTypeNode([
                typeMapping(func.returnType, state, true),
                createPromiseType(typeMapping(func.returnType, state, true)),
            ]),
            func.name.value,
            undefined,
        ),
    ])
}

const defaultContextType = (): ts.TypeNode =>
    ts.createTypeReferenceNode(COMMON_IDENTIFIERS.Context, undefined)

const defaultContextTypeParam = (): ts.TypeParameterDeclaration =>
    ts.createTypeParameterDeclaration(
        COMMON_IDENTIFIERS.Context,
        undefined,
        createAnyType(),
    )

/**
 * // thrift
 * service MyService {
 *   i32 add(1: i32 a, 2: i32 b)
 * }
 *
 * // typescript
 * interface IMyServiceHandler<Context> {
 *   add(a: number, b: number): number
 *   add(a: number, b: number, context: Context): number
 * }
 */
export function renderHandlerInterface(
    service: ServiceDefinition,
    typeMapping: TypeMapping,
    state: IRenderState,
    contextType: ts.TypeNode = defaultContextType(),
    contextTypeParam: ts.TypeParameterDeclaration = defaultContextTypeParam(),
    requireContext: boolean = false,
): Array<ts.Statement> {
    const signatures: Array<ts.MethodSignature> = service.functions.reduce(
        (acc: Array<ts.MethodSignature>, next: FunctionDefinition) => {
            return funcToMethodReducer(
                acc,
                next,
                typeMapping,
                state,
                contextType,
                requireContext,
            )
        },
        [],
    )

    if (service.extends !== null) {
        return [
            ts.createInterfaceDeclaration(
                undefined,
                [ts.createToken(ts.SyntaxKind.ExportKeyword)],
                COMMON_IDENTIFIERS.ILocalHandler,
                [contextTypeParam],
                [],
                signatures,
            ),
            ts.createTypeAliasDeclaration(
                undefined,
                [ts.createToken(ts.SyntaxKind.ExportKeyword)],
                COMMON_IDENTIFIERS.IHandler,
                [contextTypeParam],
                ts.createIntersectionTypeNode([
                    ts.createTypeReferenceNode(
                        COMMON_IDENTIFIERS.ILocalHandler,
                        [
                            ts.createTypeReferenceNode(
                                COMMON_IDENTIFIERS.Context,
                                undefined,
                            ),
                        ],
                    ),
                    ts.createTypeReferenceNode(
                        ts.createQualifiedName(
                            ts.createIdentifier(
                                Resolver.resolveIdentifierName(
                                    service.extends.value,
                                    {
                                        currentNamespace:
                                            state.currentNamespace,
                                        currentDefinitions:
                                            state.currentDefinitions,
                                        namespaceMap: state.project.namespaces,
                                    },
                                ).fullName,
                            ),
                            COMMON_IDENTIFIERS.IHandler,
                        ),
                        [
                            ts.createTypeReferenceNode(
                                COMMON_IDENTIFIERS.Context,
                                undefined,
                            ),
                        ],
                    ),
                ]),
            ),
        ]
    } else {
        return [
            ts.createInterfaceDeclaration(
                undefined,
                [ts.createToken(ts.SyntaxKind.ExportKeyword)],
                COMMON_IDENTIFIERS.IHandler,
                [contextTypeParam],
                [],
                signatures,
            ),
        ]
    }
}
