import { TypeNode } from 'typescript'

export interface ITypeNode {
  toEnum(): string
  toAST(): TypeNode
}
