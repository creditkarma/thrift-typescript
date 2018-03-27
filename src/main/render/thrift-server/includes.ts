import * as ts from 'typescript'
import * as path from 'path'

import {
    SyntaxType,
    ThriftStatement,
    ServiceDefinition,
    FieldDefinition,
    FunctionType,
} from '@creditkarma/thrift-parser'

import {
    IResolvedIdentifier,
    INamespaceFile,
    DefinitionType,
    IResolvedFile,
} from '../../types'

/**
 * import * as thrift from 'thrift';
 *
 * I would really like this to only import what is being used by the file we're
 * generating. We'll need to keep track of what each files uses.
 */
export function renderThriftImports(): ts.ImportDeclaration {
    return ts.createImportDeclaration(
        undefined,
        undefined,
        ts.createImportClause(
            undefined,
            ts.createNamespaceImport(ts.createIdentifier('thrift'))
        ),
        ts.createLiteral('@creditkarma/thrift-server-core'),
    )
}

function fieldTypeUsesName(fieldType: FunctionType, name: string): boolean {
    switch (fieldType.type) {
        case SyntaxType.Identifier:
            return fieldType.value === name

        case SyntaxType.SetType:
        case SyntaxType.ListType:
            return fieldTypeUsesName(fieldType.valueType, name)

        case SyntaxType.MapType:
            return (
                fieldTypeUsesName(fieldType.keyType, name) ||
                fieldTypeUsesName(fieldType.valueType, name)
            )

        default:
            return false
    }
}

function fieldUsesName(field: FieldDefinition, name: string): boolean {
    return (
        fieldTypeUsesName(field.fieldType, name)
    )
}

function fieldsUseName(fields: Array<FieldDefinition>, name: string): boolean {
    for (let i = 0; i < fields.length; i++) {
        const field = fields[i]
        if (fieldUsesName(field, name)) {
            return true
        }
    }

    return false
}

function serviceUsesName(service: ServiceDefinition, name: string): boolean {
    for (let i = 0; i < service.functions.length; i++) {
        const funcDef = service.functions[i]
        return (
            fieldTypeUsesName(funcDef.returnType, name) ||
            fieldsUseName(funcDef.fields, name) ||
            fieldsUseName(funcDef.throws, name)
        )
    }

    return false
}

function statementUsesName(statement: ThriftStatement, name: string): boolean {
    switch (statement.type) {
        case SyntaxType.ExceptionDefinition:
        case SyntaxType.UnionDefinition:
        case SyntaxType.StructDefinition:
            return fieldsUseName(statement.fields, name)

        case SyntaxType.ServiceDefinition:
            return serviceUsesName(statement, name)

        default:
            return false
    }
}

function statementsUseName(statements: Array<ThriftStatement>, name: string): boolean {
    for (let i = 0; i < statements.length; i++) {
        if (statementUsesName(statements[i], name)) {
            return true
        }
    }

    return false
}

/**
 * Should import codec:
 *
 * 1. if struct is used as a fieldType in another struct (union or exception),
 * 2. if the struct is used in a service method (as a field or exception)
 */
export function shouldImportCodec(def: DefinitionType, resolvedName: string, file: INamespaceFile): boolean {
    switch (def.type) {
        case SyntaxType.ExceptionDefinition:
        case SyntaxType.UnionDefinition:
        case SyntaxType.StructDefinition:
            return statementsUseName(file.body, resolvedName)

        default:
            return false
    }
}

interface IImportSpecifier {
    remoteName: string
    localName: string
}

function createImportsForFile(file: INamespaceFile, includes: Array<IResolvedIdentifier>): Array<IImportSpecifier> {
    return includes.reduce((acc: Array<IImportSpecifier>, next: IResolvedIdentifier) => {
        acc.push({
            remoteName: next.name,
            localName: next.resolvedName,
        })

        /**
         * In the event of a struct-like object we may need to include the codec for encoding/decoding the
         * object. We need to analyize the contents of this file to determine if the codec is needed.
         */
        if (shouldImportCodec(next.definition, next.resolvedName, file)) {
            acc.push({
                remoteName: `${next.name}Codec`,
                localName: `${next.resolvedName}Codec`,
            })
        }

        return acc
    }, [])
}

/**
 * Given a hash of included files this will return a list of import statements.
 *
 * @param currentPath The path of the file performing imports. Import paths are
 *                    resolved relative to this.
 * @param includes A hash of all included files
 * @param resolved A hash of include name to a list of ids used from this include
 */
export function renderIncludes(
    outPath: string,
    currentPath: string,
    resolvedFile: INamespaceFile,
): Array<ts.ImportDeclaration> {
    const imports: Array<ts.ImportDeclaration> = []
    for (const name of Object.keys(resolvedFile.includes)) {
        const resolvedIncludes: Array<IResolvedIdentifier> = resolvedFile.includes[name].identifiers
        const includeSpecifiers: Array<IImportSpecifier> = createImportsForFile(resolvedFile, resolvedIncludes)
        const includeFile: IResolvedFile = resolvedFile.includes[name].file

        if (resolvedIncludes != null && resolvedFile != null) {
            const includePath: string = path.resolve(outPath, includeFile.namespace.path, includeFile.namespace.name)
            imports.push(ts.createImportDeclaration(
                undefined,
                undefined,
                ts.createImportClause(
                    undefined,
                    ts.createNamedImports(
                        includeSpecifiers.map((next: IImportSpecifier) => {
                            return ts.createImportSpecifier(
                                ts.createIdentifier(next.remoteName),
                                ts.createIdentifier(next.localName),
                            )
                        }),
                    ),
                ),
                ts.createLiteral(
                    `./${path.join(
                        path.relative(
                            path.dirname(currentPath),
                            path.dirname(includePath),
                        ),
                    )}`,
                ),
            ))
        }
    }
    return imports
}
