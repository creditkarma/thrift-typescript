import {
  Identifier,
  SyntaxKind,
  Statement,
  PropertyDeclaration,
  HeritageClause,
  ClassExpression,
  BinaryExpression,
  PropertyAccessExpression,
  ParameterDeclaration,
  ConstructorDeclaration,
  TypeReferenceNode,
  IfStatement,
  ExpressionStatement,
  MethodDeclaration,
  ThrowStatement,
  createLiteral,
  createThrow,
  createNew,
  createIf,
  createNull,
  createToken,
  createBlock,
  createProperty,
  createStatement,
  createClassExpression,
  createPropertyAccess,
  createTypeReferenceNode,
  createHeritageClause,
  createExpressionWithTypeArguments
} from 'typescript'

import {
  InterfaceWithFields,
  FieldDefinition,
} from '@creditkarma/thrift-parser'

import { renderValue } from '../values'
import {
  typeNodeForFieldType
} from '../types'
import {
  renderOptional,
  createFunctionParameter,
  createClassConstructor,
  createAssignmentStatement,
  propertyAccessForIdentifier,
  createNotNull
} from '../utils'

import { interfaceNameForClass } from '../interface'
import { COMMON_IDENTIFIERS } from '../identifiers'
import { createReadMethod } from './read'
import { createWriteMethod } from './write'

export function renderStruct(node: InterfaceWithFields, parent?: Identifier): Statement {
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

  /**
   * Field assignments rely on there being an args argument passed in. We need to wrap
   * field assignments in a conditional to check for the existance of args
   * 
   * if (args != null) {
   *   ...fieldAssignments
   * }
   */
  const isArgsNull: BinaryExpression = createNotNull('args')
  const argsCheck: IfStatement = createIf(
    isArgsNull, // condition
    createBlock(fieldAssignments, true), // then
    undefined // else
  )

  const argsType: TypeReferenceNode = (node.fields.length > 0) ?
    createTypeReferenceNode(interfaceNameForClass(node), undefined) :
    undefined

  const argsParameter: ParameterDeclaration = createFunctionParameter('args', argsType, undefined, true)

  // Build the constructor body
  const ctor: ConstructorDeclaration = createClassConstructor([ argsParameter ], [ argsCheck ])

  // Build the `read` method
  const readMethod: MethodDeclaration = createReadMethod(node)

  // Build the `write` method
  const writeMethod: MethodDeclaration = createWriteMethod(node)

  const heritage: HeritageClause[] = []
  if (parent !== undefined) {
    heritage.push(createHeritageClause(SyntaxKind.ExtendsKeyword, [
      createExpressionWithTypeArguments(undefined, parent),
    ]))
  }

  // export class <node.name> { ... }
  const classExpression: ClassExpression = createClassExpression(
    [ createToken(SyntaxKind.ExportKeyword) ],
    node.name.value,
    [],
    heritage,
    [ ...fields, ctor, writeMethod, readMethod ]
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

  return createAssignmentStatement(thisPropAccess, argsPropAccess)
}

/**
 * throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, 'Required field {{fieldName}} is unset!')
 * @param field 
 */
function throwForField(field: FieldDefinition): ThrowStatement | undefined {
  if (field.requiredness === 'required') {
    const errCtor = createPropertyAccess(COMMON_IDENTIFIERS['Thrift'], 'TProtocolException')
    const errType = createPropertyAccess(COMMON_IDENTIFIERS['Thrift'], 'TProtocolExceptionType.UNKNOWN')
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
  const comparison: BinaryExpression = createNotNull(`args.${field.name.value}`)
  const thenAssign: ExpressionStatement = assignmentForField(field)
  const elseThrow: ThrowStatement = throwForField(field)
  
  return createIf(
    comparison,
    createBlock([ thenAssign ], true),
    (elseThrow !== undefined) ? createBlock([ elseThrow ], true) : undefined
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
    defaultValue
  )
}
