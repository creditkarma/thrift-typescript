import { SyntaxType, ThriftStatement } from '@creditkarma/thrift-parser'

import { IFileExports } from '../types'

// Give some thrift statements this generates a map of the name of those statements to the
// definition of that statement
export function exportsForFile(fileBody: Array<ThriftStatement>): IFileExports {
    return fileBody.reduce((acc: IFileExports, next: ThriftStatement) => {
        switch (next.type) {
            case SyntaxType.TypedefDefinition:
            case SyntaxType.ConstDefinition:
            case SyntaxType.EnumDefinition:
            case SyntaxType.UnionDefinition:
            case SyntaxType.ExceptionDefinition:
            case SyntaxType.StructDefinition:
            case SyntaxType.ServiceDefinition:
                acc[next.name.value] = next
                break

            default:
                // Ignore
                break
        }

        return acc
    }, {})
}
