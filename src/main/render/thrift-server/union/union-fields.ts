import * as ts from 'typescript'

import { FieldDefinition, UnionDefinition } from '@creditkarma/thrift-parser'

import { IRenderState } from '../../../types'
import { COMMON_IDENTIFIERS } from '../../shared/identifiers'
import { createVoidType } from '../../shared/types'
import { className, tokens } from '../struct/utils'
import { typeNodeForFieldType } from '../types'

function capitalize(str: string): string {
    if (str.length > 0) {
        const head: string = str[0]
        const tail: string = str.substring(1)
        return `${head.toUpperCase()}${tail}`
    } else {
        return ''
    }
}

function fieldInterfaceName(
    node: UnionDefinition,
    field: FieldDefinition,
    strict: boolean,
): string {
    if (strict) {
        return `I${node.name.value}With${capitalize(field.name.value)}`
    } else {
        return `I${node.name.value}With${capitalize(field.name.value)}Args`
    }
}

function unionTypeName(node: UnionDefinition, strict: boolean): string {
    if (strict) {
        return className(node.name.value)
    } else {
        return `${className(node.name.value)}Args`
    }
}

export function renderUnionsForFields(
    node: UnionDefinition,
    state: IRenderState,
    isExported: boolean,
    strict: boolean,
): Array<ts.Statement> {
    return [
        ts.createTypeAliasDeclaration(
            undefined,
            tokens(isExported),
            unionTypeName(node, strict),
            undefined,
            ts.createUnionTypeNode([
                ...node.fields.map((next: FieldDefinition) => {
                    return ts.createTypeReferenceNode(
                        fieldInterfaceName(node, next, strict),
                        undefined,
                    )
                }),
            ]),
        ),
        ...node.fields.map(
            (next: FieldDefinition): ts.InterfaceDeclaration => {
                const signatures = node.fields.map((field: FieldDefinition) => {
                    if (field.name.value === next.name.value) {
                        return ts.createPropertySignature(
                            undefined,
                            field.name.value,
                            undefined,
                            typeNodeForFieldType(
                                field.fieldType,
                                state,
                                !strict,
                            ),
                            undefined,
                        )
                    } else {
                        return ts.createPropertySignature(
                            undefined,
                            field.name.value,
                            ts.createToken(ts.SyntaxKind.QuestionToken),
                            createVoidType(),
                            undefined,
                        )
                    }
                })

                if (strict) {
                    signatures.unshift(
                        ts.createPropertySignature(
                            undefined,
                            COMMON_IDENTIFIERS.__type,
                            undefined,
                            ts.createLiteralTypeNode(
                                ts.createLiteral(next.name.value),
                            ),
                            undefined,
                        ),
                    )
                }

                return ts.createInterfaceDeclaration(
                    undefined,
                    tokens(isExported),
                    ts.createIdentifier(fieldInterfaceName(node, next, strict)),
                    [],
                    [],
                    signatures,
                )
            },
        ),
    ]
}
