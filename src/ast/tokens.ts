import { createToken, SyntaxKind, Token } from 'typescript'

export interface ITokens {
  question: Token<SyntaxKind.QuestionToken>,
  public: Token<SyntaxKind.PublicKeyword>,
  export: Token<SyntaxKind.ExportKeyword>
}

export const tokens: ITokens = {
  export: createToken(SyntaxKind.ExportKeyword),
  public: createToken(SyntaxKind.PublicKeyword),
  question: createToken(SyntaxKind.QuestionToken),
}
