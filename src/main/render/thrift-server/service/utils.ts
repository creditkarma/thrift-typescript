import * as ts from 'typescript'

import {
    Annotation,
    Annotations,
    FieldDefinition,
    FunctionDefinition,
    ServiceDefinition,
    SyntaxType,
} from '@creditkarma/thrift-parser'

import {
    DefinitionType, IIdentifierMap,
  } from '../../../types'

export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export function createStructArgsName(def: FunctionDefinition | FieldDefinition): string {
    return `${capitalize(def.name.value)}Args`
}

export function createStructResultName(def: FunctionDefinition | FieldDefinition): string {
    return `${capitalize(def.name.value)}Result`
}

// function functionsForService(node: ThriftStatement): Array<FunctionDefinition> {
//     switch (node.type) {
//         case SyntaxType.ServiceDefinition:
//             return node.functions

//         default:
//             throw new TypeError(`A service can only extend another service. Found: ${node.type}`)
//     }
// }

export function collectAllMethods(service: ServiceDefinition, identifiers: IIdentifierMap): Array<FunctionDefinition> {
    if (service.extends === null) {
        return service.functions

    } else {
        const parentService: DefinitionType = identifiers[service.extends.value].definition
        switch (parentService.type) {
            case SyntaxType.ServiceDefinition:
                // This actually doesn't work for deeply extended services. This identifier map only
                // has the identifiers for the current namespace.
                return [ ...collectAllMethods(parentService, identifiers), ...service.functions ]

            default:
                throw new TypeError(`A service can only extend another service. Found: ${parentService.type}`)
        }
    }
}

export function renderMethodNames(service: ServiceDefinition, identifiers: IIdentifierMap): ts.VariableStatement {
    return ts.createVariableStatement(
        [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
        ts.createVariableDeclarationList(
            [
                ts.createVariableDeclaration(
                    ts.createIdentifier('methodNames'),
                    ts.createTypeReferenceNode(
                        'Array<string>',
                        undefined,
                    ),
                    ts.createArrayLiteral([
                        ...collectAllMethods(service, identifiers).map((next: FunctionDefinition) => {
                            return ts.createLiteral(next.name.value)
                        }),
                    ]),
                ),
            ],
            ts.NodeFlags.Const,
        ),
    )
}

export function renderMethodNamesProperty(): ts.PropertyDeclaration {
    return ts.createProperty(
        undefined,
        [ ts.createToken(ts.SyntaxKind.PublicKeyword), ts.createToken(ts.SyntaxKind.ReadonlyKeyword) ],
        '_methodNames',
        undefined,
        ts.createTypeReferenceNode(
            'Array<string>',
            undefined,
        ),
        ts.createIdentifier('methodNames'),
    )
}

function getRawAnnotations(service: ServiceDefinition, identifiers: IIdentifierMap): Array<Annotation> {
    if (service.extends === null) {
        if (service.annotations) {
            return service.annotations.annotations
        } else {
            return []
        }

    } else {
        const parentService: DefinitionType = identifiers[service.extends.value].definition
        switch (parentService.type) {
            case SyntaxType.ServiceDefinition:
                if (service.annotations) {
                    // This actually doesn't work for deeply extended services. This identifier map only
                    // has the identifiers for the current namespace.
                    return [ ...getRawAnnotations(parentService, identifiers), ...service.annotations.annotations ]
                } else {
                    return getRawAnnotations(parentService, identifiers)
                }

            default:
                throw new TypeError(`A service can only extend another service. Found: ${parentService.type}`)
        }
    }
}

export function collectAllAnnotations(service: ServiceDefinition, identifiers: IIdentifierMap): Annotations {
    const temp: Map<string, Annotation> = new Map()
    const rawAnnotations: Array<Annotation> = getRawAnnotations(service, identifiers)

    for (const annotation of rawAnnotations) {
        temp.set(annotation.name.value, annotation)
    }

    return {
        type: SyntaxType.Annotations,
        loc: service.loc,
        annotations: Array.from(temp.values()),
    }
}
