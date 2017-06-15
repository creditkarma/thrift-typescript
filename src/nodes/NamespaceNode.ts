import {
  createIdentifier,
  Identifier,
} from 'typescript'

export default class NamespaceNode {
  // TODO: handle other namespaces
  // public scope: string;
  public name: string

  constructor(name) {
    this.name = name
  }

  public toAST(): Identifier {
    return createIdentifier(this.name)
  }
}
