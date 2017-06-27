import {
  createModuleBlock,
  createModuleDeclaration,

  NodeFlags,

  ModuleDeclaration
} from 'typescript';

import { NamespaceNode, resolveNamespace } from './namespace';
import { TypedefNode, resolveTypedefs } from './typedefs';
import { InterfaceNode, resolveInterfaces } from './interfaces';
import { StructNode, resolveStructs } from './structs';

import { tokens } from '../ast/tokens';

export class IDLNode {
  public filename: string;
  public namespace: NamespaceNode
  public typedefs: TypedefNode[];
  public interfaces: InterfaceNode[];
  public structs: StructNode[];

  constructor(idl) {
    // TODO: are the `resolve` methods better served in the constructor or resolveIDLs?
    this.namespace = resolveNamespace(idl);
    this.typedefs = resolveTypedefs(idl);
    this.interfaces = resolveInterfaces(idl);
    this.structs = resolveStructs(idl);
  }

  public toAST(): ModuleDeclaration {
    const namespace = this.namespace.toAST();
    const types = this.typedefs.map((typedef) => typedef.toAST());
    const interfaces = this.interfaces.map((iface) => iface.toAST());
    const structs = this.structs.map((struct) => struct.toAST());

    const _namespaceBlock = createModuleBlock([
      ...types,
      ...interfaces,
      ...structs
    ]);

    return createModuleDeclaration(undefined, [tokens.export], namespace, _namespaceBlock, NodeFlags.Namespace);
  }
}

export function resolveIDLs(idls: any[]) {
  return idls.map((idl) => new IDLNode(idl))
}