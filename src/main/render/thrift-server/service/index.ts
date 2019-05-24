import * as ts from 'typescript'

import {
    FieldDefinition,
    FunctionDefinition,
    ServiceDefinition,
    StructDefinition,
    SyntaxType,
    TextLocation,
} from '@creditkarma/thrift-parser'

import {
    collectAllAnnotations,
    collectAllMethods,
    createStructArgsName,
    createStructResultName,
    renderMethodNames,
    renderMethodParameters,
    renderServiceName,
} from './utils'

import { renderStruct } from '../struct'

import { IRenderState } from '../../../types'

import { renderClient } from './client'

import { renderProcessor } from './processor'

import { renderHandlerInterface } from '../../shared/service'

import { typeNodeForFieldType } from '../types'

import {
    renderMethodAnnotations,
    renderServiceAnnotations,
} from '../annotations'

function emptyLocation(): TextLocation {
    return {
        start: { line: 0, column: 0, index: 0 },
        end: { line: 0, column: 0, index: 0 },
    }
}

export function renderService(
    service: ServiceDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    return [
        renderServiceName(service),
        renderServiceAnnotations(collectAllAnnotations(service, state)),
        renderMethodAnnotations(collectAllMethods(service, state)),
        renderMethodNames(service, state),
        renderMethodParameters(service, state),
        ...renderArgsStruct(service, state),
        ...renderResultStruct(service, state),
        renderClient(service, state),
        ...renderHandlerInterface(service, typeNodeForFieldType, state),
        renderProcessor(service, state),
    ]
}

export function renderArgsStruct(
    service: ServiceDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    return service.functions.reduce(
        (
            acc: Array<ts.Statement>,
            func: FunctionDefinition,
        ): Array<ts.Statement> => {
            const argsStruct: StructDefinition = {
                type: SyntaxType.StructDefinition,
                name: {
                    type: SyntaxType.Identifier,
                    value: createStructArgsName(func),
                    loc: emptyLocation(),
                },
                fields: func.fields.map((next: FieldDefinition) => {
                    next.requiredness =
                        next.requiredness === 'optional'
                            ? 'optional'
                            : 'required'
                    return next
                }),
                comments: [],
                loc: emptyLocation(),
            }

            return [...acc, ...renderStruct(argsStruct, state)]
        },
        [],
    )
}

export function renderResultStruct(
    service: ServiceDefinition,
    state: IRenderState,
): Array<ts.Statement> {
    return service.functions.reduce(
        (
            acc: Array<ts.Statement>,
            func: FunctionDefinition,
        ): Array<ts.Statement> => {
            let fieldID: number = 0
            const resultStruct: StructDefinition = {
                type: SyntaxType.StructDefinition,
                name: {
                    type: SyntaxType.Identifier,
                    value: createStructResultName(func),
                    loc: emptyLocation(),
                },
                fields: [
                    {
                        type: SyntaxType.FieldDefinition,
                        name: {
                            type: SyntaxType.Identifier,
                            value: 'success',
                            loc: emptyLocation(),
                        },
                        fieldID: {
                            type: SyntaxType.FieldID,
                            value: fieldID++,
                            loc: emptyLocation(),
                        },
                        requiredness: 'optional',
                        fieldType: func.returnType,
                        defaultValue: null,
                        comments: [],
                        loc: emptyLocation(),
                    },
                    ...func.throws.map(
                        (next: FieldDefinition): FieldDefinition => {
                            return {
                                type: SyntaxType.FieldDefinition,
                                name: next.name,
                                fieldID: {
                                    type: SyntaxType.FieldID,
                                    value: fieldID++,
                                    loc: emptyLocation(),
                                },
                                requiredness: 'optional',
                                fieldType: next.fieldType,
                                defaultValue: null,
                                comments: [],
                                loc: emptyLocation(),
                            }
                        },
                    ),
                ],
                comments: [],
                loc: emptyLocation(),
            }

            return [...acc, ...renderStruct(resultStruct, state)]
        },
        [],
    )
}
