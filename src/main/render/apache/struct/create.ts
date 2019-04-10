import * as ts from 'typescript'

import {
    FieldDefinition,
    InterfaceWithFields,
    SyntaxType,
} from '@creditkarma/thrift-parser'

import {
    createAssignmentStatement,
    createClassConstructor,
    createFunctionParameter,
    createNotNullCheck,
    hasRequiredField,
    propertyAccessForIdentifier,
    renderOptional,
    throwProtocolException,
} from '../utils'

import { renderValue } from '../values'

import { COMMON_IDENTIFIERS } from '../identifiers'

import { typeNodeForFieldType } from '../types'

import { interfaceNameForClass } from '../interface'

import { IRenderState } from '../../../types'
import { createReadMethod } from './read'
import { createWriteMethod } from './write'

export function renderStruct(
    node: InterfaceWithFields,
    state: IRenderState,
): ts.ClassDeclaration {
    const fields: Array<ts.PropertyDeclaration> = createFieldsForStruct(
        node,
        state,
    )

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
    const fieldAssignments: Array<ts.IfStatement> = node.fields.map(
        createFieldAssignment,
    )

    const argsParameter: Array<
        ts.ParameterDeclaration
    > = createArgsParameterForStruct(node)

    // Build the constructor body
    const ctor: ts.ConstructorDeclaration = createClassConstructor(
        argsParameter,
        [...fieldAssignments],
    )

    // Build the `read` method
    const readMethod: ts.MethodDeclaration = createReadMethod(node, state)

    // Build the `write` method
    const writeMethod: ts.MethodDeclaration = createWriteMethod(node, state)

    // export class <node.name> { ... }
    return ts.createClassDeclaration(
        undefined,
        [ts.createToken(ts.SyntaxKind.ExportKeyword)],
        node.name.value,
        [],
        [], // heritage
        [...fields, ctor, writeMethod, readMethod],
    )
}

export function createFieldsForStruct(
    node: InterfaceWithFields,
    state: IRenderState,
): Array<ts.PropertyDeclaration> {
    return node.fields.map((next: FieldDefinition) => {
        return renderFieldDeclarations(next, state)
    })
}

export function createArgsTypeForStruct(
    node: InterfaceWithFields,
): ts.TypeReferenceNode {
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
 */
export function assignmentForField(field: FieldDefinition): ts.Statement {
    if (field.fieldType.type === SyntaxType.I64Keyword) {
        return ts.createIf(
            ts.createBinary(
                ts.createTypeOf(
                    ts.createIdentifier(`args.${field.name.value}`),
                ),
                ts.SyntaxKind.EqualsEqualsEqualsToken,
                ts.createLiteral('number'),
            ),
            ts.createBlock(
                [
                    createAssignmentStatement(
                        propertyAccessForIdentifier('this', field.name.value),
                        ts.createNew(COMMON_IDENTIFIERS.Node_Int64, undefined, [
                            ts.createIdentifier(`args.${field.name.value}`),
                        ]),
                    ),
                ],
                true,
            ),
            ts.createBlock(
                [
                    createAssignmentStatement(
                        propertyAccessForIdentifier('this', field.name.value),
                        propertyAccessForIdentifier('args', field.name.value),
                    ),
                ],
                true,
            ),
        )
    } else {
        return createAssignmentStatement(
            propertyAccessForIdentifier('this', field.name.value),
            propertyAccessForIdentifier('args', field.name.value),
        )
    }
}

/**
 * Create the Error for a missing required field
 *
 * EXAMPLE
 *
 * throw new Thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, 'Required field {{fieldName}} is unset!')
 */
export function throwForField(
    field: FieldDefinition,
): ts.ThrowStatement | undefined {
    if (field.requiredness === 'required') {
        return throwProtocolException(
            'UNKNOWN',
            `Required field[${field.name.value}] is unset!`,
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
    const isArgsNull: ts.BinaryExpression = createNotNullCheck('args')
    const isValue: ts.BinaryExpression = createNotNullCheck(
        `args.${field.name.value}`,
    )
    const comparison: ts.BinaryExpression = ts.createBinary(
        isArgsNull,
        ts.SyntaxKind.AmpersandAmpersandToken,
        isValue,
    )
    const thenAssign: ts.Statement = assignmentForField(field)
    const elseThrow: ts.Statement | undefined = throwForField(field)

    return ts.createIf(
        comparison,
        ts.createBlock([thenAssign], true),
        elseThrow === undefined ? undefined : ts.createBlock([elseThrow], true),
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
export function renderFieldDeclarations(
    field: FieldDefinition,
    state: IRenderState,
): ts.PropertyDeclaration {
    const defaultValue =
        field.defaultValue !== null
            ? renderValue(field.fieldType, field.defaultValue, state)
            : undefined

    return ts.createProperty(
        undefined,
        [ts.createToken(ts.SyntaxKind.PublicKeyword)],
        ts.createIdentifier(field.name.value),
        renderOptional(field.requiredness),
        typeNodeForFieldType(field.fieldType, state),
        defaultValue,
    )
}

export function createArgsParameterForStruct(
    node: InterfaceWithFields,
): Array<ts.ParameterDeclaration> {
    if (node.fields.length > 0) {
        return [
            createFunctionParameter(
                'args', // param name
                createArgsTypeForStruct(node), // param type
                undefined, // initializer
                !hasRequiredField(node), // optional?
            ),
        ]
    } else {
        return []
    }
}
