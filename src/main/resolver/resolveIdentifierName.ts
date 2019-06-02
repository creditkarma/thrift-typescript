import { SyntaxType } from '@creditkarma/thrift-parser'
import {
    INamespace,
    INamespacePath,
    IResolveContext,
    IResolvedIdentifier,
} from '../types'

// Given the name of an identifier and the state in which that file is being rendered return the name that
// should be used for the identifier in the given context.
export function resolveIdentifierName(
    name: string,
    context: IResolveContext,
): IResolvedIdentifier {
    const currentNamespace: INamespace = context.currentNamespace
    const [pathName, base, ...tail] = name.split('.')
    let baseName: string = pathName

    if (base !== undefined) {
        baseName = [base, ...tail].join('.')
    }

    // Handle identifier exists in the current namespace
    if (currentNamespace.exports[pathName]) {
        if (
            context.currentDefinitions &&
            context.currentDefinitions[pathName]
        ) {
            return {
                rawName: name,
                name: pathName,
                baseName,
                pathName: undefined,
                fullName: name,
            }
        } else {
            const def = currentNamespace.exports[pathName]
            let rootName: string = pathName

            if (def.type === SyntaxType.ConstDefinition) {
                rootName = '__CONSTANTS__'
            }

            /**
             * Services do not export an object with the thrift-defined name.
             */
            if (def.type === SyntaxType.ServiceDefinition) {
                return {
                    rawName: name,
                    name: pathName,
                    baseName,
                    pathName: rootName,
                    fullName: `${rootName}`,
                }
            }

            return {
                rawName: name,
                name: pathName,
                baseName,
                pathName: rootName,
                fullName: `${rootName}.${name}`,
            }
        }
    }

    // Handle if identifier exists in another namespace
    const namespace: INamespacePath =
        currentNamespace.includedNamespaces[pathName]

    if (namespace !== undefined) {
        return {
            rawName: name,
            name: base,
            baseName,
            pathName,
            fullName: name,
        }
    }

    if (base === undefined) {
        return {
            rawName: name,
            name: pathName,
            baseName,
            pathName: undefined,
            fullName: name,
        }
    }

    throw new Error(`Unable to resolve identifier[${name}]`)
}
