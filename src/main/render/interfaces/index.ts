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

import { renderExceptionInterfaces } from '../thrift-server/exception'

import { renderService as _renderService } from '../thrift-server/service'

import { renderConst as _renderConst } from '../thrift-server/const'
import { renderEnum as _renderEnum } from '../thrift-server/enum'
import { renderStructInterfaces } from '../thrift-server/struct'
import { renderUnionInterfaces } from '../thrift-server/union'
import {
    renderIncludes as _renderIncludes,
} from './includes'
import { renderTypeDef as _renderTypeDef } from './typedef'

import {
    INamespaceFile,
    IRenderer,
    IRenderState,
} from '../../types'

import { typeNodeForFieldType } from '../thrift-server/types'

export function renderIncludes(
    outPath: string,
    currentPath: string,
    resolvedFile: INamespaceFile,
    state: IRenderState,
): Array<ts.Statement> {
    return _renderIncludes(outPath, currentPath, resolvedFile, state)
}

export function renderConst(statement: ConstDefinition, state: IRenderState): Array<ts.Statement> {
    return [
        _renderConst(statement, (fieldType: FunctionType, loose?: boolean): ts.TypeNode => {
            return typeNodeForFieldType(fieldType, state, loose)
        }, state),
    ]
}

export function renderTypeDef(statement: TypedefDefinition, state: IRenderState): Array<ts.Statement> {
    return _renderTypeDef(statement, (fieldType: FunctionType, loose?: boolean): ts.TypeNode => {
        return typeNodeForFieldType(fieldType, state, loose)
    }, state.identifiers)
}

export function renderEnum(statement: EnumDefinition, state: IRenderState): Array<ts.Statement> {
    return [ _renderEnum(statement, state) ]
}

export function renderStruct(statement: StructDefinition, state: IRenderState): Array<ts.Statement> {
    return renderStructInterfaces(statement, state)
}

export function renderException(statement: ExceptionDefinition, state: IRenderState): Array<ts.Statement> {
    return renderExceptionInterfaces(statement, state)
}

export function renderUnion(statement: UnionDefinition, state: IRenderState): Array<ts.Statement> {
    return renderUnionInterfaces(statement, state)
}

export function renderService(statement: ServiceDefinition, state: IRenderState): Array<ts.Statement> {
    return []
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
