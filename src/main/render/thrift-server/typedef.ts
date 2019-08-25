import * as ts from 'typescript'

import {
    ExceptionDefinition,
    FieldDefinition,
    StructDefinition,
    SyntaxType,
    TypedefDefinition,
    UnionDefinition,
} from '@creditkarma/thrift-parser'

import { TypeMapping } from './types'

import {
    DefinitionType,
    IRenderState,
    IResolvedIdentifier,
    IResolveResult,
} from '../../types'

import {
    className,
    looseName,
    strictName,
    tokens,
    toolkitName,
} from './struct/utils'

import {
    fieldInterfaceName,
    renderUnionTypeName,
    unionTypeName,
} from './union/union-fields'

import { Resolver } from '../../resolver'
import { createConst } from '../shared/utils'

function renderStrictInterfaceReexport(
    id: IResolvedIdentifier,
    definition: DefinitionType,
    node: TypedefDefinition,
    state: IRenderState,
): ts.Statement {
    if (id.pathName !== undefined) {
        return ts.createTypeAliasDeclaration(
            undefined,
            tokens(true),
            strictName(node.name.value, definition.type, state),
            undefined,
            ts.createTypeReferenceNode(
                strictName(id.rawName, definition.type, state),
                undefined,
            ),
        )
    } else {
        return ts.createExportDeclaration(
            [],
            [],
            ts.createNamedExports([
                ts.createExportSpecifier(
                    ts.createIdentifier(
                        `${strictName(id.rawName, definition.type, state)}`,
                    ),
                    ts.createIdentifier(
                        strictName(node.name.value, definition.type, state),
                    ),
                ),
            ]),
            undefined,
        )
    }
}

function renderLooseInterfaceReexport(
    id: IResolvedIdentifier,
    definition: DefinitionType,
    node: TypedefDefinition,
    state: IRenderState,
): ts.Statement {
    if (id.pathName !== undefined) {
        return ts.createTypeAliasDeclaration(
            undefined,
            tokens(true),
            looseName(node.name.value, definition.type, state),
            undefined,
            ts.createTypeReferenceNode(
                looseName(id.rawName, definition.type, state),
                undefined,
            ),
        )
    } else {
        return ts.createExportDeclaration(
            [],
            [],
            ts.createNamedExports([
                ts.createExportSpecifier(
                    ts.createIdentifier(
                        `${looseName(id.rawName, definition.type, state)}`,
                    ),
                    ts.createIdentifier(
                        looseName(node.name.value, definition.type, state),
                    ),
                ),
            ]),
            undefined,
        )
    }
}

function renderClassReexport(
    id: IResolvedIdentifier,
    node: TypedefDefinition,
    state: IRenderState,
): ts.Statement {
    if (id.pathName !== undefined) {
        return ts.createVariableStatement(
            tokens(true),
            createConst(
                className(node.name.value, state),
                undefined,
                ts.createIdentifier(className(id.rawName, state)),
            ),
        )
    } else {
        return ts.createExportDeclaration(
            [],
            [],
            ts.createNamedExports([
                ts.createExportSpecifier(
                    ts.createIdentifier(`${className(id.rawName, state)}`),
                    ts.createIdentifier(className(node.name.value, state)),
                ),
            ]),
            undefined,
        )
    }
}

function renderUnionReexport(
    id: IResolvedIdentifier,
    node: TypedefDefinition,
    state: IRenderState,
): ts.Statement {
    if (id.pathName !== undefined) {
        return ts.createTypeAliasDeclaration(
            undefined,
            tokens(true),
            className(node.name.value, state),
            undefined,
            ts.createTypeReferenceNode(className(id.rawName, state), undefined),
        )
    } else {
        return ts.createExportDeclaration(
            [],
            [],
            ts.createNamedExports([
                ts.createExportSpecifier(
                    ts.createIdentifier(`${className(id.rawName, state)}`),
                    ts.createIdentifier(className(node.name.value, state)),
                ),
            ]),
            undefined,
        )
    }
}

function renderToolkitReexport(
    id: IResolvedIdentifier,
    definition: StructDefinition | UnionDefinition | ExceptionDefinition,
    node: TypedefDefinition,
    state: IRenderState,
): ts.Statement {
    if (id.pathName !== undefined) {
        return ts.createVariableStatement(
            tokens(true),
            createConst(
                toolkitName(node.name.value, state),
                undefined,
                ts.createIdentifier(toolkitName(id.rawName, state)),
            ),
        )
    } else {
        return ts.createExportDeclaration(
            [],
            [],
            ts.createNamedExports([
                ts.createExportSpecifier(
                    ts.createIdentifier(`${toolkitName(id.rawName, state)}`),
                    ts.createIdentifier(toolkitName(node.name.value, state)),
                ),
            ]),
            undefined,
        )
    }
}

function renderUnionTypeReexport(
    id: IResolvedIdentifier,
    node: TypedefDefinition,
    state: IRenderState,
): ts.Statement {
    if (id.pathName !== undefined) {
        return ts.createTypeAliasDeclaration(
            undefined,
            tokens(true),
            renderUnionTypeName(node.name.value, state),
            undefined,
            ts.createTypeReferenceNode(
                renderUnionTypeName(id.rawName, state),
                undefined,
            ),
        )
    } else {
        return ts.createExportDeclaration(
            [],
            [],
            ts.createNamedExports([
                ts.createExportSpecifier(
                    ts.createIdentifier(
                        `${renderUnionTypeName(id.rawName, state)}`,
                    ),
                    ts.createIdentifier(
                        renderUnionTypeName(node.name.value, state),
                    ),
                ),
            ]),
            undefined,
        )
    }
}

function renderUnionInterfaceReexports(
    id: IResolvedIdentifier,
    union: UnionDefinition,
    node: TypedefDefinition,
    strict: boolean,
): Array<ts.Statement> {
    if (id.pathName !== undefined) {
        return union.fields.map((next: FieldDefinition) => {
            return ts.createTypeAliasDeclaration(
                undefined,
                tokens(true),
                fieldInterfaceName(node.name.value, next.name.value, strict),
                undefined,
                ts.createTypeReferenceNode(
                    `${id.pathName}.${fieldInterfaceName(
                        union.name.value,
                        next.name.value,
                        strict,
                    )}`,
                    undefined,
                ),
            )
        })
    } else {
        return union.fields.map((next: FieldDefinition) => {
            return ts.createExportDeclaration(
                [],
                [],
                ts.createNamedExports([
                    ts.createExportSpecifier(
                        ts.createIdentifier(
                            `${fieldInterfaceName(
                                union.name.value,
                                next.name.value,
                                strict,
                            )}`,
                        ),
                        ts.createIdentifier(
                            fieldInterfaceName(
                                node.name.value,
                                next.name.value,
                                strict,
                            ),
                        ),
                    ),
                ]),
            )
        })
    }
}

function renderUnionArgsReexport(
    id: IResolvedIdentifier,
    node: TypedefDefinition,
    state: IRenderState,
): ts.Statement {
    if (id.pathName !== undefined) {
        return ts.createTypeAliasDeclaration(
            undefined,
            tokens(true),
            unionTypeName(node.name.value, state, false),
            undefined,
            ts.createTypeReferenceNode(
                unionTypeName(id.rawName, state, false),
                undefined,
            ),
        )
    } else {
        return ts.createExportDeclaration(
            [],
            [],
            ts.createNamedExports([
                ts.createExportSpecifier(
                    ts.createIdentifier(
                        `${unionTypeName(id.rawName, state, false)}`,
                    ),
                    ts.createIdentifier(
                        unionTypeName(node.name.value, state, false),
                    ),
                ),
            ]),
            undefined,
        )
    }
}

function renderTypeDefForIdentifier(
    resolvedIdentifier: IResolvedIdentifier,
    definition: DefinitionType,
    node: TypedefDefinition,
    typeMapping: TypeMapping,
    state: IRenderState,
): Array<ts.Statement> {
    switch (definition.type) {
        case SyntaxType.UnionDefinition:
            if (state.options.strictUnions) {
                return [
                    renderUnionTypeReexport(resolvedIdentifier, node, state),
                    renderUnionReexport(resolvedIdentifier, node, state),
                    ...renderUnionInterfaceReexports(
                        resolvedIdentifier,
                        definition,
                        node,
                        true,
                    ),
                    renderUnionArgsReexport(resolvedIdentifier, node, state),
                    ...renderUnionInterfaceReexports(
                        resolvedIdentifier,
                        definition,
                        node,
                        false,
                    ),
                    renderToolkitReexport(
                        resolvedIdentifier,
                        definition,
                        node,
                        state,
                    ),
                ]
            } else {
                // Fallthrough to reexport union as struct
            }
        case SyntaxType.ExceptionDefinition:
        case SyntaxType.StructDefinition:
            return [
                renderStrictInterfaceReexport(
                    resolvedIdentifier,
                    definition,
                    node,
                    state,
                ),
                renderLooseInterfaceReexport(
                    resolvedIdentifier,
                    definition,
                    node,
                    state,
                ),
                renderClassReexport(resolvedIdentifier, node, state),
                renderToolkitReexport(
                    resolvedIdentifier,
                    definition,
                    node,
                    state,
                ),
            ]

        case SyntaxType.ConstDefinition:
            return [
                ts.createVariableStatement(
                    tokens(true),
                    createConst(
                        node.name.value,
                        undefined,
                        ts.createIdentifier(resolvedIdentifier.fullName),
                    ),
                ),
            ]
        case SyntaxType.EnumDefinition:
            return [
                ts.createVariableStatement(
                    tokens(true),
                    createConst(
                        node.name.value,
                        undefined,
                        ts.createIdentifier(resolvedIdentifier.fullName),
                    ),
                ),
                ts.createTypeAliasDeclaration(
                    undefined,
                    tokens(true),
                    node.name.value,
                    undefined,
                    ts.createTypeReferenceNode(
                        resolvedIdentifier.fullName,
                        undefined,
                    ),
                ),
            ]

        default:
            return [
                ts.createTypeAliasDeclaration(
                    undefined,
                    [ts.createToken(ts.SyntaxKind.ExportKeyword)],
                    node.name.value,
                    undefined,
                    typeMapping(node.definitionType, state),
                ),
            ]
    }
}

export function renderTypeDef(
    node: TypedefDefinition,
    typeMapping: TypeMapping,
    state: IRenderState,
): Array<ts.Statement> {
    switch (node.definitionType.type) {
        case SyntaxType.Identifier:
            const resolvedIdentifier = Resolver.resolveIdentifierName(
                node.definitionType.value,
                {
                    currentNamespace: state.currentNamespace,
                    currentDefinitions: state.currentDefinitions,
                    namespaceMap: state.project.namespaces,
                },
            )

            const result: IResolveResult = Resolver.resolveIdentifierDefinition(
                node.definitionType,
                {
                    currentNamespace: state.currentNamespace,
                    namespaceMap: state.project.namespaces,
                },
            )

            return renderTypeDefForIdentifier(
                resolvedIdentifier,
                result.definition,
                node,
                typeMapping,
                state,
            )

        default:
            return [
                ts.createTypeAliasDeclaration(
                    undefined,
                    [ts.createToken(ts.SyntaxKind.ExportKeyword)],
                    node.name.value,
                    undefined,
                    typeMapping(node.definitionType, state),
                ),
            ]
    }
}
