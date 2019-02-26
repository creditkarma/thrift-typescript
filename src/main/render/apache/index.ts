import * as ts from 'typescript'

import {
    ConstDefinition,
    EnumDefinition,
    ExceptionDefinition,
    FunctionType,
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
import renderAsNamespace from '../shared/namespace'
import renderReExport from '../shared/reexport'
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

import ResolverFile from '../../resolver/file'
import ResolverNamespace from '../../resolver/namespace'
import { IMakeOptions, IRenderer } from '../../types'
import { typeNodeForFieldType } from './types'

export function renderIncludes(
    namespace: ResolverNamespace,
    files: Array<ResolverFile>,
    options: IMakeOptions,
    namespaceInclude?: string,
): Array<ts.Statement> {
    const includes: Array<ts.Statement> = [
        ..._renderIncludes(namespace, files, namespaceInclude),
    ]

    if (fileUsesThrift(namespace)) {
        includes.unshift(renderThriftImports(options.library))
    }

    if (fileUsesInt64(namespace)) {
        includes.unshift(renderInt64Import())
    }

    return includes
}

export function renderConst(
    statement: ConstDefinition,
    file: ResolverFile,
): Array<ts.Statement> {
    return [
        _renderConst(
            statement,
            (fieldType: FunctionType, loose?: boolean): ts.TypeNode => {
                return typeNodeForFieldType(fieldType, file, loose)
            },
            file,
        ),
    ]
}

export function renderTypeDef(
    statement: TypedefDefinition,
    file: ResolverFile,
): Array<ts.Statement> {
    return _renderTypeDef(
        statement,
        (fieldType: FunctionType, loose?: boolean): ts.TypeNode => {
            return typeNodeForFieldType(fieldType, file, loose)
        },
        file,
    )
}

export function renderEnum(
    statement: EnumDefinition,
    file: ResolverFile,
): Array<ts.Statement> {
    return [_renderEnum(statement)]
}

export function renderStruct(
    statement: StructDefinition,
    file: ResolverFile,
): Array<ts.Statement> {
    return [renderInterface(statement, file), _renderStruct(statement, file)]
}

export function renderException(
    statement: ExceptionDefinition,
    file: ResolverFile,
): Array<ts.Statement> {
    return [renderInterface(statement, file), _renderException(statement, file)]
}

export function renderUnion(
    statement: UnionDefinition,
    file: ResolverFile,
): Array<ts.Statement> {
    return [renderInterface(statement, file), _renderUnion(statement, file)]
}

export function renderService(
    statement: ServiceDefinition,
    file: ResolverFile,
): Array<ts.Statement> {
    return [
        ...renderArgsStruct(statement, file),
        ...renderResultStruct(statement, file),
        renderClient(statement, file),
        ...renderHandlerInterface(statement, file),
        renderProcessor(statement, file),
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
    renderAsNamespace,
    renderReExport,
}
