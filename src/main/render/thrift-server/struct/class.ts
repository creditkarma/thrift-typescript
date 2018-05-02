import * as ts from 'typescript'

import {
    InterfaceWithFields,
    FieldDefinition,
} from '@creditkarma/thrift-parser'

import {
    IIdentifierMap
} from '../../../types'

import {
    renderValue,
} from '../values'

import {
    COMMON_IDENTIFIERS,
    THRIFT_IDENTIFIERS,
} from '../identifiers'

import {
    createClassConstructor,
    createNotNullCheck,
    createAssignmentStatement,
    propertyAccessForIdentifier,
    hasRequiredField,
    createFunctionParameter,
    throwProtocolException,
} from '../utils'

import {
    typeNodeForFieldType, createVoidType,
} from '../types'

import {
    classNameForStruct,
    implementsInterface,
    looseNameForStruct,
    codecNameForStruct,
    extendsAbstract,
    createSuperCall,
} from '../struct/utils'

export function renderClass(node: InterfaceWithFields, identifiers: IIdentifierMap): ts.ClassDeclaration {
    const fields: Array<ts.PropertyDeclaration> = createFieldsForStruct(node, identifiers)

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

    const argsParameter: ts.ParameterDeclaration = createArgsParameterForStruct(node, identifiers)

    // Build the constructor body
    const ctor: ts.ConstructorDeclaration = createClassConstructor(
        [ argsParameter ],
        [
            createSuperCall(),
            ...fieldAssignments,
        ],
    )

    // export class <node.name> { ... }
    return ts.createClassDeclaration(
        undefined,
        [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
        classNameForStruct(node),
        [],
        [
            extendsAbstract(),
            implementsInterface(node),
        ], // heritage
        [
            ...fields,
            ctor,
            createReadMethod(node),
            createWriteMethod(node),
        ]
    )
}

export function createWriteMethod(node: InterfaceWithFields): ts.MethodDeclaration {
    return ts.createMethod(
        undefined,
        [
            ts.createToken(ts.SyntaxKind.PublicKeyword),
        ],
        undefined,
        COMMON_IDENTIFIERS.write,
        undefined,
        undefined,
        [ createOutputParameter() ],
        createVoidType(),
        ts.createBlock([
            ts.createReturn(
                ts.createCall(
                    ts.createPropertyAccess(
                        ts.createIdentifier(
                            codecNameForStruct(node),
                        ),
                        COMMON_IDENTIFIERS.encode,
                    ),
                    undefined,
                    [
                        COMMON_IDENTIFIERS.this,
                        COMMON_IDENTIFIERS.output,
                    ]
                )
            )
        ], true)
    )
}

export function createReadMethod(node: InterfaceWithFields): ts.MethodDeclaration {
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
        [ createInputParameter() ],
        ts.createTypeReferenceNode(
            ts.createIdentifier(
                classNameForStruct(node),
            ),
            undefined,
        ),
        ts.createBlock([
            ts.createReturn(
                ts.createNew(
                    ts.createIdentifier(
                        classNameForStruct(node),
                    ),
                    undefined,
                    [
                        ts.createCall(
                            ts.createPropertyAccess(
                                ts.createIdentifier(codecNameForStruct(node)),
                                COMMON_IDENTIFIERS.decode,
                            ),
                            undefined,
                            [
                                COMMON_IDENTIFIERS.input,
                            ],
                        )
                    ],
                )
            )
        ], true),
    )
}

export function createOutputParameter(): ts.ParameterDeclaration {
    return createFunctionParameter(
        COMMON_IDENTIFIERS.output, // param name
        ts.createTypeReferenceNode(THRIFT_IDENTIFIERS.TProtocol, undefined) // param type
    )
}

export function createInputParameter(): ts.ParameterDeclaration {
    return createFunctionParameter(
        COMMON_IDENTIFIERS.input, // param name
        ts.createTypeReferenceNode(THRIFT_IDENTIFIERS.TProtocol, undefined) // param type
    )
}

export function createFieldsForStruct(node: InterfaceWithFields, identifiers: IIdentifierMap): Array<ts.PropertyDeclaration> {
    return node.fields.map((field: FieldDefinition) => {
        return renderFieldDeclarations(field, identifiers)
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
export function renderFieldDeclarations(field: FieldDefinition, identifiers: IIdentifierMap): ts.PropertyDeclaration {
    const defaultValue: ts.Expression | undefined = (
        (field.defaultValue !== null) ?
            renderValue(field.fieldType, field.defaultValue) :
            undefined
    )

    return ts.createProperty(
        undefined,
        [ ts.createToken(ts.SyntaxKind.PublicKeyword) ],
        ts.createIdentifier(field.name.value),
        (
            (field.requiredness === 'required') ?
                undefined :
                ts.createToken(ts.SyntaxKind.QuestionToken)
        ),
        typeNodeForFieldType(field.fieldType, identifiers, true),
        defaultValue
    )
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
    return createAssignmentStatement(
        propertyAccessForIdentifier(
            COMMON_IDENTIFIERS.this,
            field.name.value
        ),
        propertyAccessForIdentifier(
            COMMON_IDENTIFIERS.args,
            field.name.value
        )
    )
}

/**
 * Create the Error for a missing required field
 *
 * EXAMPLE
 *
 * throw new thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, 'Required field {{fieldName}} is unset!')
 */
export function throwForField(field: FieldDefinition): ts.ThrowStatement | undefined {
    if (field.requiredness === 'required') {
        return throwProtocolException(
            'UNKNOWN',
            `Required field[${field.name.value}] is unset!`
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
    const hasValue: ts.BinaryExpression = createNotNullCheck(ts.createPropertyAccess(
        COMMON_IDENTIFIERS.args,
        `${field.name.value}`
    ))
    const thenAssign: ts.Statement = assignmentForField(field)
    const elseThrow: ts.Statement | undefined = throwForField(field)

    return ts.createIf(
        hasValue,
        ts.createBlock([ thenAssign ], true),
        (elseThrow === undefined) ? undefined : ts.createBlock([ elseThrow ], true),
    )
}

function createDefaultInitializer(node: InterfaceWithFields): ts.Expression | undefined {
    if (hasRequiredField(node)) {
        return undefined
    } else {
        return ts.createObjectLiteral([])
    }
}

export function createArgsParameterForStruct(node: InterfaceWithFields, identifiers: IIdentifierMap): ts.ParameterDeclaration {
    return createFunctionParameter(
        COMMON_IDENTIFIERS.args, // param name
        createArgsTypeForStruct(node, identifiers), // param type
        createDefaultInitializer(node),
    )
}

function createArgsTypeForStruct(node: InterfaceWithFields, identifiers: IIdentifierMap): ts.TypeNode {
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
        ts.createIdentifier(looseNameForStruct(node)),
        undefined,
    )
}
