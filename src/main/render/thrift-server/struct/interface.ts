import * as ts from 'typescript'

import {
    InterfaceWithFields,
    FieldDefinition,
} from '@creditkarma/thrift-parser'

import {
    renderOptional,
} from '../../shared/utils'

import {
    typeNodeForFieldType,
} from '../../shared/types'

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
export function renderInterface(node: InterfaceWithFields): ts.InterfaceDeclaration {
    const signatures = node.fields.map((field: FieldDefinition) => {
        return ts.createPropertySignature(
            undefined,
            field.name.value,
            renderOptional(field.requiredness),
            typeNodeForFieldType(field.fieldType, true),
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
