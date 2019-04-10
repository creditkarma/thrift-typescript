import * as ts from 'typescript'

import {
    ConstDefinition,
    EnumDefinition,
    ExceptionDefinition,
    ServiceDefinition,
    StructDefinition,
    ThriftStatement,
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

import {
    renderIncludes as _renderIncludes,
    renderThriftImports,
    statementsUseInt64,
    statementsUseThrift,
} from '../shared/includes'
import { renderConst as _renderConst } from './const'
import { renderEnum as _renderEnum } from './enum'
import { renderInt64Import } from './includes'
import { renderStruct as _renderStruct } from './struct'
import { renderTypeDef as _renderTypeDef } from './typedef'
import { renderUnion as _renderUnion } from './union'

import { IRenderer, IRenderState } from '../../types'
import { renderIndex } from '../shared'
import { typeNodeForFieldType } from './types'

export function renderImports(
    statements: Array<ThriftStatement>,
    state: IRenderState,
): Array<ts.Statement> {
    const includes: Array<ts.Statement> = [
        ..._renderIncludes(statements, state),
    ]

    if (statementsUseThrift(statements)) {
        includes.unshift(renderThriftImports(state.options.library))
    }

    if (statementsUseInt64(statements)) {
        includes.unshift(renderInt64Import())
    }

    return includes
}

export function renderConst(
    statement: ConstDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    return [_renderConst(statement, typeNodeForFieldType, state)]
}

export function renderTypeDef(
    statement: TypedefDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    return _renderTypeDef(statement, typeNodeForFieldType, state)
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
    return [renderInterface(statement, state), _renderStruct(statement, state)]
}

export function renderException(
    statement: ExceptionDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    return [
        renderInterface(statement, state),
        _renderException(statement, state),
    ]
}

export function renderUnion(
    statement: UnionDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    return [renderInterface(statement, state), _renderUnion(statement, state)]
}

export function renderService(
    statement: ServiceDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    return [
        ...renderArgsStruct(statement, state),
        ...renderResultStruct(statement, state),
        renderClient(statement, state),
        ...renderHandlerInterface(statement, state),
        renderProcessor(statement, state),
    ]
}

export const renderer: IRenderer = {
    renderImports,
    renderConst,
    renderTypeDef,
    renderEnum,
    renderStruct,
    renderException,
    renderUnion,
    renderService,
    renderIndex,
}
