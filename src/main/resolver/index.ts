/**
 * RESOLVER
 *
 * TODO: Some of the logic in this file may best fit with thrift-parser. Will need
 * to revist this and decide what logic is generic enough to be in the parser. What
 * could other code generators use?
 */
import {
    ConstValue,
    FieldDefinition,
    FieldType,
    FunctionDefinition,
    FunctionType,
    SyntaxType,
    ThriftStatement,
    TypedefDefinition,
} from '@creditkarma/thrift-parser'

import {
    DefinitionType,
    IIdentifierMap,
    IMakeOptions,
    INamespace,
    IParsedFile,
    IResolvedCache,
    IResolvedFile,
    IResolvedFileMap,
    IResolvedIdentifier,
    IResolvedIncludeMap,
} from '../types'

import { resolveNamespace } from './utils'

/**
 * The job of the resolver is to traverse the AST and find all of the Identifiers. In order to
 * correctly generate code we need to know the types of all Identifiers. The type of an
 * Identifier may be defined in this Thrift doc or a Thrift doc imported through an include.
 *
 * The resolve function will find the ultimate definition of an Identifier and save its type
 * to a hash map of the form (name -> type)
 *
 * There are ultimately two places we need to look for Identifiers. Types or values defined by
 * this file will be defined by a ThriftStatement. When looping through the Thrift statements
 * we need to save all statements that can be exported and used as types by other files. These
 * are Structs, Unions, Exceptions, Enums and TypeDefs
 *
 * The other thing we need to do is look at Identifiers used by this file. Identifiers can appear
 * in three positions, FieldType, ReturnType or value (initializer or defaultValue). The usual case
 * is for an Identifier to represent a type, but an Identifier can represent a value if the
 * Identifier represents a const or an enum. When we find an Identifier we need to resolve what it
 * actualy refers to.
 *
 *
 * REDRAW THE AST
 *
 * The other thing this will do is redraw the AST so that imported Identifiers no longer use
 * the dot syntax. The dot syntax is replaced with '$'
 *
 * For example
 *
 * // thrift
 * const example.Type name = "value"
 *
 * // typescript
 * const name: example$Type = "value"
 *
 * Then, when we create our imports we do this:
 *
 * import { Type as example$Type } from './example'
 *
 *
 * KEEP TRACK OF USED IMPORTS
 *
 * When we ultimately generate TypeScript we will need to import types from the included files. The
 * final thing the resolver does is keep a list of all Identifiers used from a specific import. This
 * allows us to only import what we need from given files.
 *
 *
 * IRESOLVEDFILE
 *
 * Ultimately this returns an object of the type IResolvedFile which will contain the namespaces for
 * this Thrift file, the resolved includes, the resolved Identifiers and a new doc body where Identifiers
 * in statements are using the rewritten names.
 *
 * @param thrift
 * @param includes
 */
export function resolveFile(
    outPath: string,
    parsedFile: IParsedFile,
    options: IMakeOptions,
    cache: IResolvedCache = {},
): IResolvedFile {
    const cacheKey: string = `${parsedFile.path}/${parsedFile.name}`

    if (cacheKey === '/' || !cache[cacheKey]) {
        const identifiers: IIdentifierMap = {}
        const resolvedIncludes: IResolvedIncludeMap = {}
        const namespace: INamespace = resolveNamespace(
            outPath,
            parsedFile.ast,
            options,
        )
        const includes: Array<IResolvedFile> = parsedFile.includes.map(
            (next: IParsedFile): IResolvedFile => {
                return resolveFile(outPath, next, options, cache)
            },
        )

        const includeMap: IResolvedFileMap = includes.reduce(
            (acc: IResolvedFileMap, next: IResolvedFile): IResolvedFileMap => {
                acc[next.name] = next
                return acc
            },
            {},
        )

        for (const include of includes) {
            resolvedIncludes[include.name] = {
                file: include,
                identifiers: [],
            }
        }

        function resolveFunctionType(fieldType: FunctionType): FunctionType {
            switch (fieldType.type) {
                case SyntaxType.VoidKeyword:
                    return fieldType

                default:
                    return resolveFieldType(fieldType)
            }
        }

        function resolveFieldType(fieldType: FieldType): FieldType {
            switch (fieldType.type) {
                /**
                 * An Identifier can refer to either a container type or an alias to another
                 * type. Here we check for the typedef case and resolve to the base type in that
                 * case.
                 */
                case SyntaxType.Identifier:
                    const id: IResolvedIdentifier = identifiers[fieldType.value]
                    if (
                        id !== undefined &&
                        id.definition.type === SyntaxType.TypedefDefinition
                    ) {
                        return id.definition.definitionType
                    } else {
                        return {
                            type: SyntaxType.Identifier,
                            value: resolveName(fieldType.value),
                            loc: fieldType.loc,
                        }
                    }

                case SyntaxType.ListType:
                    return {
                        type: SyntaxType.ListType,
                        valueType: resolveFieldType(fieldType.valueType),
                        loc: fieldType.loc,
                    }

                case SyntaxType.SetType:
                    return {
                        type: SyntaxType.SetType,
                        valueType: resolveFieldType(fieldType.valueType),
                        loc: fieldType.loc,
                    }

                case SyntaxType.MapType:
                    return {
                        type: SyntaxType.MapType,
                        valueType: resolveFieldType(fieldType.valueType),
                        keyType: resolveFieldType(fieldType.keyType),
                        loc: fieldType.loc,
                    }

                default:
                    return fieldType
            }
        }

        function resolveValue(constValue: ConstValue): ConstValue {
            switch (constValue.type) {
                case SyntaxType.Identifier:
                    return {
                        type: SyntaxType.Identifier,
                        value: resolveName(constValue.value),
                        loc: constValue.loc,
                    }

                default:
                    return constValue
            }
        }

        function resolveFunction(func: FunctionDefinition): FunctionDefinition {
            return {
                type: SyntaxType.FunctionDefinition,
                name: func.name,
                returnType: resolveFunctionType(func.returnType),
                fields: func.fields.map(resolveField),
                throws: func.throws.map(resolveField),
                comments: func.comments,
                annotations: func.annotations,
                oneway: func.oneway,
                modifiers: func.modifiers,
                loc: func.loc,
            }
        }

        function resolveField(field: FieldDefinition): FieldDefinition {
            return {
                type: SyntaxType.FieldDefinition,
                name: field.name,
                fieldID: field.fieldID,
                fieldType: resolveFunctionType(field.fieldType),
                requiredness: field.requiredness,
                defaultValue:
                    field.defaultValue !== null
                        ? resolveValue(field.defaultValue)
                        : null,
                comments: field.comments,
                annotations: field.annotations,
                loc: field.loc,
            }
        }

        function resolveStatement(statement: ThriftStatement): ThriftStatement {
            switch (statement.type) {
                case SyntaxType.ConstDefinition:
                    return {
                        type: SyntaxType.ConstDefinition,
                        name: statement.name,
                        fieldType: resolveFieldType(statement.fieldType),
                        initializer: resolveValue(statement.initializer),
                        comments: statement.comments,
                        annotations: statement.annotations,
                        loc: statement.loc,
                    }

                case SyntaxType.ServiceDefinition:
                    return {
                        type: SyntaxType.ServiceDefinition,
                        name: statement.name,
                        extends:
                            statement.extends !== null
                                ? {
                                      type: SyntaxType.Identifier,
                                      value: resolveName(
                                          statement.extends.value,
                                      ),
                                      loc: statement.extends.loc,
                                  }
                                : null,
                        functions: statement.functions.map(
                            (next: FunctionDefinition) => {
                                return resolveFunction(next)
                            },
                        ),
                        comments: statement.comments,
                        annotations: statement.annotations,
                        loc: statement.loc,
                    }

                case SyntaxType.StructDefinition:
                    return {
                        type: SyntaxType.StructDefinition,
                        name: statement.name,
                        fields: statement.fields.map(resolveField),
                        comments: statement.comments,
                        annotations: statement.annotations,
                        loc: statement.loc,
                    }

                case SyntaxType.UnionDefinition:
                    return {
                        type: SyntaxType.UnionDefinition,
                        name: statement.name,
                        fields: statement.fields.map(resolveField),
                        comments: statement.comments,
                        annotations: statement.annotations,
                        loc: statement.loc,
                    }

                case SyntaxType.ExceptionDefinition:
                    return {
                        type: SyntaxType.ExceptionDefinition,
                        name: statement.name,
                        fields: statement.fields.map(resolveField),
                        comments: statement.comments,
                        annotations: statement.annotations,
                        loc: statement.loc,
                    }

                case SyntaxType.TypedefDefinition:
                    return {
                        type: SyntaxType.TypedefDefinition,
                        name: statement.name,
                        definitionType: resolveFieldType(
                            statement.definitionType,
                        ),
                        comments: statement.comments,
                        annotations: statement.annotations,
                        loc: statement.loc,
                    }

                default:
                    return statement
            }
        }

        function containsIdentifier(
            pathName: string,
            resolvedName: string,
        ): boolean {
            for (const include of resolvedIncludes[pathName].identifiers) {
                if (include.resolvedName === resolvedName) {
                    return true
                }
            }
            return false
        }

        function definitionForTypeDef(
            statement: TypedefDefinition,
        ): DefinitionType {
            switch (statement.definitionType.type) {
                case SyntaxType.Identifier:
                    return identifiers[statement.definitionType.value]
                        .definition

                default:
                    return statement
            }
        }

        // Add types defined in this file to our Identifier map
        function addIdentiferForStatement(statement: ThriftStatement): void {
            switch (statement.type) {
                case SyntaxType.StructDefinition:
                case SyntaxType.UnionDefinition:
                case SyntaxType.ExceptionDefinition:
                case SyntaxType.EnumDefinition:
                case SyntaxType.ConstDefinition:
                case SyntaxType.ServiceDefinition:
                    identifiers[statement.name.value] = {
                        name: statement.name.value,
                        pathName: '',
                        resolvedName: statement.name.value,
                        definition: statement,
                    }
                    return

                case SyntaxType.TypedefDefinition:
                    identifiers[statement.name.value] = {
                        name: statement.name.value,
                        pathName: '',
                        resolvedName: statement.name.value,
                        definition: definitionForTypeDef(statement),
                    }
                    return

                default:
                    return
            }
        }

        function resolveName(name: string): string {
            const parts: Array<string> = name.split('.')

            if (parts.length > 1) {
                const [pathname, base, ...tail] = parts

                /**
                 * In this case we are dealing with an Identifier that is defined in
                 * another file. The first part (pathname) is a reference to the file
                 * containing the type definition
                 */
                if (resolvedIncludes[pathname] !== undefined) {
                    const resolvedName: string = `${pathname}.${base}`
                    const baseIdentifier: IResolvedIdentifier =
                        includeMap[pathname].identifiers[base]

                    identifiers[resolvedName] = {
                        name: baseIdentifier.name,
                        pathName: pathname,
                        resolvedName,
                        definition: baseIdentifier.definition,
                    }

                    if (!containsIdentifier(pathname, resolvedName)) {
                        const resolvedIdentifier: IResolvedIdentifier = {
                            name: base,
                            pathName: pathname,
                            resolvedName,
                            definition: baseIdentifier.definition,
                        }

                        resolvedIncludes[pathname].identifiers.push(
                            resolvedIdentifier,
                        )
                    }

                    if (tail.length > 0) {
                        return `${resolvedName}.${tail.join('.')}`
                    } else {
                        return resolvedName
                    }

                    /**
                     * This case handles assignment to values
                     *
                     * ```
                     * enum MyEnum {
                     *   ONE,
                     *   TWO
                     * }
                     *
                     * typedef OtherName = MyEnum
                     *
                     * const OtherName TEST = OtherName.ONE
                     * ```
                     *
                     * We need to resolve 'OtherName' in the value assignement
                     */
                } else {
                    const id: IResolvedIdentifier = identifiers[pathname]

                    if (id !== undefined) {
                        if (
                            id.definition.type === SyntaxType.TypedefDefinition
                        ) {
                            if (
                                id.definition.definitionType.type ===
                                SyntaxType.Identifier
                            ) {
                                return [
                                    id.definition.definitionType.value,
                                    base,
                                    ...tail,
                                ].join('.')
                            }
                        }
                    }

                    return name
                }
            } else {
                return name
            }
        }

        cache[cacheKey] = {
            name: parsedFile.name,
            path: parsedFile.path,
            source: parsedFile.source,
            namespace,
            includes: resolvedIncludes,
            identifiers,
            body: parsedFile.ast.body.map((statement: ThriftStatement) => {
                const resolvedStatement: ThriftStatement = resolveStatement(
                    statement,
                )
                addIdentiferForStatement(resolvedStatement)
                return resolvedStatement
            }),
            errors: [],
        }
    }

    return cache[cacheKey]
}
