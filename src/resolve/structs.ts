import {
  createLiteral,
  createNull,
  createProperty,

  createHeritageClause,
  createExpressionWithTypeArguments,
  createIdentifier,
  createClassExpression,
  createStatement,

  SyntaxKind,

  PropertyDeclaration,
  ExpressionStatement
} from 'typescript';

import {
  TypeNode,
  resolveTypeNode
} from './typedefs';

import {
  toOptional
} from '../ast-helpers';

import {
  tokens
} from '../ast/tokens';

import {
  getStructs
} from '../get';

import {
  createConstructor,
  createRead,
  createWrite
} from '../create';


export class StructPropertyNode {
  public id?: number;
  public name: string;
  public type: TypeNode;
  public option?: string;
  public defaultValue?: any; // TODO: better type?

  constructor(args) {
    this.id = args.id;
    this.name = args.name;
    this.type = args.type;
    this.option = args.option;
    this.defaultValue = args.defaultValue;
  }

  public toAST(): PropertyDeclaration {

    let _optional = toOptional(this.option);

    let _default;
    if (this.defaultValue != null) {
      _default = createLiteral(this.defaultValue);
    } else {
      _default = createNull();
    }

    return createProperty(undefined, [tokens.public], this.name, _optional, this.type.toAST(), _default);
  }
}

export class StructNode {
  public name: string;
  public implements: string;
  public fields: StructPropertyNode[];

  constructor(args) {
    this.name = args.name;
    this.implements = args.implements;
    this.fields = args.fields;
  }

  public toAST(): ExpressionStatement {
    const fields = this.fields.map((field) => field.toAST());

    const hasFields = (this.fields.filter((field) => field.id).length > 0);

    // Build the constructor body
    const ctor = createConstructor(this);

    // Build the `read` method
    const read = createRead(this);

    // Build the `write` method
    const write = createWrite(this);

    const _heritage = [];
    // TODO: This is a pretty hacky solution
    if (hasFields) {
      const _implements = createHeritageClause(SyntaxKind.ImplementsKeyword, [
        createExpressionWithTypeArguments(undefined, createIdentifier(this.implements))
      ]);
      _heritage.push(_implements);
    }

    const _classExpression = createClassExpression([tokens.export], this.name, [], _heritage, [
      ...fields,
      ctor,
      read,
      write
    ]);

    const _classStatement = createStatement(_classExpression);

    return _classStatement;
  }
}

export function resolveStructs(idl) {
  const structs = getStructs(idl);

  return structs.map((struct) => {
    const { name } = struct;

    const fields = struct.fields.map((field: { id?: number, name: string, type: string, option?: string, defaultValue?: any }) => {
      return new StructPropertyNode({
        id: field.id,
        name: field.name,
        type: resolveTypeNode(idl, field.type),
        option: field.option,
        defaultValue: field.defaultValue
      });
    });

    return new StructNode({
      name: name,
      // TODO: this should be a lookup somehow
      implements: `${name}Interface`,
      fields: fields
    });
  });
}