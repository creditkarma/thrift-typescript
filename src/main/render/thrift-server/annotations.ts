import {
    Annotation,
    Annotations,
    FieldDefinition,
    FunctionDefinition,
    ServiceDefinition,
} from '@creditkarma/thrift-parser'
import * as ts from 'typescript'

import {
    COMMON_IDENTIFIERS,
    // THRIFT_IDENTIFIERS,
} from './identifiers'
import { createStringType } from './types'

function renderAnnotationValue(annotations?: Annotations): ts.ObjectLiteralExpression {
    return ts.createObjectLiteral(
        (
            annotations !== undefined
                ? annotations.annotations.map((annotation: Annotation) => {
                    return ts.createPropertyAssignment(
                        ts.createIdentifier(annotation.name.value),
                        annotation.value !== undefined
                            ? ts.createLiteral(annotation.value.value)
                            : ts.createLiteral(''),
                    )
                })
                : []
        ),
        true,
    )
}

/**
 * export interface IThriftAnnotations {
 *     [name: string]: string
 * }
 */
function thriftAnnotationType(): ts.TypeNode {
    return ts.createTypeLiteralNode([
        ts.createIndexSignature(
            undefined,
            undefined,
            [
                ts.createParameter(
                    undefined,
                    undefined,
                    undefined,
                    'name',
                    undefined,
                    createStringType(),
                ),
            ],
            createStringType(),
        ),
    ])
}

export function renderAnnotations(annotations?: Annotations): ts.PropertyDeclaration {
    return ts.createProperty(
        undefined,
        [
            ts.createToken(ts.SyntaxKind.PublicKeyword),
            ts.createToken(ts.SyntaxKind.ReadonlyKeyword),
        ],
        COMMON_IDENTIFIERS.annotations,
        undefined,
        thriftAnnotationType(),
        // ts.createTypeReferenceNode(THRIFT_IDENTIFIERS.IThriftAnnotations, undefined),
        renderAnnotationValue(annotations),
    )
}

function renderFieldAnnotationValue(fields: Array<FieldDefinition>): ts.ObjectLiteralExpression {
    return ts.createObjectLiteral(
        fields.filter((field: FieldDefinition) => {
            return field.annotations !== undefined
        }).map((field: FieldDefinition) => {
            return ts.createPropertyAssignment(
                ts.createIdentifier(field.name.value),
                renderAnnotationValue(field.annotations),
            )
        }),
        true,
    )
}

/**
 * export interface IFieldAnnotations {
 *     [fieldName: string]: IThriftAnnotations
 * }
 */
function fieldAnnotationType(): ts.TypeNode {
    return ts.createTypeLiteralNode([
        ts.createIndexSignature(
            undefined,
            undefined,
            [
                ts.createParameter(
                    undefined,
                    undefined,
                    undefined,
                    'fieldName',
                    undefined,
                    createStringType(),
                ),
            ],
            thriftAnnotationType(),
        ),
    ])
}

export function renderFieldAnnotations(fields: Array<FieldDefinition>): ts.PropertyDeclaration {
    return ts.createProperty(
        undefined,
        [
            ts.createToken(ts.SyntaxKind.PublicKeyword),
            ts.createToken(ts.SyntaxKind.ReadonlyKeyword),
        ],
        COMMON_IDENTIFIERS.fieldAnnotations,
        undefined,
        fieldAnnotationType(),
        // ts.createTypeReferenceNode(THRIFT_IDENTIFIERS.IFieldAnnotations, undefined),
        renderFieldAnnotationValue(fields),
    )
}

function renderMethodAnnotationValue(service: ServiceDefinition): ts.ObjectLiteralExpression {
    return ts.createObjectLiteral(
        service.functions.map((func: FunctionDefinition) => {
            return ts.createPropertyAssignment(
                ts.createIdentifier(func.name.value),
                ts.createObjectLiteral([
                    ts.createPropertyAssignment(
                        ts.createIdentifier('annotations'),
                        renderAnnotationValue(func.annotations),
                    ),
                    ts.createPropertyAssignment(
                        ts.createIdentifier('fieldAnnotations'),
                        renderFieldAnnotationValue(func.fields),
                    ),
                ], true),
                // renderAnnotationValue(func.annotations),
            )
        }),
        true,
    )
}

/**
 * export interface IMethodAnnotations {
 *     [methodName: string]: {
 *         annotations: IThriftAnnotations
 *         fieldAnnotations: IFieldAnnotations,
 *     }
 * }
 */
function methodAnnotationType(): ts.TypeNode {
    return ts.createTypeLiteralNode([
        ts.createIndexSignature(
            undefined,
            undefined,
            [
                ts.createParameter(
                    undefined,
                    undefined,
                    undefined,
                    'methodName',
                    undefined,
                    createStringType(),
                ),
            ],
            ts.createTypeLiteralNode([
                ts.createPropertySignature(
                    undefined,
                    'annotations',
                    undefined,
                    thriftAnnotationType(),
                    undefined,
                ),
                ts.createPropertySignature(
                    undefined,
                    'fieldAnnotations',
                    undefined,
                    fieldAnnotationType(),
                    undefined,
                ),
            ]),
        ),
    ])
}

export function renderMethodAnnotations(service: ServiceDefinition): ts.PropertyDeclaration {
    return ts.createProperty(
        undefined,
        [
            ts.createToken(ts.SyntaxKind.PublicKeyword),
            ts.createToken(ts.SyntaxKind.ReadonlyKeyword),
        ],
        COMMON_IDENTIFIERS.methodAnnotations,
        undefined,
        methodAnnotationType(),
        // ts.createTypeReferenceNode(THRIFT_IDENTIFIERS.IMethodAnnotations, undefined),
        renderMethodAnnotationValue(service),
    )
}
