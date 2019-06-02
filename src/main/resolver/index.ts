import { exportsForFile } from './exportsForFile'
import { identifiersForStatements } from './identifiersForStatements'
import { includesForFile } from './includesForFile'
import { namespaceForFile } from './namespaceForFile'
import { namespaceForInclude } from './namespaceForInclude'
import { organizeByNamespace } from './organizeByNamespace'
import { resolveConstValue } from './resolveConstValue'
import { resolveIdentifierDefinition } from './resolveIdentifierDefinition'
import { resolveIdentifierName } from './resolveIdentifierName'
import { resolveNamespace } from './resolveNamespace'

export const Resolver = {
    exportsForFile,
    identifiersForStatements,
    includesForFile,
    namespaceForFile,
    namespaceForInclude,
    organizeByNamespace,
    resolveConstValue,
    resolveIdentifierName,
    resolveIdentifierDefinition,
    resolveNamespace,
}
