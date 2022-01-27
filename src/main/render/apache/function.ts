import * as ts from 'typescript'

import {
    FieldDefinition,
    InterfaceWithFields,
} from '@creditkarma/thrift-parser'

import { IRenderState } from '../../types'
import { createArgsParameterForStruct } from './struct'
import { renderValue } from './values'

export function functionNameForClass(statement: InterfaceWithFields): string {
    return `create${statement.name.value}`
}

function interfaceConstruction(
    statement: InterfaceWithFields,
    state: IRenderState,
): ts.Block {
    return ts.createBlock(
        [
            ts.createReturn(
                ts.createObjectLiteral(
                    statement.fields.map((field: FieldDefinition) => {
                        const defaultValue =
                            field.defaultValue !== null
                                ? renderValue(
                                      field.fieldType,
                                      field.defaultValue,
                                      state,
                                  )
                                : ts.createIdentifier(
                                      `args.${field.name.value}`,
                                  )
                        return ts.createPropertyAssignment(
                            ts.createIdentifier(field.name.value),
                            defaultValue,
                        )
                    }),
                    true,
                ),
            ),
        ],
        true,
    )
}

export function renderFunction(
    statement: InterfaceWithFields,
    state: IRenderState,
): ts.FunctionDeclaration {
    return ts.createFunctionDeclaration(
        undefined,
        [ts.createToken(ts.SyntaxKind.ExportKeyword)],
        undefined,
        functionNameForClass(statement),
        undefined,
        createArgsParameterForStruct(statement),
        ts.createTypeReferenceNode(statement.name.value, undefined),
        interfaceConstruction(statement, state),
    )
}
