import { resolveNamespace } from './resolveNamespace'

import {
    exportsForFile,
    identifiersForStatements,
    resolveConstValue,
    resolveIdentifierDefinition,
    resolveIdentifierName,
} from './utils'

export const Resolver = {
    resolveNamespace,
    exportsForFile,
    resolveIdentifierDefinition,
    resolveConstValue,
    resolveIdentifierName,
    identifiersForStatements,
}
