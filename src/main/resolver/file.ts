import { SyntaxType, ThriftStatement } from '@creditkarma/thrift-parser'
import { DefinitionType, IParsedFile, IResolvedIdentifier } from '../types'
import ResolverNamespace from './namespace'
import ResolverSchema from './schema'

export default class ResolverFile {
    public schema: ResolverSchema
    public identifiers: Map<string, DefinitionType> = new Map()
    public namespace: ResolverNamespace
    public includes: Map<string, ResolverFile> = new Map()
    public parsedFile: IParsedFile
    public fileName: string
    public body: Array<ThriftStatement> = []

    constructor(
        fileName: string,
        parsedFile: IParsedFile,
        schema: ResolverSchema,
        namespace: ResolverNamespace,
    ) {
        this.fileName = fileName
        this.schema = schema
        this.namespace = namespace
        this.parsedFile = parsedFile
    }

    public addInclude(file: ResolverFile) {
        this.includes.set(file.parsedFile.name, file)
    }

    public addIdentifier(identifierName: string, definition: DefinitionType) {
        this.identifiers.set(identifierName, definition)
    }

    public addStatements(statements: Array<ThriftStatement>) {
        this.body = [...this.body, ...statements]
    }

    public updateStatements(statements: Array<ThriftStatement>) {
        this.body = statements
    }

    public resolveIdentifier(identifierName: string): IResolvedIdentifier {
        const parts = identifierName.split('.')
        let file: ResolverFile = this
        let identifier: string = identifierName
        let name: string = identifierName
        let pathName = ''

        if (parts.length > 1) {
            const [includePath, base, ...tail] = parts

            /**
             * In this case we are dealing with an Identifier that is defined in
             * another file. The first part (includePath) is a reference to the file
             * containing the type definition
             */
            if (this.includes.has(includePath)) {
                file = this.includes.get(includePath)!
                pathName = includePath
                identifier = base
                if (tail.length > 0) {
                    name = `${base}.${tail.join('.')}`
                } else {
                    name = base
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
                const id = file.identifiers.get(includePath)
                identifier = includePath

                if (id !== undefined) {
                    if (id.type === SyntaxType.TypedefDefinition) {
                        if (id.definitionType.type === SyntaxType.Identifier) {
                            name = [
                                id.definitionType.value,
                                base,
                                ...tail,
                            ].join('.')
                        }
                    }
                }
            }
        }

        if (!pathName && this.schema.options.filePerType) {
            pathName = '__NAMESPACE__'
        }

        const definition = file.identifiers.get(identifier)
        const resolvedName = pathName ? `${pathName}.${name}` : name

        if (!definition) {
            throw new Error(
                `Referenced type ${identifierName} does not exist in schema`,
            )
        }

        return {
            name,
            resolvedName,
            definition,
            pathName,
        }
    }
}
