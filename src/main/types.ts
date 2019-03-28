import * as ts from 'typescript'

import {
    ConstDefinition,
    EnumDefinition,
    ExceptionDefinition,
    ServiceDefinition,
    StructDefinition,
    TextLocation,
    ThriftDocument,
    ThriftStatement,
    TypedefDefinition,
    UnionDefinition,
} from '@creditkarma/thrift-parser'
import ResolverFile from './resolver/file'
import ResolverNamespace from './resolver/namespace'

export type CompileTarget = 'apache' | 'thrift-server'

/**
 * The compiler options for our codegen. These can be provided to the generator
 * directly through the JS API, or via the command line.
 *
 * EXAMPLE
 *
 * $ thrift-parser --rootDir . --sourceDir thrift --outDir codegen example.thrift
 */
export interface IMakeOptions {
    rootDir: string

    // resolved relative to the root directory
    outDir: string

    // resolved relative to the root directory
    sourceDir: string

    // list of files to generate code from
    files: Array<string>

    // What core libs are you compiling for?
    target: CompileTarget

    // What namespace do we fallback to? Set to 'none' to not fallback.
    fallbackNamespace: string

    // What is the library to import thrift from
    // Defaults to 'thrift' for target = 'apache'
    // Defaults to '@creditkarma/thrift-server-core' for target = 'thrift-server'
    library: string

    // Should we render strict unions?
    strictUnions: boolean

    // Should render strict unions type with underscore
    strictUnionsComplexNames: boolean

    // renders each type into its own file.  All types are still re-exported from the index.ts for their namespace
    // Defaults to false
    filePerType: boolean
}

export interface IRenderer {
    renderIncludes(
        namespace: ResolverNamespace,
        files: Array<ResolverFile>,
        options: IMakeOptions,
        namespaceInclude?: string,
    ): Array<ts.Statement>

    renderConst(
        statement: ConstDefinition,
        resolverFile: ResolverFile,
    ): Array<ts.Statement>

    renderTypeDef(
        statement: TypedefDefinition,
        resolverFile: ResolverFile,
    ): Array<ts.Statement>

    renderEnum(
        statement: EnumDefinition,
        resolverFile: ResolverFile,
    ): Array<ts.Statement>

    renderStruct(
        statement: StructDefinition,
        resolverFile: ResolverFile,
    ): Array<ts.Statement>

    renderException(
        statement: ExceptionDefinition,
        resolverFile: ResolverFile,
    ): Array<ts.Statement>

    renderUnion(
        statement: UnionDefinition,
        resolverFile: ResolverFile,
    ): Array<ts.Statement>

    renderService(
        statement: ServiceDefinition,
        resolverFile: ResolverFile,
    ): Array<ts.Statement>

    renderAsNamespace(
        name: string,
        statements: Array<ts.Statement>,
    ): Array<ts.Statement>

    renderReExport(
        file: IRenderedFile,
        exportName: string | null,
    ): Array<ts.Statement>
}

export interface IThriftFile {
    name: string
    path: string
    source: string
}

export interface IParsedFile {
    name: string
    path: string
    source: string
    includes: Array<IParsedFile>
    ast: ThriftDocument
}
export interface IRenderedFile {
    outPath: string
    namespace: ResolverNamespace
    statements: Array<ts.Statement>
}

export interface IRenderedFileMap {
    [name: string]: IRenderedFile
}

export interface INamespace {
    scope: string
    name: string
    path: string
}

export interface INamespaceMap {
    [name: string]: INamespace
}

export interface IIncludeData {
    path: string
    base: string
}

export type DefinitionType =
    | ConstDefinition
    | StructDefinition
    | UnionDefinition
    | ExceptionDefinition
    | EnumDefinition
    | TypedefDefinition
    | ServiceDefinition

export interface IResolvedIdentifier {
    name: string
    pathName: string
    resolvedName: string
    definition: DefinitionType
}

export const enum ErrorType {
    ValidationError = 'ValidationError',
    ResolutionError = 'ResolutionError',
    GenerationError = 'GenerationError',
}

export interface IThriftError {
    type: ErrorType
    message: string
    loc: TextLocation
}

export interface IIncludeCache {
    [path: string]: IParsedFile
}

export interface IRenderedCache {
    [path: string]: Array<IRenderedFile>
}

export interface IStatementMap {
    [typeName: string]: {
        namespaced: boolean
        statements: Array<ts.Statement>
        file: ResolverFile
    }
}

export interface IValidatedFile {
    file: ResolverFile
    validStatements: Array<ThriftStatement>
    errors: Array<IThriftError>
}
