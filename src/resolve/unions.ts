import { StructNode, StructPropertyNode } from './structs'
import { resolveTypeNode } from './typedefs'

import collect from '../collect'

export class UnionPropertyNode extends StructPropertyNode {

  constructor(args) {
    super(args)
    // Forced to "optional"
    // TODO: should we warn here?
    this.option = 'optional'
  }
}

// tslint:disable-next-line:max-classes-per-file
export class UnionNode extends StructNode {
  public fields: UnionPropertyNode[]

  // TODO: validate single default
}

export function resolveUnions(idl: JsonAST) {
  const unions = collect(idl.union)

  return unions.map((union) => {
    const { name } = union

    const fields = union.fields.map((field) => {
      return new UnionPropertyNode({
        defaultValue: field.defaultValue,
        id: field.id,
        name: field.name,
        option: field.option,
        type: resolveTypeNode(idl, field.type),
      })
    })

    return new UnionNode({
      fields,
      // TODO: this should be a lookup somehow
      implements: `${name}Interface`,
      name,
    })
  })
}
