import * as ts from 'typescript'

import {
    FieldDefinition,
    InterfaceWithFields,
} from '@creditkarma/thrift-parser'

import {
    COMMON_IDENTIFIERS, THRIFT_IDENTIFIERS,
} from '../identifiers'

import {
    throwProtocolException,
} from '../utils'

type NameMapping = (name: string) => string

function splitPath(path: string): Array<string> {
    return path.split('.').filter((next: string): boolean => {
        return next.trim() !== ''
    })
}

function makeNameForNode(name: string, mapping: NameMapping): string {
    const parts: Array<string> = splitPath(name)
    if (parts.length > 1) {
        return `${parts[0]}.${mapping(parts[1])}`
    } else {
        return mapping(name)
    }
}

export function looseNameForStruct(node: InterfaceWithFields): string {
    return looseName(node.name.value)
}

export function classNameForStruct(node: InterfaceWithFields): string {
    return className(node.name.value)
}

export function strictNameForStruct(node: InterfaceWithFields): string {
    return strictName(node.name.value)
}

export function codecNameForStruct(node: InterfaceWithFields): string {
    return codecName(node.name.value)
}

export function className(name: string): string {
    return makeNameForNode(name, (part: string) => {
        return part
    })
}

export function looseName(name: string): string {
    return makeNameForNode(name, (part: string) => {
        return `I${part}Args`
    })
}

export function strictName(name: string): string {
    return makeNameForNode(name, (part: string) => {
        return `I${part}`
    })
}

export function codecName(name: string): string {
    return makeNameForNode(name, (part: string) => {
        return `${part}Codec`
    })
}

export function extendsAbstract(): ts.HeritageClause {
    return ts.createHeritageClause(
        ts.SyntaxKind.ExtendsKeyword,
        [
            ts.createExpressionWithTypeArguments(
                [],
                THRIFT_IDENTIFIERS.StructLike,
            ),
        ],
    )
}

export function implementsInterface(node: InterfaceWithFields): ts.HeritageClause {
    return ts.createHeritageClause(
        ts.SyntaxKind.ImplementsKeyword,
        [
            ts.createExpressionWithTypeArguments(
                [],
                ts.createIdentifier(
                    strictNameForStruct(node),
                ),
            ),
        ],
    )
}

export function createSuperCall(): ts.Statement {
    return ts.createStatement(
        ts.createCall(
            COMMON_IDENTIFIERS.super,
            undefined,
            [],
        ),
    )
}

/**
 * Create the Error for a missing required field
 *
 * EXAMPLE
 *
 * throw new thrift.TProtocolException(Thrift.TProtocolExceptionType.UNKNOWN, 'Required field {{fieldName}} is unset!')
 */
export function throwForField(field: FieldDefinition): ts.ThrowStatement | undefined {
    if (field.requiredness === 'required' && field.defaultValue === null) {
        return throwProtocolException(
            'UNKNOWN',
            `Required field[${field.name.value}] is unset!`,
        )
    } else {
        return undefined
    }
}
