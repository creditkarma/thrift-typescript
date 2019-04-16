import * as ts from 'typescript'

import { FieldDefinition, UnionDefinition } from '@creditkarma/thrift-parser'

import { IRenderState } from '../../../types'
import { COMMON_IDENTIFIERS } from '../../shared/identifiers'
import { createUndefinedType } from '../../shared/types'
import { className, tokens } from '../struct/utils'
import { typeNodeForFieldType } from '../types'

export function renderUnionTypes(
    node: UnionDefinition,
    state: IRenderState,
    isExported: boolean,
): ts.Statement {
    return ts.createEnumDeclaration(
        undefined, // decorators
        tokens(isExported), // modifiers
        renderUnionTypeName(node.name.value, state), // enum name
        node.fields.map((field: FieldDefinition) => {
            return ts.createEnumMember(
                fieldTypeName(node.name.value, field.name.value, true),
                ts.createLiteral(field.name.value),
            )
        }),
    )
}

export function fieldTypeAccess(
    node: UnionDefinition,
    field: FieldDefinition,
    state: IRenderState,
): string {
    return `${renderUnionTypeName(node.name.value, state)}.${fieldTypeName(
        node.name.value,
        field.name.value,
        true,
    )}`
}

export function unionTypeName(
    name: string,
    state: IRenderState,
    strict: boolean,
): string {
    if (strict) {
        return className(name, state)
    } else {
        return `${className(name, state)}Args`
    }
}

export function renderUnionTypeName(name: string, state: IRenderState): string {
    if (state.options.strictUnionsComplexNames) {
        return `${unionTypeName(name, state, true)}__Type`
    } else {
        return `${unionTypeName(name, state, true)}Type`
    }
}

function capitalize(str: string): string {
    if (str.length > 0) {
        const head: string = str[0]
        const tail: string = str.substring(1)
        return `${head.toUpperCase()}${tail}`
    } else {
        return ''
    }
}

export function fieldTypeName(
    nodeName: string,
    fieldName: string,
    strict: boolean,
): string {
    if (strict) {
        return `${nodeName}With${capitalize(fieldName)}`
    } else {
        return `${nodeName}With${capitalize(fieldName)}Args`
    }
}

export function fieldInterfaceName(
    nodeName: string,
    fieldName: string,
    strict: boolean,
): string {
    if (strict) {
        return `I${fieldTypeName(nodeName, fieldName, strict)}`
    } else {
        return `I${fieldTypeName(nodeName, fieldName, strict)}`
    }
}

function renderInterfaceForField(
    node: UnionDefinition,
    field: FieldDefinition,
    state: IRenderState,
    isStrict: boolean,
    isExported: boolean,
): ts.InterfaceDeclaration {
    const signatures = node.fields.map((next: FieldDefinition) => {
        if (field.name.value === next.name.value) {
            return ts.createPropertySignature(
                undefined,
                field.name.value,
                undefined,
                typeNodeForFieldType(next.fieldType, state, !isStrict),
                undefined,
            )
        } else {
            return ts.createPropertySignature(
                undefined,
                next.name.value,
                ts.createToken(ts.SyntaxKind.QuestionToken),
                createUndefinedType(),
                undefined,
            )
        }
    })

    if (isStrict) {
        signatures.unshift(
            ts.createPropertySignature(
                undefined,
                COMMON_IDENTIFIERS.__type,
                undefined,
                ts.createTypeReferenceNode(
                    ts.createIdentifier(fieldTypeAccess(node, field, state)),
                    undefined,
                ),
                undefined,
            ),
        )

        if (state.options.withNameField) {
            signatures.unshift(
                ts.createPropertySignature(
                    undefined,
                    COMMON_IDENTIFIERS.__name,
                    undefined,
                    ts.createLiteralTypeNode(ts.createLiteral(node.name.value)),
                    undefined,
                ),
            )
        }
    }

    return ts.createInterfaceDeclaration(
        undefined,
        tokens(isExported),
        ts.createIdentifier(
            fieldInterfaceName(node.name.value, field.name.value, isStrict),
        ),
        [],
        [],
        signatures,
    )
}

export function renderUnionsForFields(
    node: UnionDefinition,
    state: IRenderState,
    isExported: boolean,
    isStrict: boolean,
): Array<ts.Statement> {
    return [
        ts.createTypeAliasDeclaration(
            undefined,
            tokens(isExported),
            unionTypeName(node.name.value, state, isStrict),
            undefined,
            ts.createUnionTypeNode([
                ...node.fields.map((next: FieldDefinition) => {
                    return ts.createTypeReferenceNode(
                        fieldInterfaceName(
                            node.name.value,
                            next.name.value,
                            isStrict,
                        ),
                        undefined,
                    )
                }),
            ]),
        ),
        ...node.fields.map(
            (next: FieldDefinition): ts.InterfaceDeclaration => {
                return renderInterfaceForField(
                    node,
                    next,
                    state,
                    isStrict,
                    true,
                )
            },
        ),
    ]
}
