import { IMakeOptions, INamespace, IParsedFile } from '../types'
import ResolverFile from './file'
import ResolverNamespace from './namespace'

export default class ResolverSchema {
    public namespaces: Map<string, ResolverNamespace> = new Map()
    public files: Map<string, ResolverFile> = new Map()
    public options: IMakeOptions

    constructor(options: IMakeOptions) {
        this.options = options
    }

    public addFile(
        fileName: string,
        parsedFile: IParsedFile,
        namespaceDefinition: INamespace,
    ) {
        if (!this.namespaces.has(namespaceDefinition.name)) {
            this.namespaces.set(
                namespaceDefinition.name,
                new ResolverNamespace(this, namespaceDefinition),
            )
        }

        const namespace = this.namespaces.get(namespaceDefinition.name)!
        const file = new ResolverFile(fileName, parsedFile, this, namespace)

        this.files.set(file.fileName, file)
        namespace.files.set(file.fileName, file)

        return file
    }

    public getFile(fileName: string): ResolverFile {
        const file = this.files.get(fileName)

        if (!file) {
            throw new Error(`Unable to resolve file: ${fileName}`)
        }

        return file
    }
}
