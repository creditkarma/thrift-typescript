import * as path from 'path'
import * as ts from 'typescript'

import {
  ConstDefinition,
  SyntaxType,
  ThriftStatement,
  TypedefDefinition,
} from '@creditkarma/thrift-parser'

import {
  IRenderedFile,
  IRenderedFileMap,
  IResolvedFile,
  IResolvedIdentifier,
  IResolvedIncludeMap,
} from '../../types'

function constUsesThrift(statement: ConstDefinition): boolean {
  return statement.fieldType.type === SyntaxType.I64Keyword
}

function typedefUsesThrift(statement: TypedefDefinition): boolean {
  return statement.definitionType.type === SyntaxType.I64Keyword
}

function statementUsesThrift(statement: ThriftStatement): boolean {
  switch (statement.type) {
    case SyntaxType.StructDefinition:
    case SyntaxType.UnionDefinition:
    case SyntaxType.ExceptionDefinition:
    case SyntaxType.ServiceDefinition:
      return true

    case SyntaxType.NamespaceDefinition:
    case SyntaxType.IncludeDefinition:
    case SyntaxType.CppIncludeDefinition:
    case SyntaxType.EnumDefinition:
      return false

    case SyntaxType.ConstDefinition:
      return constUsesThrift(statement)

    case SyntaxType.TypedefDefinition:
      return typedefUsesThrift(statement)

    default:
      const msg: never = statement
      throw new Error(`Non-exhaustive match for ${msg}`)
  }
}

export function fileUsesThrift(resolvedFile: IResolvedFile): boolean {
  for (const statement of resolvedFile.body) {
    if (statementUsesThrift(statement)) {
      return true
    }
  }

  return false
}

/**
 * import { Thrift, TProtocol, TTransport, Int64 } from 'thrift';
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
      ts.createNamespaceImport(ts.createIdentifier('thrift')),
    ),
    ts.createLiteral('@creditkarma/thrift-server-core'),
  )
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
  currentPath: string,
  includes: IRenderedFileMap,
  resolved: IResolvedIncludeMap,
): Array<ts.ImportDeclaration> {
  const imports: Array<ts.ImportDeclaration> = []
  for (const name of Object.keys(resolved)) {
    const resolvedIncludes: Array<IResolvedIdentifier> = resolved[name].identifiers
    const includeFile: IRenderedFile = includes[name]

    if (resolvedIncludes != null && includeFile != null) {
      imports.push(ts.createImportDeclaration(
        undefined,
        undefined,
        ts.createImportClause(
          undefined,
          ts.createNamedImports(
            resolvedIncludes.map((next: IResolvedIdentifier) => {
              return ts.createImportSpecifier(
                ts.createIdentifier(next.name),
                ts.createIdentifier(next.resolvedName),
              )
            }),
          ),
        ),
        ts.createLiteral(
          `./${path.join(
            path.relative(
              path.dirname(currentPath),
              path.dirname(includeFile.outPath),
            ),
            path.basename(includeFile.outPath, '.ts'),
          )}`,
        ),
      ))
    }
  }
  return imports
}
