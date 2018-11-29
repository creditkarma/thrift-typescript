import * as ts from 'typescript'

import {
    FieldDefinition,
    FunctionDefinition,
    ServiceDefinition,
} from '@creditkarma/thrift-parser'

import { COMMON_IDENTIFIERS } from '../../shared/identifiers'
import { createStringType } from '../../shared/types'

export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export function createStructArgsName(def: FunctionDefinition | FieldDefinition): string {
    return `${capitalize(def.name.value)}__Args`
}

export function createStructResultName(def: FunctionDefinition | FieldDefinition): string {
    return `${capitalize(def.name.value)}__Result`
}

export function renderServiceName(service: ServiceDefinition): ts.Statement {
    return ts.createVariableStatement(
        [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
        ts.createVariableDeclarationList(
            [
                ts.createVariableDeclaration(
                    COMMON_IDENTIFIERS.serviceName,
                    createStringType(),
                    ts.createLiteral(service.name.value),
                ),
            ],
            ts.NodeFlags.Const,
        ),
    )
}
