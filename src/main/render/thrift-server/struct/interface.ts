import * as ts from 'typescript'

import {
    FieldDefinition,
    InterfaceWithFields,
} from '@creditkarma/thrift-parser'

import { typeNodeForFieldType } from '../types'

import { IRenderState } from '../../../types'

import {
    looseNameForStruct,
    renderOptional,
    strictNameForStruct,
    tokens,
} from './utils'

function strictInterface(
    node: InterfaceWithFields,
    state: IRenderState,
    isExported: boolean,
): ts.InterfaceDeclaration {
    const signatures = node.fields.map((field: FieldDefinition) => {
        return ts.createPropertySignature(
            undefined,
            field.name.value,
            renderOptional(field),
            typeNodeForFieldType(field.fieldType, state),
            undefined,
        )
    })

    return ts.createInterfaceDeclaration(
        undefined,
        tokens(isExported),
        ts.createIdentifier(strictNameForStruct(node, state)),
        [],
        [],
        signatures,
    )
}

function looseInterface(
    node: InterfaceWithFields,
    state: IRenderState,
    isExported: boolean,
): ts.InterfaceDeclaration {
    const signatures = node.fields.map((field: FieldDefinition) => {
        return ts.createPropertySignature(
            undefined,
            field.name.value,
            renderOptional(field, true),
            typeNodeForFieldType(field.fieldType, state, true),
            undefined,
        )
    })

    return ts.createInterfaceDeclaration(
        undefined,
        tokens(isExported),
        ts.createIdentifier(looseNameForStruct(node, state)),
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
    state: IRenderState,
    isExported: boolean,
): Array<ts.InterfaceDeclaration> {
    return [
        strictInterface(node, state, isExported),
        looseInterface(node, state, isExported),
    ]
}
