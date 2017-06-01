import {
  createTypeAliasDeclaration,
  createKeywordTypeNode,
  createTypeReferenceNode,
  createArrayTypeNode,

  SyntaxKind,

  TypeAliasDeclaration,
  KeywordTypeNode,
  TypeReferenceNode,
  ArrayTypeNode
} from 'typescript';


import { getTypeDefs } from '../get';
import { tokens as _tokens } from '../ast/tokens';

export class Typedefs {
  public entries: TypeNode[];

  constructor(entries) {
    this.entries = entries;
  }

  public toAST(): TypeAliasDeclaration[] {
    return this.entries.map((typedef) => {
      return createTypeAliasDeclaration(undefined, [_tokens.export], typedef.name, undefined, typedef.toAST());
    });
  }
}

export class BaseTypeNode {
  public name: string;

  constructor(name) {
    this.name = name;
  }

  public toAST(): KeywordTypeNode | TypeReferenceNode {
    switch(this.name.toUpperCase()) {
      case 'BOOL':
        return createKeywordTypeNode(SyntaxKind.BooleanKeyword);
      case 'BYTE': // TODO: is this a number type?
      case 'I08': // TODO: is this a number type?
      case 'DOUBLE':
      case 'I16':
      case 'I32':
      case 'I64':
        return createKeywordTypeNode(SyntaxKind.NumberKeyword);
      case 'STRING':
      case 'UTF7':
      case 'UTF8':
      case 'UTF16':
        return createKeywordTypeNode(SyntaxKind.StringKeyword);
      case 'VOID': // TODO: does this need a type?
        throw new Error('Not Implemented');
      // case 'STRUCT': // TODO: this is handed down as a custom type, is it needed?
      //   return ts.createTypeReferenceNode(this.name, undefined);
      default:
        return createTypeReferenceNode(this.name, undefined);
    }
  }
}

export class TypeNode {
  public name: string;
  public keyType?: BaseTypeNode | TypeNode;
  public valueType: BaseTypeNode | TypeNode;

  constructor(args) {
    this.name = args.name;
    this.keyType = args.keyType;
    this.valueType = args.valueType;
  }

  public toAST(): TypeReferenceNode | ArrayTypeNode | KeywordTypeNode {
    switch(this.name.toUpperCase()) {
      // case 'STRUCT': {
        // TODO: this is handed down as a custom type, is it needed?
        // return createTypeReferenceNode(this.valueType.toAST(), undefined);
      // }
      case 'MAP': {
        // TODO: _id.Map
        return createTypeReferenceNode('Map', [this.keyType.toAST(), this.valueType.toAST()]);
      }
      case 'LIST': {
        return createArrayTypeNode(this.valueType.toAST());
      }
      case 'SET': {
        // TODO: _id.Set
        return createTypeReferenceNode('Set', [this.valueType.toAST()]);
      }
      default:
        return this.valueType.toAST();
    }
  }
}

export class InvalidTypeNode {
  public name: string;

  constructor(name) {
    this.name = name;
  }

  toAST() {
    throw new Error(`Unable to find typedef: ${this.name}`);
  }
}

function isBaseType(type: string) {
  const baseTypes = ['bool', 'byte', 'i8', 'i16', 'i32', 'i64', 'double', 'string', 'binary', 'slist'];

  // Why doesn't typescript define .includes?
  return (baseTypes.indexOf(type) !== -1);
}

function isContainerType(type: string) {
  const containerTypes = ['map', 'set', 'list'];

  return (containerTypes.indexOf(type) !== -1);
}

function resolveTypeNode(idl, type) {
  if (isBaseType(type)) {
    return new BaseTypeNode(type);
  }

  if (isContainerType(type.name)) {
    return new TypeNode({
      name: type.name,
      keyType: resolveTypeNode(idl, type.keyType),
      valueType: resolveTypeNode(idl, type.valueType),
    });
  }

  if (idl.typedef[type]) {
    return new TypeNode({
      name: type,
      valueType: resolveTypeNode(idl, idl.typedef[type].type)
    });
  }

  if (idl.struct[type]) {
    return new TypeNode({
      name: 'struct',
      valueType: new BaseTypeNode(type)
    });
  }

  // TODO: does validation belong in here?
  return new InvalidTypeNode(type);
}


export function resolveTypes(idl) {
  const typedefs = getTypeDefs(idl);

  const entries = typedefs.map((typedef) => {
    const { name, type } = typedef;

    const entry = new TypeNode({
      name: name,
      valueType: resolveTypeNode(idl, type)
    });

    return entry;
  });

  return new Typedefs(entries);
}
