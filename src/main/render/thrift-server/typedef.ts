import * as ts from 'typescript'

import {
    FieldDefinition,
    SyntaxType,
    TypedefDefinition,
    UnionDefinition,
} from '@creditkarma/thrift-parser'

import { TypeMapping } from './types'

import { IResolvedIdentifier } from '../../types'

import ResolverFile from '../../resolver/file'
import { className, looseName, strictName, toolkitName } from './struct/utils'
import {
    fieldInterfaceName,
    renderUnionTypeName,
    unionTypeName,
} from './union/union-fields'

function renderStrictInterfaceReexport(
    id: IResolvedIdentifier,
    node: TypedefDefinition,
    file: ResolverFile,
): ts.ImportEqualsDeclaration {
    return ts.createImportEqualsDeclaration(
        undefined,
        [ts.createToken(ts.SyntaxKind.ExportKeyword)],
        ts.createIdentifier(
            strictName(node.name.value, id.definition.type, file),
        ),
        ts.createIdentifier(
            `${id.pathName}.${strictName(id.name, id.definition.type, file)}`,
        ),
    )
}

function renderLooseInterfaceReexport(
    id: IResolvedIdentifier,
    node: TypedefDefinition,
    file: ResolverFile,
): ts.ImportEqualsDeclaration {
    return ts.createImportEqualsDeclaration(
        undefined,
        [ts.createToken(ts.SyntaxKind.ExportKeyword)],
        ts.createIdentifier(
            looseName(node.name.value, id.definition.type, file),
        ),
        ts.createIdentifier(
            `${id.pathName}.${looseName(id.name, id.definition.type, file)}`,
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
    file: ResolverFile,
): ts.ImportEqualsDeclaration {
    return ts.createImportEqualsDeclaration(
        undefined,
        [ts.createToken(ts.SyntaxKind.ExportKeyword)],
        ts.createIdentifier(renderUnionTypeName(node.name.value, file)),
        ts.createIdentifier(
            `${id.pathName}.${renderUnionTypeName(id.name, file)}`,
        ),
    )
}

function renderUnionInterfaceReexports(
    id: IResolvedIdentifier,
    union: UnionDefinition,
    node: TypedefDefinition,
    file: ResolverFile,
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
    file: ResolverFile,
): Array<ts.Statement> {
    switch (id.definition.type) {
        case SyntaxType.UnionDefinition:
            if (file.schema.options.strictUnions) {
                return [
                    renderUnionTypeReexport(id, node, file),
                    renderClassReexport(id, node),
                    ...renderUnionInterfaceReexports(
                        id,
                        id.definition,
                        node,
                        file,
                        true,
                    ),
                    renderUnionArgsReexport(id, node),
                    ...renderUnionInterfaceReexports(
                        id,
                        id.definition,
                        node,
                        file,
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
                renderStrictInterfaceReexport(id, node, file),
                renderLooseInterfaceReexport(id, node, file),
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
    file: ResolverFile,
): Array<ts.Statement> {
    switch (node.definitionType.type) {
        case SyntaxType.Identifier:
            return renderTypeDefForIdentifier(
                file.resolveIdentifier(node.definitionType.value),
                node,
                file,
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
