import { basename, dirname, relative, resolve } from 'path'
import * as ts from 'typescript'
import { IRenderedFile } from '../../types'

export default function renderReExport(
    file: IRenderedFile,
    exportName: string | null,
): Array<ts.Statement> {
    const importPath = relative(
        dirname(file.namespace.path),
        resolve(dirname(file.outPath), basename(file.outPath, '.ts')),
    )

    const relativeImportPath = importPath.startsWith('.')
        ? importPath
        : `./${importPath}`

    if (!exportName) {
        return [
            ts.createExportDeclaration(
                [],
                [],
                undefined,
                ts.createLiteral(relativeImportPath),
            ),
        ]
    }

    const importStatement = ts.createImportDeclaration(
        undefined,
        undefined,
        ts.createImportClause(
            undefined,
            ts.createNamespaceImport(ts.createIdentifier(exportName)),
        ),
        ts.createLiteral(relativeImportPath),
    )

    const exportStatement = ts.createExportDeclaration(
        [],
        [],
        ts.createNamedExports([
            ts.createExportSpecifier(exportName, exportName),
        ]),
    )

    return [importStatement, exportStatement]
}
