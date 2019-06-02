import * as ts from 'typescript'

import {
    ConstList,
    ConstMap,
    ConstValue,
    DoubleConstant,
    FunctionType,
    IntConstant,
    ListType,
    MapType,
    SetType,
    StringLiteral,
    SyntaxType,
} from '@creditkarma/thrift-parser'

import { COMMON_IDENTIFIERS } from './identifiers'

import { Resolver } from '../../resolver'
import { IRenderState } from '../../types'
import { propertyAccessForIdentifier } from './utils'

export function renderValue(
    fieldType: FunctionType,
    node: ConstValue,
    state: IRenderState,
): ts.Expression {
    switch (node.type) {
        case SyntaxType.Identifier:
            return ts.createIdentifier(
                Resolver.resolveIdentifierName(node.value, {
                    currentNamespace: state.currentNamespace,
                    currentDefinitions: state.currentDefinitions,
                    namespaceMap: state.project.namespaces,
                }).fullName,
            )

        case SyntaxType.IntConstant:
            return renderIntConstant(node, fieldType)

        case SyntaxType.DoubleConstant:
            return renderDoubleConstant(node)

        case SyntaxType.BooleanLiteral:
            return ts.createLiteral(node.value)

        case SyntaxType.StringLiteral:
            if (fieldType.type === SyntaxType.BinaryKeyword) {
                return renderBuffer(node)
            } else {
                return ts.createLiteral(node.value)
            }

        case SyntaxType.ConstList:
            if (fieldType.type === SyntaxType.ListType) {
                return renderList(fieldType, node, state)
            } else if (fieldType.type === SyntaxType.SetType) {
                return renderSet(fieldType, node, state)
            } else {
                throw new TypeError(`Type list | set expected`)
            }

        case SyntaxType.ConstMap:
            if (fieldType.type === SyntaxType.MapType) {
                return renderMap(fieldType, node, state)
            } else {
                throw new TypeError(`Type map expected`)
            }

        default:
            const msg: never = node
            throw new Error(`Non-exhaustive match for ${msg}`)
    }
}

export function renderIntConstant(
    node: IntConstant,
    fieldType?: FunctionType,
): ts.Expression {
    switch (node.value.type) {
        case SyntaxType.IntegerLiteral:
            if (fieldType && fieldType.type === SyntaxType.I64Keyword) {
                return ts.createNew(COMMON_IDENTIFIERS.Node_Int64, undefined, [
                    ts.createLiteral(parseInt(node.value.value, 10)),
                ])
            } else {
                return ts.createLiteral(parseInt(node.value.value, 10))
            }

        case SyntaxType.HexLiteral:
            // The Int64 constructor accepts hex literals as strings
            if (fieldType && fieldType.type === SyntaxType.I64Keyword) {
                return ts.createNew(COMMON_IDENTIFIERS.Node_Int64, undefined, [
                    ts.createLiteral(node.value.value),
                ])
            } else {
                return ts.createLiteral(parseInt(node.value.value, 10))
            }

        default:
            const msg: never = node.value
            throw new Error(`Non-exhaustive match for ${msg}`)
    }
}

export function renderDoubleConstant(node: DoubleConstant): ts.Expression {
    switch (node.value.type) {
        case SyntaxType.FloatLiteral:
        case SyntaxType.ExponentialLiteral:
            return ts.createLiteral(parseFloat(node.value.value))

        default:
            const msg: never = node.value
            throw new Error(`Non-exhaustive match for ${msg}`)
    }
}

function renderMap(
    fieldType: MapType,
    node: ConstMap,
    state: IRenderState,
): ts.NewExpression {
    const values = node.properties.map(({ name, initializer }) => {
        return ts.createArrayLiteral([
            renderValue(fieldType.keyType, name, state),
            renderValue(fieldType.valueType, initializer, state),
        ])
    })

    return ts.createNew(COMMON_IDENTIFIERS.Map, undefined, [
        ts.createArrayLiteral(values),
    ])
}

function renderSet(
    fieldType: SetType,
    node: ConstList,
    state: IRenderState,
): ts.NewExpression {
    const values: Array<ts.Expression> = node.elements.map(
        (val: ConstValue) => {
            return renderValue(fieldType.valueType, val, state)
        },
    )

    return ts.createNew(COMMON_IDENTIFIERS.Set, undefined, [
        ts.createArrayLiteral(values),
    ])
}

function renderList(
    fieldType: ListType,
    node: ConstList,
    state: IRenderState,
): ts.ArrayLiteralExpression {
    const values: Array<ts.Expression> = node.elements.map(
        (val: ConstValue) => {
            return renderValue(fieldType.valueType, val, state)
        },
    )

    return ts.createArrayLiteral(values)
}

function renderBuffer(node: StringLiteral): ts.CallExpression {
    return ts.createCall(
        propertyAccessForIdentifier(COMMON_IDENTIFIERS.Buffer, 'from'),
        undefined,
        [ts.createLiteral(node.value)],
    )
}
