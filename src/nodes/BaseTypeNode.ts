import {
  createKeywordTypeNode,
  KeywordTypeNode,
  SyntaxKind,
} from 'typescript'

export default class BaseTypeNode {
  public name: string

  constructor(name) {
    this.name = name
  }

  public toEnum(): string {
    return this.name.toUpperCase()
  }

  public toAST(): KeywordTypeNode {
    switch (this.toEnum()) {
      case 'BOOL':
        return createKeywordTypeNode(SyntaxKind.BooleanKeyword)
      case 'BYTE': // TODO: is this a number type?
      case 'I8': // TODO: is this a number type?
      case 'DOUBLE':
      case 'I16':
      case 'I32':
      case 'I64':
        return createKeywordTypeNode(SyntaxKind.NumberKeyword)
      case 'STRING':
      case 'UTF7':
      case 'UTF8':
      case 'UTF16':
        return createKeywordTypeNode(SyntaxKind.StringKeyword)
      case 'VOID': // TODO: does this need a type?
        throw new Error(`Not Implemented. Type ${this.toEnum()}`)
      default:
        throw new Error(`How did you get here? Type: ${this.toEnum()}`)
    }
  }
}
