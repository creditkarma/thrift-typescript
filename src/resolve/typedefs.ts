import {
  ArrayTypeNode,
  createArrayTypeNode,
  createKeywordTypeNode,
  createTypeAliasDeclaration,
  createTypeReferenceNode,
  KeywordTypeNode,
  SyntaxKind,
  TypeAliasDeclaration,
  TypeReferenceNode,
} from 'typescript'

import {
  isBaseType,
  isEnum,
  isListLikeType,
  isMapLikeType,
  isSetLikeType,
  isStruct,
  isTypedef,
} from '../is'

import { identifiers as _id } from '../ast/identifiers'
import { tokens as _tokens } from '../ast/tokens'
import collect from '../collect'

// TODO: interface?
// TODO: Can't assign InvalidTypeNode here due to return type
export type TypeNode = BaseTypeNode | AliasTypeNode | MapTypeNode | ListTypeNode | SetTypeNode | StructTypeNode

export class TypedefNode {
  public name: string
  public type: TypeNode

  constructor(args) {
    this.name = args.name
    this.type = args.type
  }

  public toAST(): TypeAliasDeclaration {
    return createTypeAliasDeclaration(undefined, [_tokens.export], this.name, undefined, this.type.toAST())
  }
}

// tslint:disable-next-line:max-classes-per-file
export class BaseTypeNode {
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

// tslint:disable-next-line:max-classes-per-file
// Aliases are just proxies to the underlying type
export class AliasTypeNode {
  public name: string
  public valueType: TypeNode

  constructor(args) {
    this.name = args.name
    this.valueType = args.valueType
  }

  public toEnum(): string {
    return this.valueType.toEnum()
  }

  // Aliases can be whatever type
  public toAST(): TypeReferenceNode | ArrayTypeNode | KeywordTypeNode {
    return this.valueType.toAST()
  }
}

// tslint:disable-next-line:max-classes-per-file
export class ListTypeNode {
  public name: string
  public valueType: TypeNode

  constructor(args) {
    this.name = args.name
    this.valueType = args.valueType
  }

  public toEnum(): string {
    return 'LIST'
  }

  public toAST(): ArrayTypeNode {
    return createArrayTypeNode(this.valueType.toAST())
  }
}

// tslint:disable-next-line:max-classes-per-file
export class SetTypeNode {
  public name: string
  public valueType: TypeNode

  constructor(args) {
    this.name = args.name
    this.valueType = args.valueType
  }

  public toEnum(): string {
    return 'SET'
  }

  public toAST(): TypeReferenceNode {
    return createTypeReferenceNode(_id.Set, [this.valueType.toAST()])
  }
}

// tslint:disable-next-line:max-classes-per-file
export class MapTypeNode {
  public name: string
  public keyType: TypeNode
  public valueType: TypeNode

  constructor(args) {
    this.name = args.name
    this.keyType = args.keyType
    this.valueType = args.valueType
  }

  public toEnum(): string {
    return 'MAP'
  }

  public toAST(): TypeReferenceNode {
    return createTypeReferenceNode(_id.Map, [this.keyType.toAST(), this.valueType.toAST()])
  }
}

// tslint:disable-next-line:max-classes-per-file
export class StructTypeNode {
  public name: string
  public valueType: string

  constructor(args) {
    this.name = args.name
    this.valueType = args.valueType
  }

  public toEnum(): string {
    return 'STRUCT'
  }

  public toAST(): TypeReferenceNode {
    return createTypeReferenceNode(this.valueType, undefined)
  }
}

// tslint:disable-next-line:max-classes-per-file
export class EnumTypeNode {
  public name: string
  public valueType: string

  constructor(args) {
    this.name = args.name
    this.valueType = args.valueType
  }

  public toEnum(): string {
    // TODO: should this always be an i32?
    return 'I32'
  }

  public toAST(): TypeReferenceNode {
    return createTypeReferenceNode(this.valueType, undefined)
  }
}

// tslint:disable-next-line:max-classes-per-file
export class InvalidTypeNode {
  public name: string

  constructor(name) {
    this.name = name
  }

  public toEnum(): void {
    throw new Error(`Unable to find typedef: ${this.name}`)
  }

  public toAST(): void {
    throw new Error(`Unable to find typedef: ${this.name}`)
  }
}

export function resolveTypeNode(idl, type) {
  if (isBaseType(type)) {
    return new BaseTypeNode(type)
  }

  if (isMapLikeType(type)) {
    return new MapTypeNode({
      keyType: resolveTypeNode(idl, type.keyType),
      name: type.name,
      valueType: resolveTypeNode(idl, type.valueType),
    })
  }

  if (isSetLikeType(type)) {
    return new SetTypeNode({
      name: type.name,
      valueType: resolveTypeNode(idl, type.valueType),
    })
  }

  if (isListLikeType(type)) {
    return new ListTypeNode({
      name: type.name,
      valueType: resolveTypeNode(idl, type.valueType),
    })
  }

  if (isTypedef(idl, type)) {
    return new AliasTypeNode({
      name: type,
      valueType: resolveTypeNode(idl, idl.typedef[type].type),
    })
  }

  if (isStruct(idl, type)) {
    return new StructTypeNode({
      name: 'struct',
      valueType: type,
    })
  }

  if (isEnum(idl, type)) {
    return new EnumTypeNode({
      name: 'enum',
      valueType: type,
    })
  }

  // TODO: does validation belong in here?
  return new InvalidTypeNode(type)
}

export function resolveTypedefs(idl: JsonAST) {
  const typedefs = collect(idl.typedef)

  return typedefs.map((typedef) => {
    const { name, type } = typedef

    const entry = new TypedefNode({
      name,
      type: resolveTypeNode(idl, type),
    })

    return entry
  })
}
