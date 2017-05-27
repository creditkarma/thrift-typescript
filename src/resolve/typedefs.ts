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

export type TypeNode = BaseTypeNode | ComplexTypeNode;

export class TypedefNode {
  public name: string;
  public type: TypeNode;

  constructor(args) {
    this.name = args.name;
    this.type = args.type;
  }

  public toAST(): TypeAliasDeclaration {
    return createTypeAliasDeclaration(undefined, [_tokens.export], this.name, undefined, this.type.toAST());
  }
}

export class BaseTypeNode {
  public name: string;

  constructor(name) {
    this.name = name;
  }

  public toEnum(): string {
    return this.name.toUpperCase();
  }

  public toAST(): KeywordTypeNode | TypeReferenceNode {
    switch(this.toEnum()) {
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

export class ComplexTypeNode {
  public name: string;
  public keyType?: BaseTypeNode | ComplexTypeNode;
  public valueType: BaseTypeNode | ComplexTypeNode;

  constructor(args) {
    this.name = args.name;
    this.valueType = args.valueType;
    if (args.keyType) {
      this.keyType = args.keyType;
    }
  }

  public toEnum(): string {
    const enumName = this.name.toUpperCase();
    switch(enumName) {
      case 'MAP': {
        return enumName;
      }
      case 'LIST': {
        return enumName;
      }
      case 'SET': {
        return enumName;
      }
      case 'STRUCT': {
        return enumName;
      }
      default:
        return this.valueType.toEnum();
    }
  }

  public toAST(): TypeReferenceNode | ArrayTypeNode | KeywordTypeNode {
    switch(this.toEnum()) {
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

  public toEnum(): void {
    throw new Error(`Unable to find typedef: ${this.name}`);
  }

  public toAST(): void {
    throw new Error(`Unable to find typedef: ${this.name}`);
  }
}

function isBaseType(type: string) {
  const baseTypes = ['bool', 'byte', 'i8', 'i16', 'i32', 'i64', 'double', 'string', 'binary', 'slist'];

  // Why doesn't typescript define .includes?
  return (baseTypes.indexOf(type) !== -1);
}

function isListLikeType(type: string | { name: string }) {
  if (typeof type !== 'object') {
    return false;
  }

  const containerTypes = ['set', 'list'];

  return (containerTypes.indexOf(type.name) !== -1);
}

function isMapLikeType(type: string | { name: string }) {
  if (typeof type !== 'object') {
    return false;
  }

  const containerTypes = ['map'];

  return (containerTypes.indexOf(type.name) !== -1);
}

export function resolveTypeNode(idl, type) {
  if (isBaseType(type)) {
    return new BaseTypeNode(type);
  }

  if (isMapLikeType(type)) {
    // TODO: MapTypeNode?
    return new ComplexTypeNode({
      name: type.name,
      keyType: resolveTypeNode(idl, type.keyType),
      valueType: resolveTypeNode(idl, type.valueType),
    });
  }

  if (isListLikeType(type)) {
    // TODO: ListTypeNode?
    return new ComplexTypeNode({
      name: type.name,
      valueType: resolveTypeNode(idl, type.valueType),
    });
  }

  if (idl.typedef[type]) {
    return new ComplexTypeNode({
      name: type,
      valueType: resolveTypeNode(idl, idl.typedef[type].type)
    });
  }

  if (idl.struct[type]) {
    return new ComplexTypeNode({
      name: 'struct',
      valueType: new BaseTypeNode(type)
    });
  }

  // TODO: does validation belong in here?
  return new InvalidTypeNode(type);
}


export function resolveTypedefs(idl) {
  const typedefs = getTypeDefs(idl);

  return typedefs.map((typedef) => {
    const { name, type } = typedef;

    const entry = new TypedefNode({
      name: name,
      type: resolveTypeNode(idl, type)
    });

    return entry;
  });
}
