import * as ts from 'typescript'

import {
    FunctionDefinition,
    FieldDefinition,
    ServiceDefinition,
} from '@creditkarma/thrift-parser'

import { COMMON_IDENTIFIERS } from '../identifiers'

import {
    typeNodeForFieldType,
    createAnyType,
} from '../types'

import {
    createFunctionParameter,
} from '../utils'

function parameterTypeForField(field: FieldDefinition): ts.TypeNode {
    if (field.requiredness === 'optional') {
        return ts.createUnionTypeNode([
            typeNodeForFieldType(field.fieldType),
            ts.createTypeReferenceNode('undefined', undefined)
        ])
    } else {
        return typeNodeForFieldType(field.fieldType)
    }
}

function funcToMethodReducer(acc: Array<ts.MethodSignature>, func: FunctionDefinition): Array<ts.MethodSignature> {
    return acc.concat([
        ts.createMethodSignature(
            undefined,
            func.fields.map((field: FieldDefinition) => {
                return createFunctionParameter(
                    field.name.value,
                    typeNodeForFieldType(field.fieldType),
                    undefined,
                    (field.requiredness === 'optional'),
                )
            }),
            ts.createUnionTypeNode([
                typeNodeForFieldType(func.returnType),
                ts.createTypeReferenceNode(
                    COMMON_IDENTIFIERS.Promise,
                    [ typeNodeForFieldType(func.returnType) ]
                )
            ]),
            func.name.value,
            undefined,
        ),
        ts.createMethodSignature(
            undefined,
            [
                ...func.fields.map((field: FieldDefinition) => {
                    return createFunctionParameter(
                        field.name.value,
                        parameterTypeForField(field),
                        undefined,
                    )
                }),
                createFunctionParameter(
                    'context',
                    ts.createTypeReferenceNode('Context', undefined),
                    undefined,
                )
            ],
            ts.createUnionTypeNode([
                typeNodeForFieldType(func.returnType),
                ts.createTypeReferenceNode(
                    COMMON_IDENTIFIERS.Promise,
                    [ typeNodeForFieldType(func.returnType) ]
                )
            ]),
            func.name.value,
            undefined,
        )
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
 * @param service
 */
export function renderHandlerInterface(service: ServiceDefinition): Array<ts.Statement> {
    const signatures: Array<ts.MethodSignature> = service.functions.reduce(funcToMethodReducer, [])

    if (service.extends !== null) {
        return [
            ts.createInterfaceDeclaration(
                undefined,
                [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
                ts.createIdentifier('ILocalHandler'),
                [
                    ts.createTypeParameterDeclaration(
                        COMMON_IDENTIFIERS.Context,
                        undefined,
                        createAnyType(),
                    )
                ],
                [],
                signatures,
            ),
            ts.createTypeAliasDeclaration(
                undefined,
                [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
                ts.createIdentifier('IHandler'),
                [
                    ts.createTypeParameterDeclaration(
                        COMMON_IDENTIFIERS.Context,
                        undefined,
                        createAnyType()
                    )
                ],
                ts.createIntersectionTypeNode([
                    ts.createTypeReferenceNode(
                        ts.createIdentifier('ILocalHandler'),
                        [
                            ts.createTypeReferenceNode('Context', undefined)
                        ]
                    ),
                    ts.createTypeReferenceNode(
                        ts.createIdentifier(`${service.extends.value}.IHandler`),
                        [
                            ts.createTypeReferenceNode('Context', undefined)
                        ]
                    )
                ])
            )
        ]
    } else {
        return [
            ts.createInterfaceDeclaration(
                undefined,
                [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
                ts.createIdentifier('IHandler'),
                [
                    ts.createTypeParameterDeclaration(
                        COMMON_IDENTIFIERS.Context,
                        undefined,
                        createAnyType()
                    )
                ],
                [],
                signatures,
            )
        ]
    }
}
