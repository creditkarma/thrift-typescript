import * as ts from 'typescript'

import { COMMON_IDENTIFIERS } from '../shared/identifiers'

/**
 * import Int64 = require('node-int64');
 *
 * Creates an import for Int64 type if it is being used by the file we're
 * generating. We'll need to keep track of what each files uses.
 */
export function renderInt64Import(): ts.ImportEqualsDeclaration {
    return ts.createImportEqualsDeclaration(
        undefined,
        undefined,
        COMMON_IDENTIFIERS.Node_Int64,
        ts.createExternalModuleReference(ts.createLiteral('node-int64')),
    )
}
