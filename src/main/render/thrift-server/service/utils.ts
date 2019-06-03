import * as ts from 'typescript'

import { FieldDefinition, FunctionDefinition } from '@creditkarma/thrift-parser'

import { createConstStatement } from '../../shared/utils'
import { COMMON_IDENTIFIERS } from '../identifiers'
import { createProtocolConstructorType } from '../types'

export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

// const output: thrift.TProtocol = new this.protocol(new this.transport());
export function createOutputVariable(): ts.VariableStatement {
    return createConstStatement(
        COMMON_IDENTIFIERS.output,
        createProtocolConstructorType(),
        ts.createNew(
            ts.createPropertyAccess(
                COMMON_IDENTIFIERS.this,
                COMMON_IDENTIFIERS.protocol,
            ),
            undefined,
            [
                ts.createNew(
                    ts.createPropertyAccess(
                        COMMON_IDENTIFIERS.this,
                        COMMON_IDENTIFIERS.transport,
                    ),
                    undefined,
                    undefined,
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
