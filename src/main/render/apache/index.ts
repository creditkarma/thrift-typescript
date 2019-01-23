import * as ts from 'typescript'

import {
    ConstDefinition,
    EnumDefinition,
    ExceptionDefinition,
    ServiceDefinition,
    StructDefinition,
    TypedefDefinition,
    UnionDefinition,
} from '@creditkarma/thrift-parser'

import { renderException as _renderException } from './exception'

import { renderInterface } from './interface'

import {
    renderArgsStruct,
    renderClient,
    renderHandlerInterface,
    renderProcessor,
    renderResultStruct,
} from './service'

import { fileUsesInt64, fileUsesThrift } from '../shared/includes'
import { renderTypeDef as _renderTypeDef } from '../shared/typedef'
import { renderConst as _renderConst } from './const'
import { renderEnum as _renderEnum } from './enum'
import {
    renderIncludes as _renderIncludes,
    renderInt64Import,
    renderThriftImports,
} from './includes'
import { renderStruct as _renderStruct } from './struct'
import { renderUnion as _renderUnion } from './union'

import {
    IIdentifierMap,
    IMakeOptions,
    INamespaceFile,
    IRenderer,
} from '../../types'
import { typeNodeForFieldType } from './types'

export function renderIncludes(
    outPath: string,
    currentPath: string,
    resolvedFile: INamespaceFile,
    options: IMakeOptions,
): Array<ts.Statement> {
    const includes: Array<ts.Statement> = [
        ..._renderIncludes(outPath, currentPath, resolvedFile.includes),
    ]

    if (fileUsesThrift(resolvedFile)) {
        includes.unshift(renderThriftImports(options.library))
    }

    if (fileUsesInt64(resolvedFile)) {
        includes.unshift(renderInt64Import())
    }

    return includes
}

export function renderConst(
    statement: ConstDefinition,
    identifiers: IIdentifierMap,
): Array<ts.Statement> {
    return [_renderConst(statement, typeNodeForFieldType)]
}

export function renderTypeDef(
    statement: TypedefDefinition,
    identifiers: IIdentifierMap,
): Array<ts.Statement> {
    return _renderTypeDef(statement, typeNodeForFieldType, identifiers)
}

export function renderEnum(
    statement: EnumDefinition,
    identifiers: IIdentifierMap,
): Array<ts.Statement> {
    return [_renderEnum(statement)]
}

export function renderStruct(
    statement: StructDefinition,
    identifiers: IIdentifierMap,
): Array<ts.Statement> {
    return [renderInterface(statement), _renderStruct(statement, identifiers)]
}

export function renderException(
    statement: ExceptionDefinition,
    identifiers: IIdentifierMap,
): Array<ts.Statement> {
    return [
        renderInterface(statement),
        _renderException(statement, identifiers),
    ]
}

export function renderUnion(
    statement: UnionDefinition,
    identifiers: IIdentifierMap,
): Array<ts.Statement> {
    return [renderInterface(statement), _renderUnion(statement, identifiers)]
}

export function renderService(
    statement: ServiceDefinition,
    identifiers: IIdentifierMap,
): Array<ts.Statement> {
    return [
        ts.createModuleDeclaration(
            undefined,
            [ts.createToken(ts.SyntaxKind.ExportKeyword)],
            ts.createIdentifier(statement.name.value),
            ts.createModuleBlock([
                ...renderArgsStruct(statement, identifiers),
                ...renderResultStruct(statement, identifiers),
                renderClient(statement),
                ...renderHandlerInterface(statement),
                renderProcessor(statement, identifiers),
            ]),
            ts.NodeFlags.Namespace,
        ),
    ]
}

export const renderer: IRenderer = {
    renderIncludes,
    renderConst,
    renderTypeDef,
    renderEnum,
    renderStruct,
    renderException,
    renderUnion,
    renderService,
}
