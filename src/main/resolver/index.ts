// export { resolveFile } from './resolveFile'
import {
    exportsForFile,
    identifiersForStatements,
    resolveConstValue,
    resolveIdentifierDefinition,
    resolveIdentifierName,
} from './utils'

export const Resolver = {
    exportsForFile,
    resolveIdentifierDefinition,
    resolveConstValue,
    resolveIdentifierName,
    identifiersForStatements,
}
