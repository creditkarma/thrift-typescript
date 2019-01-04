import * as ts from 'typescript'

import {
    FieldDefinition,
    InterfaceWithFields,
    UnionDefinition,
} from '@creditkarma/thrift-parser'

import { IIdentifierMap } from '../../../types'

import { COMMON_IDENTIFIERS, THRIFT_IDENTIFIERS } from '../identifiers'

import {
    createClassConstructor,
    createFunctionParameter,
    createNotNullCheck,
} from '../utils'

import {
    classNameForStruct,
    createSuperCall,
    extendsAbstract,
    implementsInterface,
    throwForField,
    tokens,
} from '../struct/utils'

import {
    assignmentForField as _assignmentForField,
    createArgsParameterForStruct,
    createStaticReadMethod,
    createStaticWriteMethod,
    createWriteMethod,
    renderFieldDeclarations,
} from '../struct/class'

import {
    createFieldIncrementer,
    createFieldValidation,
    incrementFieldsSet,
} from './utils'

import { renderAnnotations, renderFieldAnnotations } from '../annotations'

export function renderClass(
    node: UnionDefinition,
    identifiers: IIdentifierMap,
    isExported: boolean,
): ts.ClassDeclaration {
    const fields: Array<ts.PropertyDeclaration> = createFieldsForStruct(
        node,
        identifiers,
    )

    const annotations: ts.PropertyDeclaration = renderAnnotations(
        node.annotations,
    )

    const fieldAnnotations: ts.PropertyDeclaration = renderFieldAnnotations(
        node.fields,
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
        (next: FieldDefinition) => {
            return createFieldAssignment(next, identifiers)
        },
    )

    const argsParameter: ts.ParameterDeclaration = createArgsParameterForStruct(
        node,
        identifiers,
    )

    // Build the constructor body
    const ctor: ts.ConstructorDeclaration = createClassConstructor(
        [argsParameter],
        [
            createSuperCall(),
            createFieldIncrementer(),
            ...fieldAssignments,
            createFieldValidation(node),
        ],
    )

    // export class <node.name> { ... }
    return ts.createClassDeclaration(
        undefined,
        tokens(isExported),
        classNameForStruct(node),
        [],
        [extendsAbstract(), implementsInterface(node)], // heritage
        [
            ...fields,
            annotations,
            fieldAnnotations,
            ctor,
            createStaticReadMethod(node),
            createStaticWriteMethod(node),
            createWriteMethod(node),
        ],
    )
}

export function createOutputParameter(): ts.ParameterDeclaration {
    return createFunctionParameter(
        COMMON_IDENTIFIERS.output, // param name
        ts.createTypeReferenceNode(THRIFT_IDENTIFIERS.TProtocol, undefined), // param type
    )
}

export function createInputParameter(): ts.ParameterDeclaration {
    return createFunctionParameter(
        COMMON_IDENTIFIERS.input, // param name
        ts.createTypeReferenceNode(THRIFT_IDENTIFIERS.TProtocol, undefined), // param type
    )
}

export function createFieldsForStruct(
    node: InterfaceWithFields,
    identifiers: IIdentifierMap,
): Array<ts.PropertyDeclaration> {
    return node.fields.map((field: FieldDefinition) => {
        return renderFieldDeclarations(field, identifiers)
    })
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
export function assignmentForField(
    field: FieldDefinition,
    identifiers: IIdentifierMap,
): Array<ts.Statement> {
    return [incrementFieldsSet(), ..._assignmentForField(field, identifiers)]
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
export function createFieldAssignment(
    field: FieldDefinition,
    identifiers: IIdentifierMap,
): ts.IfStatement {
    const hasValue: ts.BinaryExpression = createNotNullCheck(
        ts.createPropertyAccess(COMMON_IDENTIFIERS.args, `${field.name.value}`),
    )
    const thenAssign: Array<ts.Statement> = assignmentForField(
        field,
        identifiers,
    )
    const elseThrow: ts.Statement | undefined = throwForField(field)

    return ts.createIf(
        hasValue,
        ts.createBlock([...thenAssign], true),
        elseThrow === undefined ? undefined : ts.createBlock([elseThrow], true),
    )
}
