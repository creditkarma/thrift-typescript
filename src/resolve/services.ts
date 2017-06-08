import {

} from 'typescript';

import collect from '../collect';

import { TypeNode, resolveTypeNode } from './typedefs';

export class ServiceParameterNode {
  public id: number;
  public name: string;
  public type: TypeNode;

  constructor(args) {
    this.id = args.id;
    this.name = args.name;
    this.type = args.type;
  }

  public toAST() {

  }
}

export class ServiceFunctionNode {
  public name: string;
  public returnType: TypeNode;
  public oneway: boolean;
  public parameters: ServiceParameterNode[];
  // TODO: throws

  constructor(args) {
    this.name = args.name;
    this.returnType = args.returnType;
    this.oneway = args.oneway;
    this.parameters = args.parameters;
  }

  public toAST() {

  }
}

export class ServiceNode {
  public name: string;
  public extends?: string;

  constructor(args) {
    this.name = args.name;
    this.extends = args.extends;
  }

  public toAST() {

  }
}

export function resolveServices(idl: JsonAST) {
  const services = collect(idl.service);

  return services.map((service) => {
    const functions = collect(service.functions);

    const funcs = functions.map((func) => {
      const parameters = func.args.map((arg) => {
        return new ServiceParameterNode({
          id: arg.id,
          name: arg.name,
          type: resolveTypeNode(idl, arg.type)
        });
      });

      return new ServiceFunctionNode({
        name: func.name,
        returnType: resolveTypeNode(idl, func.type),
        oneway: func.oneway,
        parameters: parameters
      });
    });

    return new ServiceNode({
      name: service.name,
      extends: service.extends
    });
  });
}