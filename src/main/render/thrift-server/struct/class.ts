import * as ts from 'typescript'

import {
    FieldDefinition,
    InterfaceWithFields,
} from '@creditkarma/thrift-parser'

import { renderAnnotations, renderFieldAnnotations } from '../annotations'

import { COMMON_IDENTIFIERS, THRIFT_IDENTIFIERS } from '../identifiers'

import {
    createClassConstructor,
    createFunctionParameter,
    createNotNullCheck,
    hasRequiredField,
} from '../utils'

import { renderValue } from '../initializers'

import { createVoidType, typeNodeForFieldType } from '../types'
import { assignmentForField } from './reader'

import ResolverFile from '../../../resolver/file'
import {
    classNameForStruct,
    createSuperCall,
    extendsAbstract,
    implementsInterface,
    looseNameForStruct,
    throwForField,
    tokens,
    toolkitNameForStruct,
} from './utils'

export function renderClass(
    node: InterfaceWithFields,
    file: ResolverFile,
    isExported: boolean,
): ts.ClassDeclaration {
    const fields: Array<ts.PropertyDeclaration> = createFieldsForStruct(
        node,
        file,
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
        (field: FieldDefinition) => {
            return createFieldAssignment(field, file)
        },
    )

    const argsParameter: ts.ParameterDeclaration = createArgsParameterForStruct(
        node,
        file,
    )

    // Build the constructor body
    const ctor: ts.ConstructorDeclaration = createClassConstructor(
        [argsParameter],
        [createSuperCall(), ...fieldAssignments],
    )

    // export class <node.name> { ... }
    return ts.createClassDeclaration(
        undefined,
        tokens(isExported),
        classNameForStruct(node),
        [],
        [extendsAbstract(), implementsInterface(node, file)], // heritage
        [
            ...fields,
            annotations,
            fieldAnnotations,
            ctor,
            createStaticReadMethod(node),
            createStaticWriteMethod(node, file),
            createWriteMethod(node),
        ],
    )
}

export function createWriteMethod(
    node: InterfaceWithFields,
): ts.MethodDeclaration {
    return ts.createMethod(
        undefined,
        [ts.createToken(ts.SyntaxKind.PublicKeyword)],
        undefined,
        COMMON_IDENTIFIERS.write,
        undefined,
        undefined,
        [createOutputParameter()],
        createVoidType(),
        ts.createBlock(
            [
                ts.createReturn(
                    ts.createCall(
                        ts.createPropertyAccess(
                            ts.createIdentifier(toolkitNameForStruct(node)),
                            COMMON_IDENTIFIERS.encode,
                        ),
                        undefined,
                        [COMMON_IDENTIFIERS.this, COMMON_IDENTIFIERS.output],
                    ),
                ),
            ],
            true,
        ),
    )
}

export function createStaticWriteMethod(
    node: InterfaceWithFields,
    file: ResolverFile,
): ts.MethodDeclaration {
    return ts.createMethod(
        undefined,
        [
            ts.createToken(ts.SyntaxKind.PublicKeyword),
            ts.createToken(ts.SyntaxKind.StaticKeyword),
        ],
        undefined,
        COMMON_IDENTIFIERS.write,
        undefined,
        undefined,
        [
            createFunctionParameter(
                COMMON_IDENTIFIERS.args,
                ts.createTypeReferenceNode(
                    ts.createIdentifier(looseNameForStruct(node, file)),
                    undefined,
                ),
            ),
            createOutputParameter(),
        ],
        createVoidType(),
        ts.createBlock(
            [
                ts.createReturn(
                    ts.createCall(
                        ts.createPropertyAccess(
                            ts.createIdentifier(toolkitNameForStruct(node)),
                            COMMON_IDENTIFIERS.encode,
                        ),
                        undefined,
                        [COMMON_IDENTIFIERS.args, COMMON_IDENTIFIERS.output],
                    ),
                ),
            ],
            true,
        ),
    )
}

export function createStaticReadMethod(
    node: InterfaceWithFields,
): ts.MethodDeclaration {
    return ts.createMethod(
        undefined,
        [
            ts.createToken(ts.SyntaxKind.PublicKeyword),
            ts.createToken(ts.SyntaxKind.StaticKeyword),
        ],
        undefined,
        COMMON_IDENTIFIERS.read,
        undefined,
        undefined,
        [createInputParameter()],
        ts.createTypeReferenceNode(
            ts.createIdentifier(classNameForStruct(node)),
            undefined,
        ),
        ts.createBlock(
            [
                ts.createReturn(
                    ts.createNew(
                        ts.createIdentifier(classNameForStruct(node)),
                        undefined,
                        [
                            ts.createCall(
                                ts.createPropertyAccess(
                                    ts.createIdentifier(
                                        toolkitNameForStruct(node),
                                    ),
                                    COMMON_IDENTIFIERS.decode,
                                ),
                                undefined,
                                [COMMON_IDENTIFIERS.input],
                            ),
                        ],
                    ),
                ),
            ],
            true,
        ),
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
    file: ResolverFile,
): Array<ts.PropertyDeclaration> {
    return node.fields.map((field: FieldDefinition) => {
        return renderFieldDeclarations(field, file)
    })
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
    file: ResolverFile,
): ts.PropertyDeclaration {
    const defaultValue: ts.Expression | undefined =
        field.defaultValue !== null
            ? renderValue(field.fieldType, field.defaultValue, file)
            : undefined

    return ts.createProperty(
        undefined,
        [ts.createToken(ts.SyntaxKind.PublicKeyword)],
        ts.createIdentifier(field.name.value),
        field.requiredness === 'required'
            ? undefined
            : ts.createToken(ts.SyntaxKind.QuestionToken),
        typeNodeForFieldType(field.fieldType, file),
        defaultValue,
    )
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
    file: ResolverFile,
): ts.IfStatement {
    const hasValue: ts.BinaryExpression = createNotNullCheck(
        ts.createPropertyAccess(COMMON_IDENTIFIERS.args, `${field.name.value}`),
    )
    const thenAssign: Array<ts.Statement> = assignmentForField(field, file)
    const elseThrow: ts.Statement | undefined = throwForField(field)

    return ts.createIf(
        hasValue,
        ts.createBlock([...thenAssign], true),
        elseThrow === undefined ? undefined : ts.createBlock([elseThrow], true),
    )
}

function createDefaultInitializer(
    node: InterfaceWithFields,
): ts.Expression | undefined {
    if (hasRequiredField(node)) {
        return undefined
    } else {
        return ts.createObjectLiteral([])
    }
}

export function createArgsParameterForStruct(
    node: InterfaceWithFields,
    file: ResolverFile,
): ts.ParameterDeclaration {
    return createFunctionParameter(
        COMMON_IDENTIFIERS.args, // param name
        createArgsTypeForStruct(node, file), // param type
        createDefaultInitializer(node),
    )
}

function createArgsTypeForStruct(
    node: InterfaceWithFields,
    file: ResolverFile,
): ts.TypeNode {
    // return ts.createTypeLiteralNode(
    //     node.fields.map((field: FieldDefinition): ts.TypeElement => {
    //         return ts.createPropertySignature(
    //             undefined,
    //             field.name.value,
    //             renderOptional(field.requiredness),
    //             typeNodeForFieldType(field.fieldType, identifiers, true),
    //             undefined,
    //         )
    //     })
    // )
    return ts.createTypeReferenceNode(
        ts.createIdentifier(looseNameForStruct(node, file)),
        undefined,
    )
}
