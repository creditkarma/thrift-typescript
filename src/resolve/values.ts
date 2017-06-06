import {
  createLiteral,
  createNew,
  createArrayLiteral,

  createIdentifier,

  createPropertyAssignment,
  createObjectLiteral,

  PrimaryExpression,
  NewExpression,
  ArrayLiteralExpression
} from 'typescript';

import { isBaseType, isListLikeType, isSetLikeType, isMapLikeType } from '../is';
import { identifiers as _id } from '../ast/identifiers';

export type ValueNode = BaseValueNode | StructValueNode | MapValueNode | SetValueNode | ListValueNode;

export class BaseValueNode {
  public value: string | number | boolean;

  constructor(value) {
    this.value = value;
  }

  public toAST(): PrimaryExpression {
    return createLiteral(this.value);
  }
}

export class StructValueNode {
  public name: string;
  public values: any[];

  constructor(args) {
    this.name = args.name;
    this.values = args.values;
  }

  public toAST(): NewExpression {
    const id = createIdentifier(this.name);
    const values = this.values.map((val) => {
      console.log(val);
      return createPropertyAssignment(val.key, val.value.toAST())
    });
    return createNew(id, undefined, [createObjectLiteral(values)]);
  }
}

export class ListValueNode {
  public values: ValueNode[];

  constructor(values) {
    this.values = values;
  }

  public toAST(): ArrayLiteralExpression {
    const values = this.values.map((val) => val.toAST());
    return createArrayLiteral(values);
  }
}

export class SetValueNode {
  public values: ValueNode[];

  constructor(values) {
    this.values = values;
  }

  public toAST(): NewExpression {
    const values = this.values.map((val) => val.toAST());
    return createNew(_id.Set, undefined, [createArrayLiteral(values)]);
  }
}

export class MapValueNode {
  public values: { key: ValueNode, value: ValueNode }[];

  constructor(values) {
    this.values = values;
  }

  public toAST(): NewExpression {
    const values = this.values.map((tuple) => {
      return createArrayLiteral([tuple.key.toAST(), tuple.value.toAST()])
    });
    return createNew(_id.Map, undefined, [createArrayLiteral(values)]);
  }
}

export class InvalidValueNode {
  public value: any;

  constructor(value) {
    this.value = value
  }

  public toAST() {
    throw new Error(`Invalid value: ${this.value}`);
  }
}

export function resolveValueNode(idl: JsonAST, type, value) {
  if (isBaseType(type)) {
    return new BaseValueNode(value);
  }

  if (isMapLikeType(type)) {
    const values = value.map((tuple) => {
      return {
        key: resolveValueNode(idl, type.keyType, tuple.key),
        value: resolveValueNode(idl, type.valueType, tuple.value)
      }
    });
    return new MapValueNode(values);
  }

  if (isSetLikeType(type)) {
    const values = value.map((val) => resolveValueNode(idl, type.valueType, val));
    return new SetValueNode(values);
  }

  if (isListLikeType(type)) {
    const values = value.map((val) => resolveValueNode(idl, type.valueType, val));
    return new ListValueNode(values);
  }

  if (idl.typedef[type]) {
    // We don't need a custom ValueNode type here, instead we can just resolve it to what it's supposed to be
    return resolveValueNode(idl, idl.typedef[type].type, value);
  }

  if (idl.struct[type]) {
    const values = value.map((tuple, idx) => {
      // TODO: shouldn't be using idx and should lookup name, I think?
      const fieldType = idl.struct[type][idx].type;
      return {
        key: tuple.key,
        value: resolveValueNode(idl, fieldType, tuple.value)
      };
    });
    return new StructValueNode({
      name: type,
      values: values
    });
  }

  return new InvalidValueNode(value);
}