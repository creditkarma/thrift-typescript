import {
    Annotation,
    Annotations,
    FieldDefinition,
    FunctionDefinition,
} from '@creditkarma/thrift-parser'
import * as ts from 'typescript'

import { COMMON_IDENTIFIERS, THRIFT_IDENTIFIERS } from './identifiers'

const validIdentifierPattern = /^[a-z$_][0-9a-z$_]*$/i

function renderAnnotationValue(
    annotations?: Annotations,
): ts.ObjectLiteralExpression {
    return ts.createObjectLiteral(
        annotations !== undefined
            ? annotations.annotations.map((annotation: Annotation) => {
                  const name = annotation.name.value
                  const identifier = validIdentifierPattern.test(name)
                      ? name
                      : `'${name}'`
                  return ts.createPropertyAssignment(
                      identifier,
                      annotation.value !== undefined
                          ? ts.createLiteral(annotation.value.value)
                          : ts.createLiteral(''),
                  )
              })
            : [],
        true,
    )
}

export function renderAnnotations(
    annotations?: Annotations,
): ts.PropertyDeclaration {
    return ts.createProperty(
        undefined,
        [
            ts.createToken(ts.SyntaxKind.PublicKeyword),
            ts.createToken(ts.SyntaxKind.ReadonlyKeyword),
        ],
        COMMON_IDENTIFIERS._annotations,
        undefined,
        ts.createTypeReferenceNode(
            THRIFT_IDENTIFIERS.IThriftAnnotations,
            undefined,
        ),
        renderAnnotationValue(annotations),
    )
}

export function renderServiceAnnotations(
    annotations: Annotations,
): ts.VariableStatement {
    return ts.createVariableStatement(
        [ts.createToken(ts.SyntaxKind.ExportKeyword)],
        ts.createVariableDeclarationList(
            [
                ts.createVariableDeclaration(
                    COMMON_IDENTIFIERS.annotations,
                    ts.createTypeReferenceNode(
                        THRIFT_IDENTIFIERS.IThriftAnnotations,
                        undefined,
                    ),
                    renderAnnotationValue(annotations),
                ),
            ],
            ts.NodeFlags.Const,
        ),
    )
}

export function renderServiceAnnotationsProperty(): ts.PropertyDeclaration {
    return ts.createProperty(
        undefined,
        [
            ts.createToken(ts.SyntaxKind.PublicKeyword),
            ts.createToken(ts.SyntaxKind.ReadonlyKeyword),
        ],
        COMMON_IDENTIFIERS._annotations,
        undefined,
        ts.createTypeReferenceNode(
            THRIFT_IDENTIFIERS.IThriftAnnotations,
            undefined,
        ),
        COMMON_IDENTIFIERS.annotations,
    )
}

export function renderServiceAnnotationsStaticProperty(): ts.PropertyDeclaration {
    return ts.createProperty(
        undefined,
        [
            ts.createToken(ts.SyntaxKind.PublicKeyword),
            ts.createToken(ts.SyntaxKind.StaticKeyword),
            ts.createToken(ts.SyntaxKind.ReadonlyKeyword),
        ],
        COMMON_IDENTIFIERS.annotations,
        undefined,
        ts.createTypeReferenceNode(
            THRIFT_IDENTIFIERS.IThriftAnnotations,
            undefined,
        ),
        COMMON_IDENTIFIERS.annotations,
    )
}

function renderFieldAnnotationValue(
    fields: Array<FieldDefinition>,
): ts.ObjectLiteralExpression {
    return ts.createObjectLiteral(
        fields
            .filter((field: FieldDefinition) => {
                return field.annotations !== undefined
            })
            .map((field: FieldDefinition) => {
                return ts.createPropertyAssignment(
                    ts.createIdentifier(field.name.value),
                    renderAnnotationValue(field.annotations),
                )
            }),
        true,
    )
}

export function renderFieldAnnotations(
    fields: Array<FieldDefinition>,
): ts.PropertyDeclaration {
    return ts.createProperty(
        undefined,
        [
            ts.createToken(ts.SyntaxKind.PublicKeyword),
            ts.createToken(ts.SyntaxKind.ReadonlyKeyword),
        ],
        COMMON_IDENTIFIERS._fieldAnnotations,
        undefined,
        ts.createTypeReferenceNode(
            THRIFT_IDENTIFIERS.IFieldAnnotations,
            undefined,
        ),
        renderFieldAnnotationValue(fields),
    )
}

function renderMethodAnnotationValue(
    functions: Array<FunctionDefinition>,
): ts.ObjectLiteralExpression {
    return ts.createObjectLiteral(
        functions.map((func: FunctionDefinition) => {
            return ts.createPropertyAssignment(
                ts.createIdentifier(func.name.value),
                ts.createObjectLiteral(
                    [
                        ts.createPropertyAssignment(
                            ts.createIdentifier('annotations'),
                            renderAnnotationValue(func.annotations),
                        ),
                        ts.createPropertyAssignment(
                            ts.createIdentifier('fieldAnnotations'),
                            renderFieldAnnotationValue(func.fields),
                        ),
                    ],
                    true,
                ),
            )
        }),
        true,
    )
}

export function renderMethodAnnotations(
    functions: Array<FunctionDefinition>,
): ts.VariableStatement {
    return ts.createVariableStatement(
        [ts.createToken(ts.SyntaxKind.ExportKeyword)],
        ts.createVariableDeclarationList(
            [
                ts.createVariableDeclaration(
                    COMMON_IDENTIFIERS.methodAnnotations,
                    ts.createTypeReferenceNode(
                        THRIFT_IDENTIFIERS.IMethodAnnotations,
                        undefined,
                    ),
                    renderMethodAnnotationValue(functions),
                ),
            ],
            ts.NodeFlags.Const,
        ),
    )
}

export function renderMethodAnnotationsProperty(): ts.PropertyDeclaration {
    return ts.createProperty(
        undefined,
        [
            ts.createToken(ts.SyntaxKind.PublicKeyword),
            ts.createToken(ts.SyntaxKind.ReadonlyKeyword),
        ],
        COMMON_IDENTIFIERS._methodAnnotations,
        undefined,
        ts.createTypeReferenceNode(
            THRIFT_IDENTIFIERS.IMethodAnnotations,
            undefined,
        ),
        COMMON_IDENTIFIERS.methodAnnotations,
    )
}

export function renderMethodAnnotationsStaticProperty(): ts.PropertyDeclaration {
    return ts.createProperty(
        undefined,
        [
            ts.createToken(ts.SyntaxKind.PublicKeyword),
            ts.createToken(ts.SyntaxKind.StaticKeyword),
            ts.createToken(ts.SyntaxKind.ReadonlyKeyword),
        ],
        COMMON_IDENTIFIERS.methodAnnotations,
        undefined,
        ts.createTypeReferenceNode(
            THRIFT_IDENTIFIERS.IMethodAnnotations,
            undefined,
        ),
        COMMON_IDENTIFIERS.methodAnnotations,
    )
}
