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
import { renderConst as _renderConst } from './const'
import { renderEnum as _renderEnum } from './enum'
import {
    renderIncludes as _renderIncludes,
    renderThriftImports,
} from './includes'
import { renderService as _renderService } from './service'
import { renderStruct as _renderStruct } from './struct'
import { renderTypeDef as _renderTypeDef } from './typedef'
import { renderUnion as _renderUnion } from './union'

import {
    IMakeOptions,
    INamespaceFile,
    IRenderer,
    IRenderState,
} from '../../types'

import { typeNodeForFieldType } from './types'

export function renderIncludes(
    outPath: string,
    currentPath: string,
    resolvedFile: INamespaceFile,
    options: IMakeOptions,
): Array<ts.Statement> {
    if (fileUsesThrift(resolvedFile)) {
        return [
            renderThriftImports(options.library),
            ..._renderIncludes(outPath, currentPath, resolvedFile),
        ]
    } else {
        return _renderIncludes(outPath, currentPath, resolvedFile)
    }
}

export function renderConst(
    statement: ConstDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    return [
        _renderConst(
            statement,
            (fieldType: FunctionType, loose?: boolean): ts.TypeNode => {
                return typeNodeForFieldType(fieldType, state.identifiers, loose)
            },
        ),
    ]
}

export function renderTypeDef(
    statement: TypedefDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    return _renderTypeDef(
        statement,
        (fieldType: FunctionType, loose?: boolean): ts.TypeNode => {
            return typeNodeForFieldType(fieldType, state.identifiers, loose)
        },
        state.identifiers,
    )
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
    return _renderStruct(statement, state.identifiers)
}

export function renderException(
    statement: ExceptionDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    return _renderException(statement, state.identifiers)
}

export function renderUnion(
    statement: UnionDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    return _renderUnion(statement, state.identifiers)
}

export function renderService(
    statement: ServiceDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    return [_renderService(statement, state.identifiers)]
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
