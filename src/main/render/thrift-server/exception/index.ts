import * as ts from 'typescript'

import { ExceptionDefinition } from '@creditkarma/thrift-parser'

import ResolverFile from '../../../resolver/file'
import { renderStruct } from '../struct'

export function renderException(
    node: ExceptionDefinition,
    file: ResolverFile,
): Array<ts.Statement> {
    return renderStruct(node, file)
}
