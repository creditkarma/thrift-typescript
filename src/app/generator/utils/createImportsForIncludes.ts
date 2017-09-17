import * as ts from 'typescript'
import * as path from 'path'

import {
  IIncludeMap,
  IResolvedIncludeMap,
  IResolvedIdentifier,
  IRenderedFile
} from '../../types'

/**
 * Given a hash of included files this will return a list of import statements.
 *
 * @param currentPath The path of the file performing imports. Import paths are
 *                    resolved relative to this.
 * @param includes A hash of all included files
 * @param resolved A hash of include name to a list of ids used from this include
 */
export function createImportsForIncludes(
  currentPath: string,
  includes: IIncludeMap,
  resolved: IResolvedIncludeMap,
): Array<ts.ImportDeclaration> {
  const imports: Array<ts.ImportDeclaration> = []
  for (const name of Object.keys(resolved)) {
    const resolvedIncludes: Array<IResolvedIdentifier> = resolved[name]
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