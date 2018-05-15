import * as ts from 'typescript'

import {
    FieldDefinition,
    InterfaceWithFields,
    // SyntaxType,
} from '@creditkarma/thrift-parser'

import {
    createFunctionParameter,
    hasRequiredField,
    renderOptional,
} from '../utils'

import {
    interfaceNameForClass,
} from '../interface'

import {
    renderValue,
} from '../values'

import {
    typeNodeForFieldType,
} from '../types'

export function createArgsParameterForStruct(node: InterfaceWithFields): ts.ParameterDeclaration {
    return createFunctionParameter(
      'args', // param name
      createArgsTypeForStruct(node), // param type
      undefined, // initializer
      !hasRequiredField(node), // optional?
    )
}

export function createArgsTypeForStruct(node: InterfaceWithFields): ts.TypeReferenceNode {
    return ts.createTypeReferenceNode(interfaceNameForClass(node), undefined)
}

/**
 * Render properties for struct class based on values thrift file
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
 * export class MyStruct {
 *   public id: number = null;
 *   public field1?: boolean = null;
 *
 *   ...
 * }
 */
export function renderFieldDeclarations(field: FieldDefinition): ts.PropertyDeclaration {
    const defaultValue = (field.defaultValue !== null) ?
      renderValue(field.fieldType, field.defaultValue) :
      undefined

    return ts.createProperty(
      undefined,
      [ts.createToken(ts.SyntaxKind.PublicKeyword)],
      ts.createIdentifier(field.name.value),
      renderOptional(field.requiredness),
      typeNodeForFieldType(field.fieldType),
      defaultValue,
    )
  }
