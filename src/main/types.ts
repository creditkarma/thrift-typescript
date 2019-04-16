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
    [resolvedName: string]: INamespacePath
}

export interface INamespacePath {
    type: 'NamespacePath'

    // Scope is the language this namespace belongs to 'js', 'java'...
    scope: string

    // The name of the namespace com.company.package
    name: string

    // The name translated to its result path com/company/package
    path: string
}

// Namespace path to namespace
export interface INamespaceMap {
    [path: string]: INamespace
}

export interface INamespace {
    type: 'Namespace'

    namespace: INamespacePath

    // Files declared as part of this namespace
    files: ResolvedFileMap

    // Identifiers defined in this namespace
    exports: IFileExports

    // Map of namespaces used by this file
    includedNamespaces: INamespacePathMap

    // Data/services defined in this namespace
    constants: Array<ConstDefinition | EnumDefinition>
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
    [filePath: string]: ISourceFile
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
export interface IProcessedFileMap<FileType> {
    [filePath: string]: FileType
}

export type ParsedFileMap = IProcessedFileMap<IParsedFile>
export type ResolvedFileMap = IProcessedFileMap<IResolvedFile>

export interface IProcessedFile {
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

export interface IParsedFile extends IProcessedFile {
    type: 'ParsedFile'
}

export interface IResolvedFile extends IProcessedFile {
    type: 'ResolvedFile'

    // Map of namespaces used by this file
    includedNamespaces: INamespacePathMap

    // Map of namespace id to include path
    namespaceToInclude: INamespaceToIncludeMap
}

// Map of resolved namespace identifier to include
export interface INamespaceToIncludeMap {
    [name: string]: string
}

// Map of include name to include path
export interface IFileIncludes {
    [name: string]: IIncludePath
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

// The Thrift file path to the resolved namespace for that file's
// generated TypeScript.
export interface IFileToNamespaceMap {
    [filePath: string]: INamespacePath
}

// Map of an include's name in a specific file to the namespace that
// include resolves to.
export interface IIncludeToNamespaceMap {
    [includeName: string]: INamespacePath
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

    name: string

    path: string

    body: Array<ts.Statement>
}
