import * as ts from 'typescript'

import {
    ExceptionDefinition,
    ServiceDefinition,
    StructDefinition,
    ThriftStatement,
    UnionDefinition,
} from '@creditkarma/thrift-parser'

import { rendererForTarget } from '../render'
import { processStatements, renderStatement } from './iterator'

import { exportsForFile } from '../resolver'
import {
    IGeneratedFile,
    INamespace,
    IRenderer,
    IRenderState,
    IThriftProject,
} from '../types'

/**
 * Export this directly is useful for generating code without generating files
 */
export { processStatements } from './iterator'

/**
 * The generator is the primary interface for generating TypeScript code from
 * Thrift IDL. It takes a hash of options that inform it on how to resolve files
 * and where to save generated code.
 *
 * When a Thrift file includes another Thrift file the first place we search for
 * the include is local to the including file. If no matching file is found we
 * search relative to the sourceDir defined in the options.
 *
 * @param options
 */
export function generateFile(
    renderer: IRenderer,
    statements: Array<ThriftStatement>,
    state: IRenderState,
): Array<ts.Statement> {
    return processStatements(statements, state, renderer)
}

function generateFileFromStatements(
    statements: Array<
        | ServiceDefinition
        | ExceptionDefinition
        | UnionDefinition
        | StructDefinition
    >,
    namespace: INamespace,
    thriftProject: IThriftProject,
    renderer: IRenderer,
): Array<IGeneratedFile> {
    const result: Array<IGeneratedFile> = []

    statements.forEach(
        (
            statement:
                | ServiceDefinition
                | ExceptionDefinition
                | UnionDefinition
                | StructDefinition,
        ) => {
            const state: IRenderState = {
                options: thriftProject.options,
                currentNamespace: namespace,
                currentDefinitions: exportsForFile([statement]),
                project: thriftProject,
            }

            const structFile: IGeneratedFile = {
                type: 'GeneratedFile',
                name: statement.name.value,
                path: namespace.namespace.path,
                body: renderStatement(statement, state, renderer),
            }

            structFile.body = [
                ...renderer.renderImports([statement], state),
                ...structFile.body,
            ]

            result.push(structFile)
        },
    )

    return result
}

function generateFilesFromKey(
    key: 'constants' | 'typedefs',
    namespace: INamespace,
    thriftProject: IThriftProject,
    renderer: IRenderer,
): Array<IGeneratedFile> {
    const result: Array<IGeneratedFile> = []
    const statements: Array<ThriftStatement> = namespace[key]

    if (statements.length > 0) {
        const constantsFile: IGeneratedFile = {
            type: 'GeneratedFile',
            name: key,
            path: namespace.namespace.path,
            body: [],
        }

        const state: IRenderState = {
            options: thriftProject.options,
            currentNamespace: namespace,
            currentDefinitions: exportsForFile(statements),
            project: thriftProject,
        }

        statements.forEach((statement: ThriftStatement) => {
            constantsFile.body = [
                ...constantsFile.body,
                ...renderStatement(statement, state, renderer),
            ]
        })

        constantsFile.body = [
            ...renderer.renderImports(statements, state),
            ...constantsFile.body,
        ]

        result.push(constantsFile)
    }

    return result
}

export function generateProject(
    thriftProject: IThriftProject,
): Array<IGeneratedFile> {
    let result: Array<IGeneratedFile> = []
    const renderer: IRenderer = rendererForTarget(thriftProject.options.target)

    Object.keys(thriftProject.namespaces).forEach((namespaceName: string) => {
        const namespace: INamespace = thriftProject.namespaces[namespaceName]

        // Generate content for this namespace
        result = result.concat(
            generateFilesFromKey(
                'constants',
                namespace,
                thriftProject,
                renderer,
            ),
            generateFilesFromKey(
                'typedefs',
                namespace,
                thriftProject,
                renderer,
            ),
            generateFileFromStatements(
                [
                    ...namespace.structs,
                    ...namespace.unions,
                    ...namespace.exceptions,
                ],
                namespace,
                thriftProject,
                renderer,
            ),
            generateFileFromStatements(
                namespace.services,
                namespace,
                thriftProject,
                renderer,
            ),
        )

        // Index file for this namespace
        result.push({
            type: 'GeneratedFile',
            name: 'index',
            path: namespace.namespace.path,
            body: renderer.renderIndex({
                options: thriftProject.options,
                currentNamespace: namespace,
                currentDefinitions: {},
                project: thriftProject,
            }),
        })
    })

    return result
}
