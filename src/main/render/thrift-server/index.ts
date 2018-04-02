import * as ts from 'typescript'

import {
    ConstDefinition,
    TypedefDefinition,
    EnumDefinition,
    StructDefinition,
    ServiceDefinition,
    ExceptionDefinition,
    UnionDefinition,
    FunctionType,
} from '@creditkarma/thrift-parser'

import { renderException as _renderException } from './exception'

import {
    renderArgsStruct,
    renderClient,
    renderProcessor,
    renderResultStruct,
} from './service'

import {
    renderHandlerInterface,
} from '../shared/service'

import { renderStruct as _renderStruct } from './struct'
import { renderUnion as _renderUnion } from './union'
import { renderEnum as _renderEnum } from '../shared/enum'
import { renderTypeDef as _renderTypeDef } from '../shared/typedef'
import { renderConst as _renderConst } from '../shared/const'
import { fileUsesThrift } from '../shared/includes'
import {
    renderIncludes as _renderIncludes,
    renderThriftImports,
} from './includes'

import {
    IIdentifierMap,
    IRenderer,
    INamespaceFile,
    IMakeFlags,
} from '../../types'

import { typeNodeForFieldType } from './types';

export function renderIncludes(
    outPath: string,
    currentPath: string,
    resolvedFile: INamespaceFile,
): Array<ts.Statement> {
    if (fileUsesThrift(resolvedFile)) {
        return [
            renderThriftImports(),
            ..._renderIncludes(outPath, currentPath, resolvedFile),
        ]
    } else {
        return _renderIncludes(outPath, currentPath, resolvedFile)
    }
}

export function renderConst(statement: ConstDefinition, identifiers: IIdentifierMap): Array<ts.Statement> {
    return [ _renderConst(statement, (fieldType: FunctionType, loose?: boolean): ts.TypeNode => {
        return typeNodeForFieldType(fieldType, identifiers, loose)
    }) ]
}

export function renderTypeDef(statement: TypedefDefinition, identifiers: IIdentifierMap): Array<ts.Statement> {
    return _renderTypeDef(statement, (fieldType: FunctionType, loose?: boolean): ts.TypeNode => {
        return typeNodeForFieldType(fieldType, identifiers, loose)
    }, identifiers)
}

export function renderEnum(statement: EnumDefinition, identifiers: IIdentifierMap): Array<ts.Statement> {
    return [ _renderEnum(statement) ]
}

export function renderStruct(statement: StructDefinition, identifiers: IIdentifierMap): Array<ts.Statement> {
    return _renderStruct(statement, identifiers)
}

export function renderException(statement: ExceptionDefinition, identifiers: IIdentifierMap): Array<ts.Statement> {
    return _renderException(statement, identifiers)
}

export function renderUnion(statement: UnionDefinition, identifiers: IIdentifierMap, flags: IMakeFlags): Array<ts.Statement> {
    return _renderUnion(statement, identifiers, flags)
}

export function renderService(statement: ServiceDefinition, identifiers: IIdentifierMap): Array<ts.Statement> {
    return [
        ts.createModuleDeclaration(
            undefined,
            [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
            ts.createIdentifier(statement.name.value),
            ts.createModuleBlock([
                ...renderArgsStruct(statement, identifiers),
                ...renderResultStruct(statement, identifiers),
                renderClient(statement, identifiers),
                ...renderHandlerInterface(statement, (fieldType: FunctionType, loose?: boolean): ts.TypeNode => {
                    return typeNodeForFieldType(fieldType, identifiers, loose)
                }),
                renderProcessor(statement, identifiers),
            ]),
            ts.NodeFlags.Namespace
        )
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
