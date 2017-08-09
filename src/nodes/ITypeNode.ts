import * as ts from 'typescript'

export default interface ITypeNode {
  toEnum(): string
  toAST(): ts.TypeNode
}
