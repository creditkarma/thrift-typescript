import {
  createInterfaceDeclaration,
  createPropertySignature,
  createToken,
  InterfaceDeclaration,
  SyntaxKind,
} from 'typescript'

import {
  FieldDefinition,
  InterfaceWithFields,
} from '@creditkarma/thrift-parser'

import { typeNodeForFieldType } from './types'
import { renderOptional } from './utils'

export function interfaceNameForClass(statement: InterfaceWithFields): string {
  return `I${statement.name.value}`
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
 * export interface IMyStruct {
 *   id: number;
 *   field1?: boolean
 * }
 */
export function renderInterface(statement: InterfaceWithFields): InterfaceDeclaration {
  const signatures = statement.fields.map((field: FieldDefinition) => {
    return createPropertySignature(
      undefined,
      field.name.value,
      renderOptional(field.requiredness),
      typeNodeForFieldType(field.fieldType),
      undefined,
    )
  })

  return createInterfaceDeclaration(
    undefined,
    [ createToken(SyntaxKind.ExportKeyword) ],
    interfaceNameForClass(statement),
    [],
    [],
    signatures,
  )
}
