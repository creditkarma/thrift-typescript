import * as ts from 'typescript'

import {
  ConstDefinition,
  EnumDefinition,
  ExceptionDefinition,
  ServiceDefinition,
  StructDefinition,
  ThriftDocument,
  ThriftStatement,
  TypedefDefinition,
  UnionDefinition,
} from '@creditkarma/thrift-parser'

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
}

export interface IThriftFile {
  name: string
  path: string
  contents: string
}

export interface IParsedFile {
  name: string
  path: string
  includes: Array<IParsedFile>
  ast: ThriftDocument
}

export interface IRenderedFile {
  sourcePath: string
  outPath: string
  namespace: string
  includes: IIncludeMap
  identifiers: IIdentifierMap
  statements: Array<ts.Statement>
}

export interface IResolvedIdentifier {
  name: string
  path: string
  resolvedName: string
}

export interface IResolvedNamespace {
  scope: string
  name: string
}

export interface IResolvedNamespaceMap {
  [name: string]: IResolvedNamespace
}

export interface IResolvedIncludeMap {
  [name: string]: Array<IResolvedIdentifier>
}

export interface IIncludeData {
  path: string
  base: string
}

export interface IIncludeMap {
  [name: string]: IRenderedFile
}

export interface IResolvedFile {
  namespaces: IResolvedNamespaceMap
  includes: IResolvedIncludeMap
  identifiers: IIdentifierMap
  body: Array<ThriftStatement>
}

export interface IIdentifierType {
  name: string
  resolvedName: string
  definition: ConstDefinition | StructDefinition | UnionDefinition |
              ExceptionDefinition | EnumDefinition | TypedefDefinition |
              ServiceDefinition
}

export interface IIdentifierMap {
  [name: string]: IIdentifierType
}
