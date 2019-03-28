import * as ts from 'typescript'

import {
    FieldDefinition,
    InterfaceWithFields,
    SyntaxType,
    UnionDefinition,
} from '@creditkarma/thrift-parser'

import { COMMON_IDENTIFIERS } from '../identifiers'

import { thriftTypeForFieldType } from '../types'

import { createFunctionParameter } from '../utils'

import {
    createEqualsCheck,
    getInitializerForField,
    hasRequiredField,
    throwProtocolException,
} from '../utils'

import {
    createCheckForFields,
    createSkipBlock,
    readValueForFieldType,
} from '../struct/decode'

import ResolverFile from '../../../resolver/file'
import { strictNameForStruct } from '../struct/utils'
import { fieldTypeAccess, unionTypeName } from './union-fields'
import {
    createFieldAssignment,
    createFieldIncrementer,
    createFieldValidation,
    createReturnVariable,
    incrementFieldsSet,
} from './utils'

function createArgsParameter(node: UnionDefinition): ts.ParameterDeclaration {
    return createFunctionParameter(
        'args', // param name
        ts.createTypeReferenceNode(
            ts.createIdentifier(unionTypeName(node.name.value, false)),
            undefined,
        ),
    )
}

export function createCreateMethod(
    node: UnionDefinition,
    file: ResolverFile,
): ts.MethodDeclaration {
    const inputParameter: ts.ParameterDeclaration = createArgsParameter(node)
    const returnVariable: ts.VariableStatement = createReturnVariable(
        node,
        file,
    )

    const fieldsSet: ts.VariableStatement = createFieldIncrementer()

    const fieldAssignments: Array<ts.IfStatement> = node.fields.map(
        (next: FieldDefinition) => {
            return createFieldAssignment(next, file)
        },
    )

    return ts.createMethod(
        undefined,
        undefined,
        undefined,
        COMMON_IDENTIFIERS.create,
        undefined,
        undefined,
        [inputParameter],
        ts.createTypeReferenceNode(
            ts.createIdentifier(strictNameForStruct(node, file)),
            undefined,
        ), // return type
        ts.createBlock(
            [
                fieldsSet,
                returnVariable,
                ...fieldAssignments,
                createFieldValidation(node),
                ts.createIf(
                    ts.createBinary(
                        COMMON_IDENTIFIERS._returnValue,
                        ts.SyntaxKind.ExclamationEqualsEqualsToken,
                        ts.createNull(),
                    ),
                    ts.createBlock(
                        [createReturnForFields(node, node.fields, file)],
                        true,
                    ),
                    ts.createBlock(
                        [
                            throwProtocolException(
                                'UNKNOWN',
                                'Unable to read data for TUnion',
                            ),
                        ],
                        true,
                    ),
                ),
            ],
            true,
        ),
    )
}

function createUnionObjectForField(
    node: UnionDefinition,
    field: FieldDefinition,
    file: ResolverFile,
): ts.ObjectLiteralExpression {
    return ts.createObjectLiteral(
        [
            ts.createPropertyAssignment(
                COMMON_IDENTIFIERS.__type,
                ts.createIdentifier(fieldTypeAccess(node, field, file)),
            ),
            ts.createPropertyAssignment(
                ts.createIdentifier(field.name.value),
                ts.createPropertyAccess(
                    COMMON_IDENTIFIERS._returnValue,
                    field.name.value,
                ),
            ),
        ],
        true,
    )
}

function createReturnForFields(
    node: UnionDefinition,
    fields: Array<FieldDefinition>,
    file: ResolverFile,
): ts.Statement {
    if (file.schema.options.strictUnions) {
        const [head, ...tail] = fields
        if (tail.length > 0) {
            return ts.createIf(
                ts.createPropertyAccess(
                    COMMON_IDENTIFIERS._returnValue,
                    head.name.value,
                ),
                ts.createBlock(
                    [
                        ts.createReturn(
                            createUnionObjectForField(node, head, file),
                        ),
                    ],
                    true,
                ),
                ts.createBlock([createReturnForFields(node, tail, file)], true),
            )
        } else {
            return ts.createReturn(createUnionObjectForField(node, head, file))
        }
    } else {
        return ts.createReturn(COMMON_IDENTIFIERS._returnValue)
    }
}

/**
 * EXAMPLE
 *
 * case 1: {
 *   if (fieldType === Thrift.Type.I32) {
 *     this.id = input.readI32();
 *   }
 *   else {
 *     input.skip(fieldType);
 *   }
 *   break;
 * }
 */
export function createCaseForField(
    node: UnionDefinition,
    field: FieldDefinition,
    file: ResolverFile,
): ts.CaseClause {
    const fieldAlias: ts.Identifier = ts.createUniqueName('value')
    const checkType: ts.IfStatement = ts.createIf(
        createEqualsCheck(
            COMMON_IDENTIFIERS.fieldType,
            thriftTypeForFieldType(field.fieldType, file),
        ),
        ts.createBlock(
            [
                incrementFieldsSet(),
                ...readValueForFieldType(field.fieldType, fieldAlias, file),
                ...endReadForField(fieldAlias, field),
            ],
            true,
        ),
        createSkipBlock(),
    )

    if (field.fieldID !== null) {
        return ts.createCaseClause(ts.createLiteral(field.fieldID.value), [
            checkType,
            ts.createBreak(),
        ])
    } else {
        throw new Error(`FieldID on line ${field.loc.start.line} is null`)
    }
}

export function endReadForField(
    fieldName: ts.Identifier,
    field: FieldDefinition,
): Array<ts.Statement> {
    switch (field.fieldType.type) {
        case SyntaxType.VoidKeyword:
            return []

        default:
            return [
                ts.createStatement(
                    ts.createAssignment(
                        COMMON_IDENTIFIERS._returnValue,
                        ts.createObjectLiteral([
                            ts.createPropertyAssignment(
                                field.name.value,
                                fieldName,
                            ),
                        ]),
                    ),
                ),
            ]
    }
}

export function createReturnForStruct(
    struct: InterfaceWithFields,
    file: ResolverFile,
): ts.Statement {
    if (hasRequiredField(struct)) {
        return ts.createIf(
            createCheckForFields(struct.fields),
            ts.createBlock(
                [
                    ts.createReturn(
                        ts.createObjectLiteral(
                            struct.fields.map(
                                (
                                    next: FieldDefinition,
                                ): ts.ObjectLiteralElementLike => {
                                    return ts.createPropertyAssignment(
                                        next.name.value,
                                        getInitializerForField(
                                            '_args',
                                            next,
                                            file,
                                        ),
                                    )
                                },
                            ),
                            true, // multiline
                        ),
                    ),
                ],
                true,
            ),
            ts.createBlock(
                [
                    throwProtocolException(
                        'UNKNOWN',
                        `Unable to read ${struct.name.value} from input`,
                    ),
                ],
                true,
            ),
        )
    } else {
        return ts.createReturn(
            ts.createNew(ts.createIdentifier(struct.name.value), undefined, [
                COMMON_IDENTIFIERS._args,
            ]),
        )
    }
}
