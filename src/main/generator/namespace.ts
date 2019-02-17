import {
    ConstDefinition,
    EnumDefinition,
    ExceptionDefinition,
    ServiceDefinition,
    StructDefinition,
    TypedefDefinition,
    UnionDefinition,
} from '@creditkarma/thrift-parser'
import { dirname, resolve } from 'path'
import * as ts from 'typescript'
import ResolverFile from '../resolver/file'
import ResolverNamespace from '../resolver/namespace'
import { IMakeOptions, IRenderedFile, IRenderer, IStatementMap } from '../types'

export default class NamespaceGenerator {
    public types: IStatementMap = {}
    public renderer: IRenderer
    public namespace: ResolverNamespace
    public options: IMakeOptions
    public outDir: string

    constructor(
        renderer: IRenderer,
        namespace: ResolverNamespace,
        outDir: string,
        options: IMakeOptions,
    ) {
        this.renderer = renderer
        this.namespace = namespace
        this.outDir = outDir
        this.options = options
    }

    public addStatements(
        type: string,
        statements: Array<ts.Statement>,
        file: ResolverFile,
        namespaced: boolean,
    ) {
        this.types[type] = {
            namespaced,
            statements,
            file,
        }
    }
    public renderFileForType(
        typeName: string,
        statements: Array<ts.Statement>,
        file: ResolverFile,
    ): IRenderedFile {
        const path = resolve(dirname(this.namespace.path), `${typeName}.ts`)

        return {
            outPath: path,
            namespace: this.namespace,
            statements: [
                ...this.renderer.renderIncludes(
                    this.namespace,
                    [file],
                    this.options,
                    '__NAMESPACE__',
                ),
                ...statements,
            ],
        }
    }

    public renderFiles(
        filePerType = false,
        omitIncludes = false,
    ): Array<IRenderedFile> {
        const includeStatements = this.renderer.renderIncludes(
            this.namespace,
            [...this.namespace.files.values()],
            this.options,
        )
        const reExports: Array<ts.Statement> = []
        const indexStatements: Array<ts.Statement> = []
        const files: Array<IRenderedFile> = []

        Object.keys(this.types).forEach((typeName: string) => {
            const { namespaced, statements, file } = this.types[typeName]
            if (!filePerType) {
                if (namespaced) {
                    indexStatements.push(
                        ...this.renderer.renderAsNamespace(
                            typeName,
                            statements,
                        ),
                    )
                } else {
                    indexStatements.push(...statements)
                }

                return
            }

            const typeFile = this.renderFileForType(typeName, statements, file)
            files.push(typeFile)
            reExports.push(
                ...this.renderer.renderReExport(
                    typeFile,
                    namespaced ? typeName : null,
                ),
            )
        })

        return [
            {
                outPath: this.namespace.path,
                namespace: this.namespace,
                statements: [
                    ...(omitIncludes ? [] : includeStatements),
                    ...reExports,
                    ...indexStatements,
                ],
            },
            ...files,
        ]
    }

    public renderStatements(): Array<ts.Statement> {
        return this.renderFiles(false, true)[0].statements
    }

    public renderConst(statement: ConstDefinition, file: ResolverFile) {
        this.addStatements(
            statement.name.value,
            this.renderer.renderConst(statement, file),
            file,
            false,
        )
    }

    public renderEnum(statement: EnumDefinition, file: ResolverFile) {
        this.addStatements(
            statement.name.value,
            this.renderer.renderEnum(statement, file),
            file,
            false,
        )
    }

    public renderTypeDef(statement: TypedefDefinition, file: ResolverFile) {
        this.addStatements(
            statement.name.value,
            this.renderer.renderTypeDef(statement, file),
            file,
            false,
        )
    }

    public renderStruct(statement: StructDefinition, file: ResolverFile) {
        this.addStatements(
            statement.name.value,
            this.renderer.renderStruct(statement, file),
            file,
            false,
        )
    }

    public renderUnion(statement: UnionDefinition, file: ResolverFile) {
        this.addStatements(
            statement.name.value,
            this.renderer.renderUnion(statement, file),
            file,
            false,
        )
    }

    public renderException(statement: ExceptionDefinition, file: ResolverFile) {
        this.addStatements(
            statement.name.value,
            this.renderer.renderException(statement, file),
            file,
            false,
        )
    }

    public renderService(statement: ServiceDefinition, file: ResolverFile) {
        this.addStatements(
            statement.name.value,
            this.renderer.renderService(statement, file),
            file,
            true,
        )
    }
}
