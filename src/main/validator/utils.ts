import {
    ConstValue,
    FunctionType,
    SyntaxType,
} from '@creditkarma/thrift-parser'

/**
 * Takes a ConstValue type from our Thrift AST and generated a string representation of the TypeScript
 * type. This is just for making our error messages more readable to users.
 *
 * @param constValue
 */
export function constToTypeString(constValue: ConstValue): string {
    switch (constValue.type) {
        case SyntaxType.Identifier:
            return constValue.value

        case SyntaxType.StringLiteral:
            return 'string'

        case SyntaxType.IntConstant:
        case SyntaxType.DoubleConstant:
            return 'number'

        case SyntaxType.BooleanLiteral:
            return 'boolean'

        case SyntaxType.ConstList:
            return `Array<${constToTypeString(constValue.elements[0])}>`

        case SyntaxType.ConstMap:
            return `Map<${constToTypeString(
                constValue.properties[0].name,
            )},${constToTypeString(constValue.properties[0].initializer)}>`

        default:
            const msg: never = constValue
            throw new Error(`Non-exhaustive match for ${msg}`)
    }
}

/**
 * Takes a FunctionType type from our Thrift AST and generated a string representation of the TypeScript
 * type. This is just for making our error messages more readable to users.
 *
 * @param fieldType
 */
export function fieldTypeToString(fieldType: FunctionType): string {
    switch (fieldType.type) {
        case SyntaxType.Identifier:
            return fieldType.value

        case SyntaxType.SetType:
            return `Set<${fieldTypeToString(fieldType.valueType)}>`

        case SyntaxType.MapType:
            return `Map<${fieldTypeToString(
                fieldType.keyType,
            )},${fieldTypeToString(fieldType.valueType)}>`

        case SyntaxType.ListType:
            return `Array<${fieldTypeToString(fieldType.valueType)}>`

        case SyntaxType.StringKeyword:
        case SyntaxType.BinaryKeyword:
            return 'string'

        case SyntaxType.BoolKeyword:
            return 'boolean'

        case SyntaxType.I64Keyword:
            return 'Int64'

        case SyntaxType.DoubleKeyword:
        case SyntaxType.I8Keyword:
        case SyntaxType.I16Keyword:
        case SyntaxType.I32Keyword:
        case SyntaxType.ByteKeyword:
            return 'number'

        case SyntaxType.VoidKeyword:
            return 'void'

        default:
            const msg: never = fieldType
            throw new Error(`Non-exhaustive match for: ${msg}`)
    }
}
