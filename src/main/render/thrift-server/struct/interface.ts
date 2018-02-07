import * as ts from 'typescript'

import {
    InterfaceWithFields,
    FieldDefinition,
    SyntaxType,
} from '@creditkarma/thrift-parser'

import {
    typeNodeForFieldType,
} from '../types'

export function renderOptional(field: FieldDefinition, loose: boolean = false): ts.Token<ts.SyntaxKind.QuestionToken> | undefined {
    if (
        field.requiredness !== 'required' ||
        (loose && field.defaultValue !== null)
    ) {
        return ts.createToken(ts.SyntaxKind.QuestionToken)
    } else {
        return undefined
    }
}

function strictInterface(node: InterfaceWithFields): ts.InterfaceDeclaration {
    const signatures = node.fields.map((field: FieldDefinition) => {
        return ts.createPropertySignature(
            undefined,
            field.name.value,
            renderOptional(field),
            typeNodeForFieldType(field.fieldType),
            undefined,
        )
    })

    return ts.createInterfaceDeclaration(
        undefined,
        [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
        ts.createIdentifier(node.name.value),
        [],
        [],
        signatures,
    )
}

function looseNameForStruct(node: InterfaceWithFields): string {
    switch (node.type) {
        case SyntaxType.StructDefinition:
            return `${node.name.value}_Loose`
        default:
            return node.name.value
    }
}

function looseInterface(node: InterfaceWithFields): ts.InterfaceDeclaration {
    const signatures = node.fields.map((field: FieldDefinition) => {
        return ts.createPropertySignature(
            undefined,
            field.name.value,
            renderOptional(field, true),
            typeNodeForFieldType(field.fieldType, true),
            undefined,
        )
    })

    return ts.createInterfaceDeclaration(
        undefined,
        [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
        ts.createIdentifier(looseNameForStruct(node)),
        [],
        [],
        signatures,
    )
}

/**
 * This generates an interface for the argument to the constructor of any struct-like object
 * These include struct, union and exception
 *
 * EXAMPLE:
 *
 * // thrift
 * stuct MyStruct {
 *   1: required i32 id,
 *   2: optional bool field1,
 * }
 *
 * // typescript
 * export interface IMyStructArgs {
 *   id: number;
 *   field1?: boolean
 * }
 */
export function renderInterface(node: InterfaceWithFields): Array<ts.InterfaceDeclaration> {
    return [
        strictInterface(node),
        looseInterface(node),
    ]
}
