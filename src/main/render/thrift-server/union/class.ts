import * as ts from 'typescript'

import {
    FieldDefinition,
    UnionDefinition,
} from '@creditkarma/thrift-parser'

import {
    createAssignmentStatement,
    createClassConstructor,
    createFunctionParameter,
    createNotNullCheck,
    propertyAccessForIdentifier,
} from '../utils'

import {
    COMMON_IDENTIFIERS,
} from '../identifiers'

import {
    createWriteMethod,
} from './write'

import {
    createReadMethod,
} from './read'

import {
    IIdentifierMap,
} from '../../../types'

import {
    createFieldsForStruct,
    // createTempVariables,
    extendsAbstract,
    implementsInterface,
} from '../struct/utils'

import {
    throwForField,
} from '../struct/class'

import {
    createFieldIncrementer,
    createFieldValidation,
    incrementFieldsSet,
} from './utils'

export function renderClass(node: UnionDefinition, identifiers: IIdentifierMap): ts.ClassDeclaration {
    const fields: Array<ts.PropertyDeclaration> = createFieldsForStruct(node, identifiers)

    const fieldAssignments: Array<ts.IfStatement> = node.fields.map(createFieldAssignment)

    const ctor: ts.ConstructorDeclaration = createClassConstructor(
        [
            createFunctionParameter(
                COMMON_IDENTIFIERS.args,
                ts.createTypeReferenceNode(
                    ts.createIdentifier(`I${node.name.value}_Loose`),
                    undefined,
                ),
            ),
        ],
        [
            ts.createStatement(
                ts.createCall(
                    ts.createIdentifier('super'),
                    undefined,
                    [],
                ),
            ),
            createFieldIncrementer(),
            ...fieldAssignments,
            createFieldValidation(),
        ],
    )

    return ts.createClassDeclaration(
        undefined,
        [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
        node.name.value,
        [],
        [
            extendsAbstract(),
            implementsInterface(node),
        ], // heritage
        [
            ...fields,
            ctor,
            createWriteMethod(node, identifiers),
            createReadMethod(node, identifiers),
        ], // fields
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
export function createFieldAssignment(field: FieldDefinition): ts.IfStatement {
    const hasValue: ts.BinaryExpression = createNotNullCheck(`args.${field.name.value}`)
    const thenAssign: Array<ts.Statement> = assignmentForField(field)
    const elseThrow: ts.Statement | undefined = throwForField(field)

    return ts.createIf(
        hasValue,
        ts.createBlock([ ...thenAssign ], true),
        (elseThrow === undefined) ? undefined : ts.createBlock([ elseThrow ], true),
    )
}

function assignmentForField(field: FieldDefinition): Array<ts.Statement> {
    return [
        incrementFieldsSet(),
        createAssignmentStatement(
            propertyAccessForIdentifier('this', field.name.value),
            propertyAccessForIdentifier('args', field.name.value),
        ),
    ]
}
