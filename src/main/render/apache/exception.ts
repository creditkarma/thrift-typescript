import * as ts from 'typescript'

import { ExceptionDefinition } from '@creditkarma/thrift-parser'

import { IRenderState } from '../../types'
import { renderStruct } from './struct'

export function renderException(
    node: ExceptionDefinition,
    state: IRenderState,
): ts.ClassDeclaration {
    return renderStruct(node, state)
}
