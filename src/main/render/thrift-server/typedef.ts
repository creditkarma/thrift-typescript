import * as ts from 'typescript'

import {
    FieldDefinition,
    SyntaxType,
    TypedefDefinition,
    UnionDefinition,
} from '@creditkarma/thrift-parser'

import { TypeMapping } from './types'

import { IRenderState, IResolvedIdentifier } from '../../types'

import { className, looseName, strictName, toolkitName } from './struct/utils'
import {
    fieldInterfaceName,
    renderUnionTypeName,
    unionTypeName,
} from './union/union-fields'

function renderStrictInterfaceReexport(
    id: IResolvedIdentifier,
    node: TypedefDefinition,
    state: IRenderState,
): ts.ImportEqualsDeclaration {
    return ts.createImportEqualsDeclaration(
        undefined,
        [ts.createToken(ts.SyntaxKind.ExportKeyword)],
        ts.createIdentifier(
            strictName(node.name.value, id.definition.type, state),
        ),
        ts.createIdentifier(
            `${id.pathName}.${strictName(id.name, id.definition.type, state)}`,
        ),
    )
}

function renderLooseInterfaceReexport(
    id: IResolvedIdentifier,
    node: TypedefDefinition,
    state: IRenderState,
): ts.ImportEqualsDeclaration {
    return ts.createImportEqualsDeclaration(
        undefined,
        [ts.createToken(ts.SyntaxKind.ExportKeyword)],
        ts.createIdentifier(
            looseName(node.name.value, id.definition.type, state),
        ),
        ts.createIdentifier(
            `${id.pathName}.${looseName(id.name, id.definition.type, state)}`,
        ),
    )
}

function renderClassReexport(
    id: IResolvedIdentifier,
    node: TypedefDefinition,
): ts.ImportEqualsDeclaration {
    return ts.createImportEqualsDeclaration(
        undefined,
        [ts.createToken(ts.SyntaxKind.ExportKeyword)],
        ts.createIdentifier(className(node.name.value)),
        ts.createIdentifier(`${id.pathName}.${className(id.name)}`),
    )
}

function renderToolkitReexport(
    id: IResolvedIdentifier,
    node: TypedefDefinition,
): ts.ImportEqualsDeclaration {
    return ts.createImportEqualsDeclaration(
        undefined,
        [ts.createToken(ts.SyntaxKind.ExportKeyword)],
        ts.createIdentifier(toolkitName(node.name.value)),
        ts.createIdentifier(toolkitName(id.resolvedName)),
    )
}

function renderUnionTypeReexport(
    id: IResolvedIdentifier,
    node: TypedefDefinition,
    state: IRenderState,
): ts.ImportEqualsDeclaration {
    return ts.createImportEqualsDeclaration(
        undefined,
        [ts.createToken(ts.SyntaxKind.ExportKeyword)],
        ts.createIdentifier(renderUnionTypeName(node.name.value, true)),
        ts.createIdentifier(
            `${id.pathName}.${renderUnionTypeName(id.name, true)}`,
        ),
    )
}

function renderUnionInterfaceReexports(
    id: IResolvedIdentifier,
    union: UnionDefinition,
    node: TypedefDefinition,
    state: IRenderState,
    strict: boolean,
): Array<ts.ImportEqualsDeclaration> {
    return union.fields.map((next: FieldDefinition) => {
        return ts.createImportEqualsDeclaration(
            undefined,
            [ts.createToken(ts.SyntaxKind.ExportKeyword)],
            ts.createIdentifier(
                fieldInterfaceName(node.name.value, next.name.value, strict),
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
}

function renderUnionArgsReexport(
    id: IResolvedIdentifier,
    node: TypedefDefinition,
): ts.ImportEqualsDeclaration {
    return ts.createImportEqualsDeclaration(
        undefined,
        [ts.createToken(ts.SyntaxKind.ExportKeyword)],
        ts.createIdentifier(unionTypeName(node.name.value, false)),
        ts.createIdentifier(`${id.pathName}.${unionTypeName(id.name, false)}`),
    )
}

function renderTypeDefForIdentifier(
    id: IResolvedIdentifier,
    node: TypedefDefinition,
    typeMapping: TypeMapping,
    state: IRenderState,
): Array<ts.Statement> {
    switch (id.definition.type) {
        case SyntaxType.UnionDefinition:
            if (state.options.strictUnions) {
                return [
                    renderUnionTypeReexport(id, node, state),
                    renderClassReexport(id, node),
                    ...renderUnionInterfaceReexports(
                        id,
                        id.definition,
                        node,
                        state,
                        true,
                    ),
                    renderUnionArgsReexport(id, node),
                    ...renderUnionInterfaceReexports(
                        id,
                        id.definition,
                        node,
                        state,
                        false,
                    ),
                    renderToolkitReexport(id, node),
                ]
            } else {
                // Fallthrough to reexport union as struct
            }
        case SyntaxType.ExceptionDefinition:
        case SyntaxType.StructDefinition:
            return [
                renderStrictInterfaceReexport(id, node, state),
                renderLooseInterfaceReexport(id, node, state),
                renderClassReexport(id, node),
                renderToolkitReexport(id, node),
            ]

        default:
            return [
                ts.createImportEqualsDeclaration(
                    undefined,
                    [ts.createToken(ts.SyntaxKind.ExportKeyword)],
                    ts.createIdentifier(node.name.value),
                    ts.createIdentifier(id.resolvedName),
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
            return renderTypeDefForIdentifier(
                state.identifiers[node.definitionType.value],
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
                    typeMapping(node.definitionType),
                ),
            ]
    }
}
