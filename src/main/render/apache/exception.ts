import * as ts from 'typescript'

import { ExceptionDefinition } from '@creditkarma/thrift-parser'

import { IIdentifierMap } from '../../types'

import { renderStruct } from './struct'

export function renderException(
    node: ExceptionDefinition,
    identifiers: IIdentifierMap,
): ts.ClassDeclaration {
    return renderStruct(node, identifiers)
}
