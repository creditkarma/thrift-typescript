import * as ts from 'typescript'

import {
    FieldDefinition,
    InterfaceWithFields,
} from '@creditkarma/thrift-parser'

import { typeNodeForFieldType } from '../types'

import { IIdentifierMap } from '../../../types'

import { looseNameForStruct, strictNameForStruct, tokens } from './utils'

export function renderOptional(
    field: FieldDefinition,
    loose: boolean = false,
): ts.Token<ts.SyntaxKind.QuestionToken> | undefined {
    if (
        field.requiredness !== 'required' ||
        (loose && field.defaultValue !== null)
    ) {
        return ts.createToken(ts.SyntaxKind.QuestionToken)
    } else {
        return undefined
    }
}

function strictInterface(
    node: InterfaceWithFields,
    identifiers: IIdentifierMap,
    isExported: boolean,
): ts.InterfaceDeclaration {
    const signatures = node.fields.map((field: FieldDefinition) => {
        return ts.createPropertySignature(
            undefined,
            field.name.value,
            renderOptional(field),
            typeNodeForFieldType(field.fieldType, identifiers),
            undefined,
        )
    })

    return ts.createInterfaceDeclaration(
        undefined,
        tokens(isExported),
        ts.createIdentifier(strictNameForStruct(node)),
        [],
        [],
        signatures,
    )
}

function looseInterface(
    node: InterfaceWithFields,
    identifiers: IIdentifierMap,
    isExported: boolean,
): ts.InterfaceDeclaration {
    const signatures = node.fields.map((field: FieldDefinition) => {
        return ts.createPropertySignature(
            undefined,
            field.name.value,
            renderOptional(field, true),
            typeNodeForFieldType(field.fieldType, identifiers, true),
            undefined,
        )
    })

    return ts.createInterfaceDeclaration(
        undefined,
        tokens(isExported),
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
 *   2: optional i64 field1,
 * }
 *
 * // typescript
 * export interface MyStruct {
 *   id: number;
 *   field1?: thrift.Int64
 * }
 * export interface MyStruct_Loose {
 *   id: number;
 *   field1?: number | thrift.Int64
 * }
 */
export function renderInterface(
    node: InterfaceWithFields,
    identifiers: IIdentifierMap,
    isExported: boolean,
): Array<ts.InterfaceDeclaration> {
    return [
        strictInterface(node, identifiers, isExported),
        looseInterface(node, identifiers, isExported),
    ]
}
