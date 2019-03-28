import { INamespace } from '../types'
import ResolverFile from './file'
import ResolverSchema from './schema'

export default class ResolverNamespace {
    public schema: ResolverSchema
    public files: Map<string, ResolverFile> = new Map()
    public scope: string
    public path: string
    public name: string

    constructor(schema: ResolverSchema, namespace: INamespace) {
        this.scope = namespace.scope
        this.path = namespace.path
        this.name = namespace.name
        this.schema = schema
    }
}
