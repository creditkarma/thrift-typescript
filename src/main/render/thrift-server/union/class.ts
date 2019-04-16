import * as ts from 'typescript'

import {
    FieldDefinition,
    InterfaceWithFields,
    UnionDefinition,
} from '@creditkarma/thrift-parser'

import { IRenderState } from '../../../types'

import { COMMON_IDENTIFIERS, THRIFT_IDENTIFIERS } from '../identifiers'

import { createClassConstructor, createFunctionParameter } from '../utils'

import {
    classNameForStruct,
    createSuperCall,
    extendsAbstract,
    implementsInterface,
    tokens,
} from '../struct/utils'

import {
    createArgsParameterForStruct,
    createStaticReadMethod,
    createStaticWriteMethod,
    createWriteMethod,
    renderFieldDeclarations,
} from '../struct/class'

import { assignmentForField as _assignmentForField } from '../struct/reader'

import {
    createFieldAssignment,
    createFieldIncrementer,
    createFieldValidation,
} from './utils'

import { renderAnnotations, renderFieldAnnotations } from '../annotations'

export function renderClass(
    node: UnionDefinition,
    state: IRenderState,
    isExported: boolean,
): ts.ClassDeclaration {
    const fields: Array<ts.PropertyDeclaration> = [
        ...createFieldsForStruct(node, state),
        renderAnnotations(node.annotations),
        renderFieldAnnotations(node.fields),
    ]

    if (state.options.withNameField) {
        const nameField: ts.PropertyDeclaration = ts.createProperty(
            undefined,
            [
                ts.createToken(ts.SyntaxKind.PublicKeyword),
                ts.createToken(ts.SyntaxKind.ReadonlyKeyword),
            ],
            COMMON_IDENTIFIERS.__name,
            undefined,
            undefined,
            ts.createLiteral(node.name.value),
        )

        fields.splice(-2, 0, nameField)
    }

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
            return createFieldAssignment(next, state)
        },
    )

    const argsParameter: ts.ParameterDeclaration = createArgsParameterForStruct(
        node,
        state,
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
        classNameForStruct(node, state),
        [],
        [extendsAbstract(), implementsInterface(node, state)], // heritage
        [
            ...fields,
            ctor,
            createStaticReadMethod(node, state),
            createStaticWriteMethod(node, state),
            createWriteMethod(node, state),
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
    state: IRenderState,
): Array<ts.PropertyDeclaration> {
    return node.fields.map((field: FieldDefinition) => {
        return renderFieldDeclarations(field, state)
    })
}
