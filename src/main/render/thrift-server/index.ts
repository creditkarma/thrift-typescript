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

import { fileUsesThrift } from '../shared/includes'
import renderAsNamespace from '../shared/namespace'
import renderReExport from '../shared/reexport'
import { renderConst as _renderConst } from './const'
import { renderEnum as _renderEnum } from './enum'
import {
    renderIncludes as _renderIncludes,
    renderThriftImports,
} from './includes'
import { renderService as _renderService } from './service'
import { renderStruct as _renderStruct } from './struct'
import { renderTypeDef as _renderTypeDef } from './typedef'
import { renderStrictUnion, renderUnion as _renderUnion } from './union'

import { IMakeOptions, IRenderer } from '../../types'

import ResolverFile from '../../resolver/file'
import ResolverNamespace from '../../resolver/namespace'
import { typeNodeForFieldType } from './types'

export function renderIncludes(
    namespace: ResolverNamespace,
    files: Array<ResolverFile>,
    options: IMakeOptions,
    namespaceInclude?: string,
): Array<ts.Statement> {
    if (fileUsesThrift(namespace)) {
        return [
            renderThriftImports(options.library),
            ..._renderIncludes(namespace, files, namespaceInclude),
        ]
    } else {
        return _renderIncludes(namespace, files, namespaceInclude)
    }
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
    return _renderStruct(statement, file)
}

export function renderException(
    statement: ExceptionDefinition,
    file: ResolverFile,
): Array<ts.Statement> {
    return _renderException(statement, file)
}

export function renderUnion(
    statement: UnionDefinition,
    file: ResolverFile,
): Array<ts.Statement> {
    if (file.schema.options.strictUnions) {
        return renderStrictUnion(statement, file)
    } else {
        return _renderUnion(statement, file)
    }
}

export function renderService(
    statement: ServiceDefinition,
    file: ResolverFile,
): Array<ts.Statement> {
    return _renderService(statement, file)
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
