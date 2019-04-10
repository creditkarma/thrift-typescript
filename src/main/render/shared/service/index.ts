import * as ts from 'typescript'

import {
    FieldDefinition,
    FunctionDefinition,
    ServiceDefinition,
} from '@creditkarma/thrift-parser'

import { COMMON_IDENTIFIERS } from '../identifiers'

import { createAnyType, TypeMapping } from '../types'

import { IRenderState } from '../../../types'
import { createFunctionParameter } from '../utils'

function funcToMethodReducer(
    acc: Array<ts.MethodSignature>,
    func: FunctionDefinition,
    typeMapping: TypeMapping,
    state: IRenderState,
): Array<ts.MethodSignature> {
    return acc.concat([
        ts.createMethodSignature(
            undefined,
            [
                ...func.fields.map((field: FieldDefinition) => {
                    return createFunctionParameter(
                        field.name.value,
                        typeMapping(field.fieldType, state),
                        undefined,
                        field.requiredness === 'optional',
                    )
                }),
                createFunctionParameter(
                    'context',
                    ts.createTypeReferenceNode('Context', undefined),
                    undefined,
                    true,
                ),
            ],
            ts.createUnionTypeNode([
                typeMapping(func.returnType, state, true),
                ts.createTypeReferenceNode(COMMON_IDENTIFIERS.Promise, [
                    typeMapping(func.returnType, state, true),
                ]),
            ]),
            func.name.value,
            undefined,
        ),
    ])
}

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
): Array<ts.Statement> {
    const signatures: Array<ts.MethodSignature> = service.functions.reduce(
        (acc: Array<ts.MethodSignature>, next: FunctionDefinition) => {
            return funcToMethodReducer(acc, next, typeMapping, state)
        },
        [],
    )

    if (service.extends !== null) {
        return [
            ts.createInterfaceDeclaration(
                undefined,
                [ts.createToken(ts.SyntaxKind.ExportKeyword)],
                COMMON_IDENTIFIERS.ILocalHandler,
                [
                    ts.createTypeParameterDeclaration(
                        COMMON_IDENTIFIERS.Context,
                        undefined,
                        createAnyType(),
                    ),
                ],
                [],
                signatures,
            ),
            ts.createTypeAliasDeclaration(
                undefined,
                [ts.createToken(ts.SyntaxKind.ExportKeyword)],
                COMMON_IDENTIFIERS.IHandler,
                [
                    ts.createTypeParameterDeclaration(
                        COMMON_IDENTIFIERS.Context,
                        undefined,
                        createAnyType(),
                    ),
                ],
                ts.createIntersectionTypeNode([
                    ts.createTypeReferenceNode(
                        COMMON_IDENTIFIERS.ILocalHandler,
                        [ts.createTypeReferenceNode('Context', undefined)],
                    ),
                    ts.createTypeReferenceNode(
                        ts.createIdentifier(
                            `${service.extends.value}.IHandler`,
                        ),
                        [ts.createTypeReferenceNode('Context', undefined)],
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
                [
                    ts.createTypeParameterDeclaration(
                        COMMON_IDENTIFIERS.Context,
                        undefined,
                        createAnyType(),
                    ),
                ],
                [],
                signatures,
            ),
        ]
    }
}
