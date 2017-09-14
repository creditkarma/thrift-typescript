/**
 * RESOLVER
 *
 * TODO: Some of the logic in this file may best fit with thrift-parser. Will need
 * to revist this and decide what logic is generic enough to be in the parser. What
 * could other code generators use?
 */
import * as path from 'path'

import {
  FieldDefinition,
  FieldType,
  FunctionDefinition,
  FunctionType,
  IncludeDefinition,
  NamespaceDefinition,
  SyntaxType,
  ThriftDocument,
  ThriftStatement,
} from '@creditkarma/thrift-parser'

import {
  IIdentifierMap,
  IIdentifierType,
  IIncludeData,
  IIncludeMap,
  IResolvedFile,
  IResolvedIncludeMap,
  IResolvedNamespaceMap,
} from './types'

export interface IResolver {
  resolve(): IResolvedFile
}

/**
 * Find all the namespaces defined in the given Thrift doc and create a map of the form:
 *
 * scope -> namespace
 *
 * @param thrift
 */
function findNamespaces(thrift: ThriftDocument): IResolvedNamespaceMap {
  const statements: Array<ThriftStatement> = thrift.body.filter((next: ThriftStatement): boolean => {
    return next.type === SyntaxType.NamespaceDefinition
  })

  return statements.reduce((acc: IResolvedNamespaceMap, next: NamespaceDefinition) => {
    const scope: string = next.scope.value
    acc[scope] = {
      scope,
      name: next.name.value,
    }
    return acc
  }, {})
}

/**
 * The job of the resolver is to traverse the AST and find all of the Identifiers. In order to
 * correctly generate code we need to know the types of all Identifiers. The type of an
 * Identifier may be defined in this Thrift docs or a Thrift doc imported through an include.
 *
 * The resolve function will find the ultimate definition of an Identifier and save its type
 * to a hash map of the form (name -> type)
 *
 * There are ultimately two places we need to look for Identifiers. Types defined by this file
 * will be defined by a ThriftStatement. When looping through the Thrift statements we need to
 * save all statements that can be exported and used as types by other files.
 *
 * These are Structs, Unions, Exceptions, Enums and TypeDefs
 *
 * The other thing we need to do is look at types used by this file (FieldTypes, ReturnTypes),
 * are the types Identifiers? If so we need to resolve what type they actualy refer to.
 *
 *
 * REDRAW THE AST
 *
 * The other thing this will do is redraw the AST so that imported Identifiers no longer use
 * the dot syntax. The dot syntax is replaced with '$'
 *
 * For example
 *
 * // thrift
 * const example.Type name = "value"
 *
 * // typescript
 * const name: example$Type = "value"
 *
 * Then, when we create our imports we do this:
 *
 * import { Type as example$Type } from './example'
 *
 * @param thrift
 * @param includes
 */
function createResolver(thrift: ThriftDocument, includes: IIncludeMap): IResolver {
  const identifiers: IIdentifierMap = {}
  const resolvedIncludes: IResolvedIncludeMap = {}
  const namespaces: IResolvedNamespaceMap = findNamespaces(thrift)

  for (const name of Object.keys(includes)) {
    resolvedIncludes[name] = []
  }

  function resolve(): IResolvedFile {
    return {
      namespaces,
      includes: resolvedIncludes,
      identifiers,
      body: thrift.body.map(resolveStatement),
    }
  }

  function resolveFunctionType(fieldType: FunctionType): FunctionType {
    switch (fieldType.type) {
      case SyntaxType.VoidKeyword:
        return fieldType

      default:
        return resolveFieldType(fieldType)
    }
  }

  function resolveFieldType(fieldType: FieldType): FieldType {
    switch (fieldType.type) {
      case SyntaxType.Identifier:
        return {
          type: SyntaxType.Identifier,
          value: resolveName(fieldType.value),
          loc: fieldType.loc,
        }

      case SyntaxType.ListType:
        return {
          type: SyntaxType.ListType,
          valueType: resolveFieldType(fieldType.valueType),
          loc: fieldType.loc,
        }

      case SyntaxType.SetType:
        return {
          type: SyntaxType.SetType,
          valueType: resolveFieldType(fieldType.valueType),
          loc: fieldType.loc,
        }

      case SyntaxType.MapType:
        return {
          type: SyntaxType.MapType,
          valueType: resolveFieldType(fieldType.valueType),
          keyType: resolveFieldType(fieldType.keyType),
          loc: fieldType.loc,
        }

      default:
        return fieldType
    }
  }

  function resolveFunction(func: FunctionDefinition): FunctionDefinition {
    return {
      type: SyntaxType.FunctionDefinition,
      name: func.name,
      returnType: resolveFunctionType(func.returnType),
      fields: func.fields.map(resolveField),
      throws: func.throws.map(resolveField),
      comments: func.comments,
      loc: func.loc,
    }
  }

  function resolveField(field: FieldDefinition): FieldDefinition {
    return {
      type: SyntaxType.FieldDefinition,
      name: field.name,
      fieldID: field.fieldID,
      fieldType: resolveFunctionType(field.fieldType),
      requiredness: field.requiredness,
      defaultValue: field.defaultValue,
      comments: field.comments,
      loc: field.loc,
    }
  }

  // Add types defined in this file to our Identifier map
  function addIdentiferForStatement(statement: ThriftStatement): void {
    switch (statement.type) {
      case SyntaxType.StructDefinition:
      case SyntaxType.UnionDefinition:
      case SyntaxType.ExceptionDefinition:
      case SyntaxType.EnumDefinition:
      case SyntaxType.TypedefDefinition:
        identifiers[statement.name.value] = {
          name: statement.name.value,
          resolvedName: statement.name.value,
          definition: statement,
        }
        return

      default:
        return
    }
  }

  function resolveStatement(statement: ThriftStatement): ThriftStatement {
    addIdentiferForStatement(statement)

    switch (statement.type) {
      case SyntaxType.ServiceDefinition:
        return {
          type: SyntaxType.ServiceDefinition,
          name: statement.name,
          extends: (
            statement.extends !== null ?
              {
                type: SyntaxType.Identifier,
                value: resolveName(statement.extends.value),
                loc: statement.extends.loc,
              } :
              null
          ),
          functions: statement.functions.map((next: FunctionDefinition) => {
            return resolveFunction(next)
          }),
          comments: statement.comments,
          loc: statement.loc,
        }

      case SyntaxType.StructDefinition:
        return {
          type: SyntaxType.StructDefinition,
          name: statement.name,
          fields: statement.fields.map(resolveField),
          comments: statement.comments,
          loc: statement.loc,
        }

      case SyntaxType.UnionDefinition:
        return {
          type: SyntaxType.UnionDefinition,
          name: statement.name,
          fields: statement.fields.map(resolveField),
          comments: statement.comments,
          loc: statement.loc,
        }

      case SyntaxType.ExceptionDefinition:
        return {
          type: SyntaxType.ExceptionDefinition,
          name: statement.name,
          fields: statement.fields.map(resolveField),
          comments: statement.comments,
          loc: statement.loc,
        }

      case SyntaxType.TypedefDefinition:
        return {
          type: SyntaxType.TypedefDefinition,
          name: statement.name,
          definitionType: resolveFieldType(statement.definitionType),
          comments: statement.comments,
          loc: statement.loc,
        }

      default:
        return statement
    }
  }

  function containsIdentifier(pathName: string, resolvedName: string): boolean {
    for (const include of resolvedIncludes[pathName]) {
      if (include.resolvedName === resolvedName) {
        return true
      }
    }
    return false
  }

  function resolveName(name: string): string {
    const parts: Array<string> = name.split('.')
    if (parts.length === 2) {
      const pathname: string = parts[0]
      const base: string = parts[1]

      if (resolvedIncludes[pathname] !== undefined) {
        const resolvedName: string = `${pathname}$${base}`
        const baseIdentifier: IIdentifierType = includes[pathname].identifiers[base]
        identifiers[resolvedName] = {
          name: baseIdentifier.name,
          resolvedName,
          definition: baseIdentifier.definition,
        }

        if (!containsIdentifier(pathname, resolvedName)) {
          resolvedIncludes[pathname].push({
            name: base,
            path: pathname,
            resolvedName,
          })
        }
        return resolvedName
      } else {
        return name
      }
    } else {
      return name
    }
  }

  return {
    resolve,
  }
}

/**
 * Iterate through the Thrift AST and find all the identifiers for this file.
 */
export function resolveIdentifiers(thrift: ThriftDocument, includes: IIncludeMap): IResolvedFile {
  const resolver: IResolver = createResolver(thrift, includes)
  return resolver.resolve()
}
