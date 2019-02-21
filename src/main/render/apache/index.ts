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
    IMakeOptions,
    INamespaceFile,
    IRenderer,
    IRenderState,
} from '../../types'
import { typeNodeForFieldType } from './types'

export function renderIncludes(
    currentPath: string,
    resolvedFile: INamespaceFile,
    options: IMakeOptions,
): Array<ts.Statement> {
    const includes: Array<ts.Statement> = [
        ..._renderIncludes(currentPath, resolvedFile.includes),
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
    state: IRenderState,
): Array<ts.Statement> {
    return [_renderConst(statement, typeNodeForFieldType)]
}

export function renderTypeDef(
    statement: TypedefDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    return _renderTypeDef(statement, typeNodeForFieldType, state.identifiers)
}

export function renderEnum(
    statement: EnumDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    return [_renderEnum(statement)]
}

export function renderStruct(
    statement: StructDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    return [
        renderInterface(statement),
        _renderStruct(statement, state.identifiers),
    ]
}

export function renderException(
    statement: ExceptionDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    return [
        renderInterface(statement),
        _renderException(statement, state.identifiers),
    ]
}

export function renderUnion(
    statement: UnionDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    return [
        renderInterface(statement),
        _renderUnion(statement, state.identifiers),
    ]
}

export function renderService(
    statement: ServiceDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    return [
        ts.createModuleDeclaration(
            undefined,
            [ts.createToken(ts.SyntaxKind.ExportKeyword)],
            ts.createIdentifier(statement.name.value),
            ts.createModuleBlock([
                ...renderArgsStruct(statement, state.identifiers),
                ...renderResultStruct(statement, state.identifiers),
                renderClient(statement),
                ...renderHandlerInterface(statement),
                renderProcessor(statement, state.identifiers),
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
