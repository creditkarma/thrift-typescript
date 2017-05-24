import { createToken, Token, SyntaxKind } from 'typescript';

export interface Tokens {
  question: Token<SyntaxKind.QuestionToken>,
  public: Token<SyntaxKind.PublicKeyword>,
  export: Token<SyntaxKind.ExportKeyword>
};

export const tokens: Tokens = {
  question: createToken(SyntaxKind.QuestionToken),
  public: createToken(SyntaxKind.PublicKeyword),
  export: createToken(SyntaxKind.ExportKeyword)
};