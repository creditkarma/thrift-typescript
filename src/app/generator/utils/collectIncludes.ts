import * as path from 'path'

import {
  ThriftDocument,
  ThriftStatement,
  IncludeDefinition,
  SyntaxType
} from '@creditkarma/thrift-parser'

import {
  IIncludeData
} from '../../types'

export function collectIncludes(thrift: ThriftDocument): Array<IIncludeData> {
  const statements: Array<ThriftStatement> = thrift.body.filter((next: ThriftStatement): boolean => {
    return next.type === SyntaxType.IncludeDefinition
  })

  return statements.map((next: IncludeDefinition) => {
    const basename: string = path.posix.basename(next.path.value).replace('.thrift', '')
    return {
      path: next.path.value,
      base: basename,
    }
  })
}
