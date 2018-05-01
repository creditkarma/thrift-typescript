import {
    InterfaceWithFields,
    SyntaxType,
} from '@creditkarma/thrift-parser'

export function looseNameForStruct(node: InterfaceWithFields): string {
    switch (node.type) {
        case SyntaxType.StructDefinition:
        case SyntaxType.UnionDefinition:
            return looseName(node.name.value)

        default:
            return node.name.value
    }
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
    return `${name}`
}

export function looseName(name: string): string {
    return `I${name}_Loose`
}

export function strictName(name: string): string {
    return `I${name}`
}

export function codecName(name: string): string {
    return `${name}Codec`
}
