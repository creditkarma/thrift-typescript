
import { resolveTypeNode } from './typedefs';
import { StructNode, StructPropertyNode } from './structs';

import collect from '../collect';

export class UnionPropertyNode extends StructPropertyNode {

  constructor(args) {
    super(args);
    // Forced to "optional"
    // TODO: should we warn here?
    this.option = 'optional';
  }
}

export class UnionNode extends StructNode {
  public fields: UnionPropertyNode[];

  // TODO: validate single default
}

export function resolveUnions(idl) {
  const unions = collect(idl.union);

  return unions.map((union) => {
    const { name } = union;

    const fields = union.fields.map((field: { id?: number, name: string, type: string, option?: string, defaultValue?: any }) => {
      return new UnionPropertyNode({
        id: field.id,
        name: field.name,
        type: resolveTypeNode(idl, field.type),
        option: field.option,
        defaultValue: field.defaultValue
      });
    });

    return new UnionNode({
      name: name,
      // TODO: this should be a lookup somehow
      implements: `${name}Interface`,
      fields: fields
    });
  });
}