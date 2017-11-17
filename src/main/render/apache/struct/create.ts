import * as ts from 'typescript'

import {
  InterfaceWithFields,
  FieldDefinition,
} from '@creditkarma/thrift-parser'

import {
  IIdentifierMap
} from '../../../types'

import {
  renderValue
} from '../values'

import {
  typeNodeForFieldType
} from '../types'

import {
  COMMON_IDENTIFIERS
} from '../identifiers'

import {
  createFunctionParameter,
  createClassConstructor,
  createAssignmentStatement,
  propertyAccessForIdentifier,
  createNotNull,
  throwProtocolException
} from '../utils'

import { interfaceNameForClass } from '../interface'
import { createReadMethod } from './read'
import { createWriteMethod } from './write'

export function renderStruct(node: InterfaceWithFields, identifiers: IIdentifierMap): ts.ClassDeclaration {
  const fields: Array<ts.PropertyDeclaration> = createFieldsForStruct(node)

  /**
   * After creating the properties on our class for the struct fields we must create
   * a constructor that knows how to assign these values based on a passed args.
   *
   * The constructor will take one arguments 'args'. This argument will be an object
   * of an interface matching the struct definition. This interface is built by another
   * function in src/render/interface
   *
   * The interface follows the naming convention of 'I<struct name>'
   *
   * If a required argument is not on the passed 'args' argument we need to throw on error.
   * Optional fields we must allow to be null or undefined.
   */
  const fieldAssignments: Array<ts.IfStatement> = node.fields.map(createFieldAssignment)

  /**
   * Field assignments rely on there being an args argument passed in. We need to wrap
   * field assignments in a conditional to check for the existance of args
   *
   * if (args != null) {
   *   ...fieldAssignments
   * }
   */
  const isArgsNull: ts.BinaryExpression = createNotNull('args')
  const argsCheckWithAssignments: ts.IfStatement = ts.createIf(
    isArgsNull, // condition
    ts.createBlock(fieldAssignments, true), // then
    undefined // else
  )

  const argsParameter: ts.ParameterDeclaration = createArgsParameterForStruct(node)

  // Build the constructor body
  const ctor: ts.ConstructorDeclaration = createClassConstructor([argsParameter], [argsCheckWithAssignments])

  // Build the `read` method
  const readMethod: ts.MethodDeclaration = createReadMethod(node, identifiers)

  // Build the `write` method
  const writeMethod: ts.MethodDeclaration = createWriteMethod(node, identifiers)

  const heritage: ts.HeritageClause = ts.createHeritageClause(
    ts.SyntaxKind.ImplementsKeyword,
    [
      ts.createExpressionWithTypeArguments(
        [],
        COMMON_IDENTIFIERS.TStructLike,
      )
    ]
  )

  // export class <node.name> { ... }
  return ts.createClassDeclaration(
    undefined,
    [ts.createToken(ts.SyntaxKind.ExportKeyword)],
    node.name.value,
    [],
    [heritage], // heritage
    [...fields, ctor, writeMethod, readMethod]
  )
}

export function createArgsParameterForStruct(node: InterfaceWithFields): ts.ParameterDeclaration {
  return createFunctionParameter(
    'args', // param name
    createArgsTypeForStruct(node), // param type
    undefined, // initializer
    true // optional?
  )
}

export function createFieldsForStruct(node: InterfaceWithFields): Array<ts.PropertyDeclaration> {
  return node.fields.map(renderFieldDeclarations)
}

export function createArgsTypeForStruct(node: InterfaceWithFields): ts.TypeReferenceNode {
  return ts.createTypeReferenceNode(interfaceNameForClass(node), undefined)
}

/**
 * This actually creates the assignment for some field in the args argument to the corresponding field
 * in our struct class
 *
 * interface IStructArgs {
 *   id: number;
 * }
 *
 * constructor(args: IStructArgs) {
 *   if (args.id !== null && args.id !== undefined) {
 *     this.id = args.id;
 *   }
 * }
 *
 * This function creates the 'this.id = args.id' bit.
 *
 * @param field
 */
export function assignmentForField(field: FieldDefinition): ts.ExpressionStatement {
  return createAssignmentStatement(
    propertyAccessForIdentifier('this', field.name.value),
    propertyAccessForIdentifier('args', field.name.value)
  )
}

/**
 * Create the Error for a missing required field
 *
 * EXAMPLE
 *
 * throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, 'Required field {{fieldName}} is unset!')
 *
 * @param field
 */
export function throwForField(field: FieldDefinition): ts.ThrowStatement | undefined {
  if (field.requiredness === 'required') {
    return throwProtocolException(
      'UNKNOWN',
      `Required field ${field.name.value} is unset!`
    )
  } else {
    return undefined
  }
}

/**
 * Assign field if contained in args:
 *
 * if (args && args.<field.name> != null) {
 *   this.<field.name> = args.<field.name>
 * }
 *
 * If field is required throw an error:
 *
 * else {
 *   throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, 'Required field {{fieldName}} is unset!')
 * }
 */
export function createFieldAssignment(field: FieldDefinition): ts.IfStatement {
  const comparison: ts.BinaryExpression = createNotNull(`args.${field.name.value}`)
  const thenAssign: ts.ExpressionStatement = assignmentForField(field)
  const elseThrow: ts.ThrowStatement | undefined = throwForField(field)

  return ts.createIf(
    comparison,
    ts.createBlock([thenAssign], true),
    (elseThrow !== undefined) ? ts.createBlock([elseThrow], true) : undefined
  )
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
    field.name.value,
    undefined,
    typeNodeForFieldType(field.fieldType),
    defaultValue
  )
}
