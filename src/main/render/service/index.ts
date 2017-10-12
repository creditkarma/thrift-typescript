export * from './client';
export * from './processor';

import * as ts from 'typescript'

import {
  SyntaxType,
  StructDefinition,
  ServiceDefinition,
  FunctionDefinition,
  FieldDefinition,
  TextLocation
} from '@creditkarma/thrift-parser'

import {
  createStructArgsName,
  createStructResultName
} from './utils'

import {
  renderStruct
} from '../struct'

import {
  renderInterface
} from '../interface'

import {
  IIdentifierMap
} from '../../types'

function emptyLocation(): TextLocation {
  return {
    start: { line: 0, column: 0, index: 0 },
    end: { line: 0, column: 0, index: 0 }
  };
}


export function renderArgsStruct(service: ServiceDefinition, identifiers: IIdentifierMap): Array<ts.InterfaceDeclaration | ts.ClassDeclaration> {
  return service.functions.reduce((
    acc: Array<ts.InterfaceDeclaration | ts.ClassDeclaration>,
    func: FunctionDefinition
  ): Array<ts.InterfaceDeclaration | ts.ClassDeclaration> => {
    const argsStruct: StructDefinition = {
      type: SyntaxType.StructDefinition,
      name: {
        type: SyntaxType.Identifier,
        value: createStructArgsName(func),
        loc: emptyLocation()
      },
      fields: func.fields,
      comments: [],
      loc: emptyLocation()
    };

    return [
      ...acc,
      renderInterface(argsStruct),
      renderStruct(argsStruct, identifiers)
    ];
  }, []);
}

export function renderResultStruct(service: ServiceDefinition, identifiers: IIdentifierMap): Array<ts.InterfaceDeclaration | ts.ClassDeclaration> {
  return service.functions.reduce((
    acc: Array<ts.InterfaceDeclaration | ts.ClassDeclaration>,
    func: FunctionDefinition
  ): Array<ts.InterfaceDeclaration | ts.ClassDeclaration> => {
    var fieldID: number = 0;
    const resultStruct: StructDefinition = {
      type: SyntaxType.StructDefinition,
      name: {
        type: SyntaxType.Identifier,
        value: createStructResultName(func),
        loc: emptyLocation()
      },
      fields: [
        {
          type: SyntaxType.FieldDefinition,
          name: {
            type: SyntaxType.Identifier,
            value: 'success',
            loc: emptyLocation()
          },
          fieldID: {
            type: SyntaxType.FieldID,
            value: (fieldID++),
            loc: emptyLocation()
          },
          requiredness: 'optional',
          fieldType: func.returnType,
          defaultValue: null,
          comments: [],
          loc: emptyLocation()
        },
        ...func.throws.map((next: FieldDefinition): FieldDefinition => {
          return {
            type: SyntaxType.FieldDefinition,
            name: next.name,
            fieldID: {
              type: SyntaxType.FieldID,
              value: (fieldID++),
              loc: emptyLocation()
            },
            requiredness: 'optional',
            fieldType: next.fieldType,
            defaultValue: null,
            comments: [],
            loc: emptyLocation()
          }
        })
      ],
      comments: [],
      loc: {
        start: { line: 0, column: 0, index: 0 },
        end: { line: 0, column: 0, index: 0 }
      }
    };

    return [
      ...acc,
      renderInterface(resultStruct),
      renderStruct(resultStruct, identifiers)
    ];
  }, []);
}
