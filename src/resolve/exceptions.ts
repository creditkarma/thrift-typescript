import {
  createIdentifier,
  createPropertyAccess,
  createHeritageClause,
  createExpressionWithTypeArguments,
  createClassExpression,
  createStatement,

  createCall,
  createSuper,
  createLiteral,
  createProperty,
  createKeywordTypeNode,

  SyntaxKind,

  ExpressionStatement
} from 'typescript';

import { resolveTypeNode } from './typedefs';
import { StructNode, StructPropertyNode } from './structs';

import { identifiers as _id } from '../ast/identifiers';
import { tokens } from '../ast/tokens';
import collect from '../collect';
import { createConstructor, createRead, createWrite } from '../create';

// TypeScript has this as an internal method so implement a custom version
import { updateBlock, setTextRange, createNodeArray } from 'typescript';
function insertLeadingStatements(dest, sources: any[]) {
  return updateBlock(dest, setTextRange(createNodeArray(sources.concat(dest.statements)), dest.statements));
}

export class ExceptionNode extends StructNode {
  // TODO: Maybe this should have "extends" property

  public toAST(): ExpressionStatement {
    // TODO: a bit hacky to use the same code as Structs
    const _name = createLiteral(this.name);
    const _nameField = createProperty(undefined, [tokens.public], 'name', undefined, createKeywordTypeNode(SyntaxKind.StringKeyword), _name);
    const _superCall = createCall(createSuper(), undefined, [_name]);

    const fields = this.fields.map((field) => field.toAST());

    const hasFields = (this.fields.filter((field) => field.id).length > 0);

    // Build the constructor body
    const ctor = createConstructor(this);
    ctor.body = insertLeadingStatements(ctor.body, [_superCall]);

    // Build the `read` method
    const read = createRead(this.fields);

    // Build the `write` method
    const write = createWrite(this);

    const _heritage = [];
    // Extends must precede implements
    const _extends = createHeritageClause(SyntaxKind.ExtendsKeyword, [
      createExpressionWithTypeArguments(undefined, createPropertyAccess(_id.Thrift, 'TException'))
    ]);
    _heritage.push(_extends);
    // TODO: This is a pretty hacky solution
    if (hasFields) {
      const _implements = createHeritageClause(SyntaxKind.ImplementsKeyword, [
        createExpressionWithTypeArguments(undefined, createIdentifier(this.implements))
      ]);
      _heritage.push(_implements);
    }

    const _classExpression = createClassExpression([tokens.export], this.name, [], _heritage, [
      _nameField,
      ...fields,
      ctor,
      read,
      write
    ]);

    const _classStatement = createStatement(_classExpression);

    return _classStatement;
  }
}

export function resolveExceptions(idl) {
  const exceptions = collect(idl.exception);

  return exceptions.map((exception) => {
    const { name } = exception;

    const fields = exception.fields.map((field: { id?: number, name: string, type: string, option?: string, defaultValue?: any }) => {
        return new StructPropertyNode({
          id: field.id,
          name: field.name,
          type: resolveTypeNode(idl, field.type),
          option: field.option,
          defaultValue: field.defaultValue
        });
      });

    return new ExceptionNode({
      name: name,
      // TODO: this should be a lookup somehow
      implements: `${name}Interface`,
      fields: fields
    });
  });
}