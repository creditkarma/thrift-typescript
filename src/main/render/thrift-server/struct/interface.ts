import * as ts from 'typescript'

import {
    FieldDefinition,
    InterfaceWithFields,
} from '@creditkarma/thrift-parser'

import { typeNodeForFieldType } from '../types'

import {
    looseNameForStruct,
    renderOptional,
    strictNameForStruct,
    tokens,
} from './utils'

import ResolverFile from '../../../resolver/file'

function strictInterface(
    node: InterfaceWithFields,
    file: ResolverFile,
    isExported: boolean,
): ts.InterfaceDeclaration {
    const signatures = node.fields.map((field: FieldDefinition) => {
        return ts.createPropertySignature(
            undefined,
            field.name.value,
            renderOptional(field),
            typeNodeForFieldType(field.fieldType, file),
            undefined,
        )
    })

    return ts.createInterfaceDeclaration(
        undefined,
        tokens(isExported),
        ts.createIdentifier(strictNameForStruct(node, file)),
        [],
        [],
        signatures,
    )
}

function looseInterface(
    node: InterfaceWithFields,
    file: ResolverFile,
    isExported: boolean,
): ts.InterfaceDeclaration {
    const signatures = node.fields.map((field: FieldDefinition) => {
        return ts.createPropertySignature(
            undefined,
            field.name.value,
            renderOptional(field, true),
            typeNodeForFieldType(field.fieldType, file, true),
            undefined,
        )
    })

    return ts.createInterfaceDeclaration(
        undefined,
        tokens(isExported),
        ts.createIdentifier(looseNameForStruct(node, file)),
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
    file: ResolverFile,
    isExported: boolean,
): Array<ts.InterfaceDeclaration> {
    return [
        strictInterface(node, file, isExported),
        looseInterface(node, file, isExported),
    ]
}
