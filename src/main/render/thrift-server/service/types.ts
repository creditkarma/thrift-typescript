import * as ts from 'typescript'

import {
  COMMON_IDENTIFIERS
} from '../identifiers'

export const TProtocolType: ts.TypeNode = ts.createTypeReferenceNode(COMMON_IDENTIFIERS.TProtocol, undefined)

export const ContextType: ts.TypeNode = ts.createTypeReferenceNode('Context', undefined)
