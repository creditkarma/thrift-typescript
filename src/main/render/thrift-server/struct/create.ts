import * as ts from 'typescript'

import {
    InterfaceWithFields,
    FieldDefinition,
    SyntaxType,
} from '@creditkarma/thrift-parser'

import {
    IIdentifierMap
} from '../../../types'

import {
    THRIFT_IDENTIFIERS
} from '../identifiers'

import {
    throwProtocolException,
} from '../utils'

import { createReadMethod } from './read'
import { createWriteMethod } from './write'

import {
    COMMON_IDENTIFIERS,
} from '../../shared/identifiers'

import {
    createClassConstructor,
    createAssignmentStatement,
    propertyAccessForIdentifier,
    createNotNullCheck,
} from '../../shared/utils'

import {
    createArgsParameterForStruct,
    renderFieldDeclarations,
} from '../../shared/struct'

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

    const argsParameter: ts.ParameterDeclaration = createArgsParameterForStruct(node)

    // Build the constructor body
    const ctor: ts.ConstructorDeclaration = createClassConstructor(
        [ argsParameter ],
        [ ...fieldAssignments ]
    )

    // Build the `read` method
    const readMethod: ts.MethodDeclaration = createReadMethod(node, identifiers)

    // Build the `write` method
    const writeMethod: ts.MethodDeclaration = createWriteMethod(node, identifiers)

    const heritage: ts.HeritageClause = ts.createHeritageClause(
        ts.SyntaxKind.ImplementsKeyword,
        [
            ts.createExpressionWithTypeArguments(
                [],
                THRIFT_IDENTIFIERS.StructLike,
            )
        ]
    )

    // export class <node.name> { ... }
    return ts.createClassDeclaration(
        undefined,
        [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
        node.name.value,
        [],
        [ heritage ], // heritage
        [ ...fields, ctor, writeMethod, readMethod ]
    )
}

export function createFieldsForStruct(node: InterfaceWithFields): Array<ts.PropertyDeclaration> {
    return node.fields.map(renderFieldDeclarations)
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
export function assignmentForField(field: FieldDefinition): ts.Statement {
    if (field.fieldType.type === SyntaxType.I64Keyword) {
        return ts.createIf(
        ts.createBinary(
            ts.createTypeOf(ts.createIdentifier(`args.${field.name.value}`)),
            ts.SyntaxKind.EqualsEqualsEqualsToken,
            ts.createLiteral('number')
        ),
        ts.createBlock([
            createAssignmentStatement(
            propertyAccessForIdentifier('this', field.name.value),
            ts.createNew(
                COMMON_IDENTIFIERS.Int64,
                undefined,
                [
                    ts.createIdentifier(`args.${field.name.value}`)
                ]
            )
            )
        ], true),
        ts.createBlock([
            createAssignmentStatement(
                propertyAccessForIdentifier('this', field.name.value),
                propertyAccessForIdentifier('args', field.name.value)
            )
        ], true)
        )
    } else {
        return createAssignmentStatement(
            propertyAccessForIdentifier('this', field.name.value),
            propertyAccessForIdentifier('args', field.name.value)
        )
    }
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
    const isArgsNull: ts.BinaryExpression = createNotNullCheck('args')
    const isValue: ts.BinaryExpression = createNotNullCheck(`args.${field.name.value}`)
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
        (elseThrow === undefined) ? undefined : ts.createBlock([elseThrow], true),
    )
}
