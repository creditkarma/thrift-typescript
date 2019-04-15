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

import { DefinitionType, IRenderState, IResolvedIdentifier } from '../../types'

import { className, looseName, strictName, toolkitName } from './struct/utils'

import {
    fieldInterfaceName,
    renderUnionTypeName,
    unionTypeName,
} from './union/union-fields'

import {
    resolveIdentifierDefinition,
    resolveIdentifierName,
} from '../../resolver'

function renderStrictInterfaceReexport(
    id: IResolvedIdentifier,
    definition: DefinitionType,
    node: TypedefDefinition,
    state: IRenderState,
): ts.Statement {
    if (id.pathName !== undefined) {
        return ts.createImportEqualsDeclaration(
            undefined,
            [ts.createToken(ts.SyntaxKind.ExportKeyword)],
            ts.createIdentifier(
                strictName(node.name.value, definition.type, state),
            ),
            ts.createIdentifier(
                `${strictName(id.rawName, definition.type, state)}`,
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
        return ts.createImportEqualsDeclaration(
            undefined,
            [ts.createToken(ts.SyntaxKind.ExportKeyword)],
            ts.createIdentifier(
                looseName(node.name.value, definition.type, state),
            ),
            ts.createIdentifier(
                `${looseName(id.rawName, definition.type, state)}`,
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
        return ts.createImportEqualsDeclaration(
            undefined,
            [ts.createToken(ts.SyntaxKind.ExportKeyword)],
            ts.createIdentifier(className(node.name.value, state)),
            ts.createIdentifier(`${className(id.rawName, state)}`),
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
        return ts.createImportEqualsDeclaration(
            undefined,
            [ts.createToken(ts.SyntaxKind.ExportKeyword)],
            ts.createIdentifier(toolkitName(node.name.value, state)),
            ts.createIdentifier(`${toolkitName(id.rawName, state)}`),
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
        return ts.createImportEqualsDeclaration(
            undefined,
            [ts.createToken(ts.SyntaxKind.ExportKeyword)],
            ts.createIdentifier(renderUnionTypeName(node.name.value, state)),
            ts.createIdentifier(`${renderUnionTypeName(id.rawName, state)}`),
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
            return ts.createImportEqualsDeclaration(
                undefined,
                [ts.createToken(ts.SyntaxKind.ExportKeyword)],
                ts.createIdentifier(
                    fieldInterfaceName(
                        node.name.value,
                        next.name.value,
                        strict,
                    ),
                ),
                ts.createIdentifier(
                    `${id.pathName}.${fieldInterfaceName(
                        union.name.value,
                        next.name.value,
                        strict,
                    )}`,
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
        return ts.createImportEqualsDeclaration(
            undefined,
            [ts.createToken(ts.SyntaxKind.ExportKeyword)],
            ts.createIdentifier(unionTypeName(node.name.value, state, false)),
            ts.createIdentifier(`${unionTypeName(id.rawName, state, false)}`),
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
                    renderClassReexport(resolvedIdentifier, node, state),
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
        case SyntaxType.EnumDefinition:
            return [
                ts.createImportEqualsDeclaration(
                    undefined,
                    [ts.createToken(ts.SyntaxKind.ExportKeyword)],
                    ts.createIdentifier(node.name.value),
                    ts.createIdentifier(resolvedIdentifier.fullName),
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
            const resolvedIdentifier = resolveIdentifierName(
                node.definitionType.value,
                state,
            )

            return renderTypeDefForIdentifier(
                resolvedIdentifier,
                resolveIdentifierDefinition(
                    node.definitionType,
                    state.currentNamespace,
                    state.project.namespaces,
                    state.project.sourceDir,
                ),
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
