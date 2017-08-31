import {
  BinaryExpression,
  ClassExpression,
  ConstructorDeclaration,
  createBlock,
  createCall,
  createClassExpression,
  createIdentifier,
  createIf,
  createLiteral,
  createNew,
  createNull,
  createProperty,
  createPropertyAccess,
  createStatement,
  createThrow,
  createToken,
  createTypeReferenceNode,
  ExpressionStatement,
  HeritageClause,
  IfStatement,
  MethodDeclaration,
  ParameterDeclaration,
  PropertyAccessExpression,
  PropertyDeclaration,
  Statement,
  SyntaxKind,
  ThrowStatement,
  TypeReferenceNode,
} from 'typescript'

import {
  FieldDefinition,
  StructDefinition,
  SyntaxType,
} from '@creditkarma/thrift-parser'

import {
  typeNodeForFieldType,
} from '../types'
import {
  createAssignmentStatement,
  createClassConstructor,
  createFunctionParameter,
  createNotNull,
  propertyAccessForIdentifier,
  renderOptional,
} from '../utils'
import { renderValue } from '../values'

import { COMMON_IDENTIFIERS } from '../identifiers'
import { interfaceNameForClass } from '../interface'
import { createReadMethod } from './read'
import { createWriteMethod } from './write'

export function renderStruct(node: StructDefinition): Statement {
  const fields: Array<PropertyDeclaration> = node.fields.map(renderFieldDeclarations)

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
  const fieldAssignments: Array<IfStatement> = node.fields.map(createFieldAssignment)
  const argsType: TypeReferenceNode = (node.fields.length > 0) ?
    createTypeReferenceNode(interfaceNameForClass(node), undefined) :
    undefined

  const argsParameter: ParameterDeclaration = createFunctionParameter('args', argsType, undefined, true)

  // Build the constructor body
  const ctor: ConstructorDeclaration = createClassConstructor([ argsParameter ], fieldAssignments)

  // Build the `read` method
  const readMethod: MethodDeclaration = createReadMethod(node)

  // Build the `write` method
  const writeMethod: MethodDeclaration = createWriteMethod(node)

  // Does this struct inherit from another struct?
  // TODO: Why was this changed in the lint settings?
  const heritage: Array<HeritageClause> = []
  // // TODO: This is a pretty hacky solution
  // if (this.size) {
  //   const implementsClause = createHeritageClause(SyntaxKind.ImplementsKeyword, [
  //     createExpressionWithTypeArguments(undefined, createIdentifier(this.implements)),
  //   ])
  //   heritage.push(implementsClause)
  // }

  // export class <node.name> { ... }
  const classExpression: ClassExpression = createClassExpression(
    [ createToken(SyntaxKind.ExportKeyword) ],
    node.name.value,
    [],
    heritage,
    [ ...fields, ctor, writeMethod, readMethod ],
  )

  return createStatement(classExpression)
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
function assignmentForField(field: FieldDefinition): ExpressionStatement {
  const thisPropAccess: PropertyAccessExpression = propertyAccessForIdentifier('this', field.name.value)
  const argsPropAccess: PropertyAccessExpression = propertyAccessForIdentifier('args', field.name.value)

  switch (field.fieldType.type) {
    case SyntaxType.SetType: {
      const copy = createNew(COMMON_IDENTIFIERS.Set, undefined, [ argsPropAccess ])
      return createAssignmentStatement(thisPropAccess, copy)
    }

    case SyntaxType.ListType: {
      const copy = createCall(propertyAccessForIdentifier('Array', 'from'), undefined, [ argsPropAccess ])
      return createAssignmentStatement(thisPropAccess, copy)
    }

    case SyntaxType.MapType: {
      const copy = createNew(COMMON_IDENTIFIERS.Map, undefined, [ argsPropAccess ])
      return createAssignmentStatement(thisPropAccess, copy)
    }

    default:
      return createAssignmentStatement(thisPropAccess, argsPropAccess)
  }
}

/**
 * throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, 'Required field {{fieldName}} is unset!')
 * @param field
 */
function throwForField(field: FieldDefinition): ThrowStatement | undefined {
  if (field.requiredness === 'required') {
    const errCtor = createPropertyAccess(createIdentifier('Thrift'), 'TProtocolException')
    const errType = createPropertyAccess(createIdentifier('Thrift'), 'TProtocolExceptionType.UNKNOWN')
    const errArgs = [ errType, createLiteral(`Required field ${field.name.value} is unset!`) ]
    return createThrow(createNew(errCtor, undefined, errArgs))
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
export function createFieldAssignment(field: FieldDefinition): IfStatement {
  // Map is supposed to use Thrift.copyMap but that doesn't work if we use something better than an object
  // Set/List is supposed to use Thrift.copyList but the implementation is weird and might not work
  // when combined with the custom Map copying
  // TODO: should we perform a deep clone? Currently shallow but not sure if deep cloning is actually needed
  const comparison: BinaryExpression = createNotNull('args', field.name.value)
  const thenAssign: ExpressionStatement = assignmentForField(field)
  const elseThrow: ThrowStatement = throwForField(field)

  return createIf(
    comparison,
    createBlock([ thenAssign ], true),
    (elseThrow !== undefined) ? createBlock([ elseThrow ], true) : undefined,
  )
}

/**
 * Render properties for struct class based on values thrift file
 *
 * EXAMPLE:
 *
 * // example.thrift
 * stuct MyStruct {
 *   1: required i32 id,
 *   2: optional bool field1,
 * }
 *
 * // example.ts
 * export class MyStruct {
 *   public id: number = null;
 *   public field1?: boolean = null;
 *
 *   ...
 * }
 */
export function renderFieldDeclarations(field: FieldDefinition): PropertyDeclaration {
  const defaultValue = (field.defaultValue !== null) ?
    renderValue(field.defaultValue) :
    createNull()

  return createProperty(
    undefined,
    [ createToken(SyntaxKind.PublicKeyword) ],
    field.name.value,
    renderOptional(field.requiredness),
    typeNodeForFieldType(field.fieldType),
    defaultValue,
  )
}
