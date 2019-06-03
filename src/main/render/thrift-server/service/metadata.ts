import * as ts from 'typescript'

import {
    Annotation,
    Annotations,
    FieldDefinition,
    FunctionDefinition,
    FunctionType,
    InterfaceWithFields,
    ServiceDefinition,
    SyntaxType,
} from '@creditkarma/thrift-parser'

import { DefinitionType, INamespace, IRenderState } from '../../../types'

import { Resolver } from '../../../resolver'
import { COMMON_IDENTIFIERS, THRIFT_IDENTIFIERS } from '../identifiers'

const VALID_IDENTIFIER_PATTERN = /^[a-z$_][0-9a-z$_]*$/i

function renderMetadataForBaseType(): ts.ObjectLiteralExpression {
    return ts.createObjectLiteral(
        [
            ts.createPropertyAssignment(
                COMMON_IDENTIFIERS.type,
                THRIFT_IDENTIFIERS.DefinitionMetadata_BaseType,
            ),
        ],
        true,
    )
}

function renderMetadataForStructType(
    struct: InterfaceWithFields,
    state: IRenderState,
): ts.ObjectLiteralExpression {
    return ts.createObjectLiteral(
        [
            ts.createPropertyAssignment(
                COMMON_IDENTIFIERS.type,
                THRIFT_IDENTIFIERS.DefinitionMetadata_StructType,
            ),
            ts.createPropertyAssignment(
                COMMON_IDENTIFIERS.name,
                ts.createLiteral(struct.name.value),
            ),
            ts.createPropertyAssignment(
                COMMON_IDENTIFIERS.annotations,
                renderAnnotationValue(struct.annotations),
            ),
            ts.createPropertyAssignment(
                COMMON_IDENTIFIERS.fields,
                renderMetadataForFields(struct.fields, state),
            ),
        ],
        true,
    )
}

function renderMetadataForFieldType(
    fieldType: FunctionType,
    state: IRenderState,
    currentNamespace: INamespace = state.currentNamespace,
): ts.ObjectLiteralExpression {
    switch (fieldType.type) {
        case SyntaxType.Identifier:
            const definition: DefinitionType = Resolver.resolveIdentifierDefinition(
                fieldType,
                {
                    currentNamespace: state.currentNamespace,
                    currentDefinitions: state.currentDefinitions,
                    namespaceMap: state.project.namespaces,
                },
            )

            if (
                definition.type === SyntaxType.StructDefinition ||
                definition.type === SyntaxType.UnionDefinition ||
                definition.type === SyntaxType.ExceptionDefinition
            ) {
                return renderMetadataForStructType(definition, state)
            } else if (definition.type === SyntaxType.TypedefDefinition) {
                return renderMetadataForFieldType(
                    definition.definitionType,
                    state,
                )
            } else {
                return renderMetadataForBaseType()
            }

        default:
            return renderMetadataForBaseType()
    }
}

/**
 *
 * interface IFieldMetadata {
 *   readonly name: string
 *   readonly fieldId: number
 *   readonly annotations: IThriftAnnotations
 *   readonly definition: DefinitionMetadata
 * }
 */
function renderMetadataForField(
    field: FieldDefinition,
    state: IRenderState,
): ts.ObjectLiteralExpression {
    return ts.createObjectLiteral(
        [
            ts.createPropertyAssignment(
                COMMON_IDENTIFIERS.name,
                ts.createLiteral(field.name.value),
            ),
            ts.createPropertyAssignment(
                COMMON_IDENTIFIERS.fieldId,
                ts.createLiteral(field.fieldID!.value),
            ),
            ts.createPropertyAssignment(
                COMMON_IDENTIFIERS.annotations,
                renderAnnotationValue(field.annotations),
            ),
            ts.createPropertyAssignment(
                COMMON_IDENTIFIERS.definitionType,
                renderMetadataForFieldType(field.fieldType, state),
            ),
        ],
        true,
    )
}

function renderMetadataForFields(
    fields: Array<FieldDefinition>,
    state: IRenderState,
): ts.ObjectLiteralExpression {
    return ts.createObjectLiteral(
        fields.map((next: FieldDefinition) => {
            return ts.createPropertyAssignment(
                ts.createIdentifier(next.name.value),
                renderMetadataForField(next, state),
            )
        }),
        true,
    )
}

function renderServiceMetadataType(): ts.TypeNode {
    return ts.createTypeReferenceNode(
        THRIFT_IDENTIFIERS.IServiceMetadata,
        undefined,
    )
}

export function renderServiceMetadata(
    service: ServiceDefinition,
    state: IRenderState,
): ts.VariableStatement {
    return ts.createVariableStatement(
        [ts.createToken(ts.SyntaxKind.ExportKeyword)],
        ts.createVariableDeclarationList(
            [
                ts.createVariableDeclaration(
                    COMMON_IDENTIFIERS.metadata,
                    renderServiceMetadataType(),
                    renderServiceMetadataValue(service, state),
                ),
            ],
            ts.NodeFlags.Const,
        ),
    )
}

function renderMetadataForMethodValue(
    funcDef: FunctionDefinition,
    state: IRenderState,
): ts.ObjectLiteralExpression {
    return ts.createObjectLiteral(
        [
            ts.createPropertyAssignment(
                COMMON_IDENTIFIERS.name,
                ts.createLiteral(funcDef.name.value),
            ),
            ts.createPropertyAssignment(
                COMMON_IDENTIFIERS.annotations,
                renderAnnotationValue(funcDef.annotations),
            ),
            ts.createPropertyAssignment(
                COMMON_IDENTIFIERS.arguments,
                ts.createArrayLiteral(
                    funcDef.fields.map((next: FieldDefinition) => {
                        return renderMetadataForField(next, state)
                    }),
                    true,
                ),
            ),
        ],
        true,
    )
}

function renderMethodMetadataProperties(
    service: ServiceDefinition,
    state: IRenderState,
): Array<ts.ObjectLiteralElementLike> {
    if (service.extends === null) {
        return service.functions.map((next: FunctionDefinition) => {
            return ts.createPropertyAssignment(
                ts.createIdentifier(next.name.value),
                renderMetadataForMethodValue(next, state),
            )
        })
    } else {
        const parentService: DefinitionType = Resolver.resolveIdentifierDefinition(
            service.extends,
            {
                currentNamespace: state.currentNamespace,
                currentDefinitions: state.currentDefinitions,
                namespaceMap: state.project.namespaces,
            },
        )

        switch (parentService.type) {
            case SyntaxType.ServiceDefinition:
                return [
                    ...renderMethodMetadataProperties(parentService, state),
                    ...service.functions.map((next: FunctionDefinition) => {
                        return ts.createPropertyAssignment(
                            ts.createIdentifier(next.name.value),
                            renderMetadataForMethodValue(next, state),
                        )
                    }),
                ]

            default:
                throw new TypeError(
                    `A service can only extend another service. Found: ${
                        parentService.type
                    }`,
                )
        }
    }
}

function renderMethodMetadataValue(
    service: ServiceDefinition,
    state: IRenderState,
): ts.ObjectLiteralExpression {
    return ts.createObjectLiteral(
        renderMethodMetadataProperties(service, state),
        true,
    )
}

function renderServiceMetadataValue(
    service: ServiceDefinition,
    state: IRenderState,
): ts.ObjectLiteralExpression {
    return ts.createObjectLiteral(
        [
            ts.createPropertyAssignment(
                COMMON_IDENTIFIERS.name,
                ts.createLiteral(service.name.value),
            ),
            ts.createPropertyAssignment(
                COMMON_IDENTIFIERS.annotations,
                renderAnnotationValue(service.annotations),
            ),
            ts.createPropertyAssignment(
                COMMON_IDENTIFIERS.methods,
                renderMethodMetadataValue(service, state),
            ),
        ],
        true,
    )
}

export function renderServiceMetadataProperty(): ts.PropertyDeclaration {
    return ts.createProperty(
        undefined,
        [
            ts.createToken(ts.SyntaxKind.PublicKeyword),
            ts.createToken(ts.SyntaxKind.ReadonlyKeyword),
        ],
        COMMON_IDENTIFIERS.__metadata,
        undefined,
        renderServiceMetadataType(),
        COMMON_IDENTIFIERS.metadata,
    )
}

export function renderServiceMetadataStaticProperty(): ts.PropertyDeclaration {
    return ts.createProperty(
        undefined,
        [
            ts.createToken(ts.SyntaxKind.PublicKeyword),
            ts.createToken(ts.SyntaxKind.StaticKeyword),
            ts.createToken(ts.SyntaxKind.ReadonlyKeyword),
        ],
        COMMON_IDENTIFIERS.metadata,
        undefined,
        renderServiceMetadataType(),
        COMMON_IDENTIFIERS.metadata,
    )
}

function renderAnnotationValue(
    annotations?: Annotations,
): ts.ObjectLiteralExpression {
    return ts.createObjectLiteral(
        annotations !== undefined
            ? annotations.annotations.map((annotation: Annotation) => {
                  const name = annotation.name.value
                  const identifier = VALID_IDENTIFIER_PATTERN.test(name)
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
