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

import { renderIndex } from '../shared'
import {
    renderIncludes as _renderIncludes,
    renderThriftImports,
    statementsUseThrift,
} from '../shared/includes'
import { renderConst as _renderConst } from './const'
import { renderEnum as _renderEnum } from './enum'
import { renderException as _renderException } from './exception'
import { renderService as _renderService } from './service'
import { renderStruct as _renderStruct } from './struct'
import { renderTypeDef as _renderTypeDef } from './typedef'
import { renderStrictUnion, renderUnion as _renderUnion } from './union'

import { IRenderer, IRenderState } from '../../types'

import { typeNodeForFieldType } from './types'

export function renderImports(
    statements: Array<ThriftStatement>,
    state: IRenderState,
): Array<ts.Statement> {
    if (statementsUseThrift(statements)) {
        return [
            renderThriftImports(state.options.library),
            ..._renderIncludes(statements, state),
        ]
    } else {
        return _renderIncludes(statements, state)
    }
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
    return _renderStruct(statement, state)
}

export function renderException(
    statement: ExceptionDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    return _renderException(statement, state)
}

export function renderUnion(
    statement: UnionDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    if (state.options.strictUnions) {
        return renderStrictUnion(statement, state)
    } else {
        return _renderUnion(statement, state)
    }
}

export function renderService(
    statement: ServiceDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    return _renderService(statement, state)
}

export const renderer: IRenderer = {
    renderIndex,
    renderImports,
    renderConst,
    renderTypeDef,
    renderEnum,
    renderStruct,
    renderException,
    renderUnion,
    renderService,
}
