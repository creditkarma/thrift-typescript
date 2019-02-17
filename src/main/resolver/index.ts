/**
 * RESOLVER
 *
 * TODO: Some of the logic in this file may best fit with thrift-parser. Will need
 * to revist this and decide what logic is generic enough to be in the parser. What
 * could other code generators use?
 */
import {
    SyntaxType,
    ThriftStatement,
    TypedefDefinition,
} from '@creditkarma/thrift-parser'

import { DefinitionType, INamespace, IParsedFile } from '../types'

import ResolverFile from './file'
import ResolverSchema from './schema'
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
    schema: ResolverSchema,
): ResolverFile {
    const cacheKey: string = `${parsedFile.path}/${parsedFile.name}`

    if (cacheKey === '/' || !schema.files.has(cacheKey)) {
        const namespace: INamespace = resolveNamespace(
            outPath,
            parsedFile.ast,
            schema.options,
        )

        const file = schema.addFile(cacheKey, parsedFile, namespace)

        parsedFile.includes.forEach((next: IParsedFile) => {
            file.addInclude(resolveFile(outPath, next, schema))
        })

        function definitionForTypeDef(
            statement: TypedefDefinition,
        ): DefinitionType {
            switch (statement.definitionType.type) {
                case SyntaxType.Identifier:
                    return file.resolveIdentifier(
                        statement.definitionType.value,
                    ).definition

                default:
                    return statement
            }
        }

        // Add types defined in this file to our Identifier map
        function addIdentifiers(statement: ThriftStatement): void {
            switch (statement.type) {
                case SyntaxType.StructDefinition:
                case SyntaxType.UnionDefinition:
                case SyntaxType.ExceptionDefinition:
                case SyntaxType.EnumDefinition:
                case SyntaxType.ConstDefinition:
                case SyntaxType.ServiceDefinition:
                    file.addIdentifier(statement.name.value, statement)
                    return

                case SyntaxType.TypedefDefinition:
                    file.addIdentifier(
                        statement.name.value,
                        definitionForTypeDef(statement),
                    )
                    return
                default:
                    return
            }
        }

        parsedFile.ast.body.forEach((statement: ThriftStatement) => {
            addIdentifiers(statement)
        })

        file.addStatements(parsedFile.ast.body)
    }

    return schema.files.get(cacheKey)!
}
