import { basename, extname } from 'path';

import { createIdentifier, Identifier } from 'typescript';

export class NamespaceNode {
  // TODO: handle other namespaces
  // public scope: string;
  public name: string;

  constructor(name) {
    this.name = name;
  }

  public toAST(): Identifier {
    return createIdentifier(this.name);
  }
}

// TODO: IDL has filename attached
export function resolveNamespace(idl: JsonAST, filename: string) {
  // TODO: the parser doesn't parse dot-separated namespaces
  const scope = 'js';

  if (idl.namespace && idl.namespace[scope]) {
    const namespace = idl.namespace[scope].serviceName;
    return new NamespaceNode(namespace);
  } else {
    let namespace = basename(filename, extname(filename));
    return new NamespaceNode(namespace);
  }
}