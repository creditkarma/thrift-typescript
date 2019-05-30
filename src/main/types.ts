import * as ts from 'typescript'

import {
    ConstDefinition,
    EnumDefinition,
    ExceptionDefinition,
    ServiceDefinition,
    StructDefinition,
    ThriftStatement,
    TypedefDefinition,
    UnionDefinition,
} from '@creditkarma/thrift-parser'

import { IThriftError } from './errors'

// Context needed to resolve an identifier
export interface IResolveContext {
    // Namespace where the identifier is used
    currentNamespace: INamespace

    // Namespaces in current project
    namespaceMap: INamespaceMap
}

export interface IThriftProject {
    type: 'ThriftProject'

    // Root directory for the project
    rootDir: string

    // Output directory (relative to root) for generated code
    outDir: string

    // Source directory (relative to root) for thrift files
    sourceDir: string

    // Namespace declared in this project
    namespaces: INamespaceMap

    // Options for rendering this project
    options: IMakeOptions
}

export interface INamespaceFiles {
    [name: string]: Array<IParsedFile>
}

// Map of resolved identifier name to the namespace it represents
export interface INamespacePathMap {
    [namespaceAccessor: string]: INamespacePath
}

export interface INamespacePath {
    type: 'NamespacePath'

    // Scope is the language this namespace belongs to 'js', 'java'...
    scope: string

    // The name of the namespace com.company.package
    name: string

    // The name translated to its result path com/company/package
    path: string

    // The resolved accessor name used in generated TypeScript
    accessor: string
}

// Namespace path to namespace
export interface INamespaceMap {
    [path: string]: INamespace
}

export interface INamespace {
    type: 'Namespace'

    namespace: INamespacePath

    // Identifiers defined in this namespace
    exports: IFileExports

    // Map of namespaces used by this file by accessor name
    includedNamespaces: INamespacePathMap

    // Map of raw namespace path to accessor name
    namespaceIncludes: INamespaceToIncludeMap

    // Errors encountered while processing this namespace
    errors: Array<IThriftError>

    // Data/services defined in this namespace
    constants: Array<ConstDefinition>
    enums: Array<EnumDefinition>
    typedefs: Array<TypedefDefinition>
    structs: Array<StructDefinition>
    unions: Array<UnionDefinition>
    exceptions: Array<ExceptionDefinition>
    services: Array<ServiceDefinition>
}

export interface IRenderState {
    // Options for this render
    options: IMakeOptions

    // The current namespace being processed
    currentNamespace: INamespace

    // Current statements being processed
    currentDefinitions: IFileExports

    // The current Thrift project
    project: IThriftProject
}

export type CompileTarget = 'apache' | 'thrift-server'

export interface IMakeOptions {
    // Root to resolve outDir and sourceDir from
    rootDir: string

    // Where to put generated TypeScript
    outDir: string

    // Where to find source thrift
    sourceDir: string

    // Files to generate from
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

    // Should we render the __name field on struct-like objects
    withNameField: boolean
}

export interface IThriftFiles {
    [absolutePath: string]: ISourceFile
}

export interface ISourceFile {
    type: 'SourceFile'

    // Name of the source file
    name: string

    // Absolute path to the directory containing source file
    path: string

    // Full path to this file
    fullPath: string

    // The raw source content of this file
    source: string
}

// Map of file path to the parsed file
export interface IParsedFileMap {
    [absolutePath: string]: IParsedFile
}

export interface IParsedFile {
    type: 'ParsedFile'

    // Source file that parses to this AST
    sourceFile: ISourceFile

    // Namespace for this file
    namespace: INamespacePath

    // Map of include names to include path
    includes: IFileIncludes

    // Identifiers exported by this file
    exports: IFileExports

    // AST for source file content
    body: Array<ThriftStatement>

    // Array of errors encountered processing this file
    errors: Array<IThriftError>
}

// Map of namespace path `operation.Operation` to namespace accessor
export interface INamespaceToIncludeMap {
    [rawPath: string]: string
}

// Map of include name to include path
export interface IFileIncludes {
    [includeName: string]: IIncludePath
}

export type DefinitionType =
    | ConstDefinition
    | StructDefinition
    | UnionDefinition
    | ExceptionDefinition
    | EnumDefinition
    | TypedefDefinition
    | ServiceDefinition

// A map of identifier name to the Thrift definition of that identifier
export interface IFileExports {
    [name: string]: DefinitionType
}

export interface IIncludePath {
    type: 'IncludePath'

    // Include path as it literally appears in the source code
    path: string

    // Path to the file importing this include
    importedFrom: string
}

// Interface for our render object
export interface IRenderer {
    renderIndex(state: IRenderState): Array<ts.Statement>

    renderImports(
        files: Array<ThriftStatement>,
        state: IRenderState,
    ): Array<ts.Statement>

    renderConst(
        statement: ConstDefinition,
        state: IRenderState,
    ): Array<ts.Statement>

    renderTypeDef(
        statement: TypedefDefinition,
        state: IRenderState,
    ): Array<ts.Statement>

    renderEnum(
        statement: EnumDefinition,
        state: IRenderState,
    ): Array<ts.Statement>

    renderStruct(
        statement: StructDefinition,
        state: IRenderState,
    ): Array<ts.Statement>

    renderException(
        statement: ExceptionDefinition,
        state: IRenderState,
    ): Array<ts.Statement>

    renderUnion(
        statement: UnionDefinition,
        state: IRenderState,
    ): Array<ts.Statement>

    renderService(
        statement: ServiceDefinition,
        state: IRenderState,
    ): Array<ts.Statement>
}

export interface IResolvedIdentifier {
    rawName: string
    name: string
    baseName: string
    pathName?: string
    fullName: string
}

export interface IGeneratedFile {
    type: 'GeneratedFile'

    // File name
    name: string

    // Path to save file
    path: string

    // Body of file as TS Nodes
    body: Array<ts.Statement>
}
