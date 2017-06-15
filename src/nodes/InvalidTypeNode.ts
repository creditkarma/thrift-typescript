export default class InvalidTypeNode {
  public name: string

  constructor(name) {
    this.name = name
  }

  public toEnum(): void {
    throw new Error(`Unable to find typedef: ${this.name}`)
  }

  public toAST(): void {
    throw new Error(`Unable to find typedef: ${this.name}`)
  }
}
