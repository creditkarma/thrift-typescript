import * as ts from 'typescript'

import { FieldDefinition, UnionDefinition } from '@creditkarma/thrift-parser'

import ResolverFile from '../../../resolver/file'
import { COMMON_IDENTIFIERS } from '../../shared/identifiers'
import { createVoidType } from '../../shared/types'
import { className, tokens } from '../struct/utils'
import { typeNodeForFieldType } from '../types'

export function renderUnionTypes(
    node: UnionDefinition,
    file: ResolverFile,
    isExported: boolean,
): ts.Statement {
    return ts.createEnumDeclaration(
        undefined, // decorators
        tokens(isExported), // modifiers
        renderUnionTypeName(node.name.value, file), // enum name
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
    file: ResolverFile,
): string {
    return `${renderUnionTypeName(node.name.value, file)}.${fieldTypeName(
        node.name.value,
        field.name.value,
        true,
    )}`
}

export function unionTypeName(name: string, strict: boolean): string {
    if (strict) {
        return className(name)
    } else {
        return `${className(name)}Args`
    }
}

export function renderUnionTypeName(name: string, file: ResolverFile): string {
    if (file.schema.options.strictUnionsComplexNames) {
        return `${unionTypeName(name, true)}__Type`
    } else {
        return `${unionTypeName(name, true)}Type`
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
    file: ResolverFile,
    strict: boolean,
    isExported: boolean,
): ts.InterfaceDeclaration {
    const signatures = node.fields.map((next: FieldDefinition) => {
        if (field.name.value === next.name.value) {
            return ts.createPropertySignature(
                undefined,
                field.name.value,
                undefined,
                typeNodeForFieldType(next.fieldType, file, !strict),
                undefined,
            )
        } else {
            return ts.createPropertySignature(
                undefined,
                next.name.value,
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
                ts.createTypeReferenceNode(
                    ts.createIdentifier(fieldTypeAccess(node, field, file)),
                    undefined,
                ),
                undefined,
            ),
        )
    }

    return ts.createInterfaceDeclaration(
        undefined,
        tokens(isExported),
        ts.createIdentifier(
            fieldInterfaceName(node.name.value, field.name.value, strict),
        ),
        [],
        [],
        signatures,
    )
}

export function renderUnionsForFields(
    node: UnionDefinition,
    file: ResolverFile,
    isExported: boolean,
    strict: boolean,
): Array<ts.Statement> {
    return [
        ts.createTypeAliasDeclaration(
            undefined,
            tokens(isExported),
            unionTypeName(node.name.value, strict),
            undefined,
            ts.createUnionTypeNode([
                ...node.fields.map((next: FieldDefinition) => {
                    return ts.createTypeReferenceNode(
                        fieldInterfaceName(
                            node.name.value,
                            next.name.value,
                            strict,
                        ),
                        undefined,
                    )
                }),
            ]),
        ),
        ...node.fields.map(
            (next: FieldDefinition): ts.InterfaceDeclaration => {
                return renderInterfaceForField(node, next, file, strict, true)
            },
        ),
    ]
}
