import * as ts from 'typescript'

export default function renderAsNamespace(
    name: string,
    statements: Array<ts.Statement>,
): Array<ts.Statement> {
    return [
        ts.createModuleDeclaration(
            undefined,
            [ts.createToken(ts.SyntaxKind.ExportKeyword)],
            ts.createIdentifier(name),
            ts.createModuleBlock(statements),
            ts.NodeFlags.Namespace,
        ),
    ]
}
