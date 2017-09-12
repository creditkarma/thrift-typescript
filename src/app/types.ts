import {
  EnumDefinition,
  ExceptionDefinition,
  FieldType,
  StructDefinition,
  ThriftStatement,
  TypedefDefinition,
  UnionDefinition,
} from '@creditkarma/thrift-parser'

export interface IMakeOptions {
  rootDir: string
  outDir: string
  sourceDir: string
  files: Array<string>
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
  definition: StructDefinition | UnionDefinition | ExceptionDefinition | EnumDefinition | TypedefDefinition
}

export interface IIdentifierMap {
  [name: string]: IIdentifierType
}

export interface IRenderedFile {
  sourcePath: string
  outPath: string
  namespace: string
  contents: string
  includes: IIncludeMap
  identifiers: IIdentifierMap
}
