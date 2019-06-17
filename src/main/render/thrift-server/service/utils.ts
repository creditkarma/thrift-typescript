import * as ts from 'typescript'

import { FieldDefinition, FunctionDefinition } from '@creditkarma/thrift-parser'

import { THRIFT_IDENTIFIERS } from '../../apache/identifiers'
import { createConstStatement } from '../../shared/utils'
import { COMMON_IDENTIFIERS } from '../identifiers'

export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

// const output: thrift.TProtocol = new this.protocol(new this.transport());
export function createOutputVariable(): ts.VariableStatement {
    return createConstStatement(
        COMMON_IDENTIFIERS.output,
        ts.createTypeReferenceNode(THRIFT_IDENTIFIERS.TProtocol, undefined),
        ts.createNew(
            ts.createPropertyAccess(
                COMMON_IDENTIFIERS.this,
                COMMON_IDENTIFIERS.Protocol,
            ),
            undefined,
            [
                ts.createNew(
                    ts.createPropertyAccess(
                        COMMON_IDENTIFIERS.this,
                        COMMON_IDENTIFIERS.Transport,
                    ),
                    undefined,
                    [],
                ),
            ],
        ),
    )
}

export function createStructArgsName(
    def: FunctionDefinition | FieldDefinition,
): string {
    return `${capitalize(def.name.value)}__Args`
}

export function createStructResultName(
    def: FunctionDefinition | FieldDefinition,
): string {
    return `${capitalize(def.name.value)}__Result`
}
