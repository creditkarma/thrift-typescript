import {
  createIdentifier,
  createNew,
  createObjectLiteral,
  createPropertyAssignment,
  NewExpression,
} from 'typescript'

export default class StructValueNode {
  public name: string
  public values: any[]

  constructor(args) {
    this.name = args.name
    this.values = args.values
  }

  public toAST(): NewExpression {
    const id = createIdentifier(this.name)
    const values = this.values.map((val) => {
      return createPropertyAssignment(val.key, val.value.toAST())
    })
    return createNew(id, undefined, [createObjectLiteral(values)])
  }
}
