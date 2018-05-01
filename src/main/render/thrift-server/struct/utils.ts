import * as ts from 'typescript'

import {
    FieldDefinition,
    InterfaceWithFields,
    SyntaxType,
} from '@creditkarma/thrift-parser'

import {
    COMMON_IDENTIFIERS,
    THRIFT_IDENTIFIERS,
} from '../identifiers'

import {
    IIdentifierMap,
} from '../../../types'

import {
    typeNodeForFieldType,
} from '../types'

import {
    createConstStatement,
    getInitializerForField,
} from '../utils'

export function createTempVariables(node: InterfaceWithFields, identifiers: IIdentifierMap): Array<ts.VariableStatement> {
    const structFields: Array<FieldDefinition> = node.fields.filter((next: FieldDefinition): boolean => {
        return next.fieldType.type !== SyntaxType.VoidKeyword
    })

    if (structFields.length > 0) {
        return [ createConstStatement(
            COMMON_IDENTIFIERS.obj,
            undefined,
            ts.createObjectLiteral(
                node.fields.map((next: FieldDefinition): ts.ObjectLiteralElementLike => {
                    return ts.createPropertyAssignment(
                        next.name.value,
                        getInitializerForField('args', next, true),
                    )
                }),
                true, // multiline
            ),
        ) ]
    } else {
        return []
    }
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
export function renderOptional(field: FieldDefinition): ts.Token<ts.SyntaxKind.QuestionToken> | undefined {
    if (field.requiredness === 'required') {
        return undefined
    } else {
        return ts.createToken(ts.SyntaxKind.QuestionToken)
    }
}

function renderFieldDeclarations(field: FieldDefinition, identifiers: IIdentifierMap): ts.PropertyDeclaration {
    return ts.createProperty(
        undefined,
        [ ts.createToken(ts.SyntaxKind.PublicKeyword) ],
        ts.createIdentifier(field.name.value),
        renderOptional(field),
        typeNodeForFieldType(field.fieldType, identifiers, true),
        undefined,
    )
}

export function extendsAbstract(): ts.HeritageClause {
    return ts.createHeritageClause(
        ts.SyntaxKind.ExtendsKeyword,
        [
            ts.createExpressionWithTypeArguments(
                [],
                THRIFT_IDENTIFIERS.IStructLike,
            ),
        ],
    )
}

export function implementsInterface(node: InterfaceWithFields): ts.HeritageClause {
    return ts.createHeritageClause(
        ts.SyntaxKind.ImplementsKeyword,
        [
            ts.createExpressionWithTypeArguments(
                [],
                ts.createIdentifier(`I${node.name.value}_Loose`),
            ),
        ],
    )
}

export function createSuperCall(): ts.Statement {
    return ts.createStatement(
        ts.createCall(
            ts.createIdentifier('super'),
            undefined,
            [],
        ),
    )
}
