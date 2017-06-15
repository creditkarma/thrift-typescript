export default class InvalidValueNode {
  public value: any

  constructor(value) {
    this.value = value
  }

  public toAST() {
    throw new Error(`Invalid value: ${this.value}`)
  }
}
