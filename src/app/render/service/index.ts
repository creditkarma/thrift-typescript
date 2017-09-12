export * from './client';
export * from './processor';

import * as ts from 'typescript'

import {
  SyntaxType,
  StructDefinition,
  ServiceDefinition,
  FunctionDefinition,
  FieldDefinition,
  createIdentifier,
  createFieldDefinition,
  TextLocation,
  createFieldID
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
      name: createIdentifier(
        createStructArgsName(service, func),
        emptyLocation()
      ),
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
      name: createIdentifier(
        createStructResultName(service, func),
        emptyLocation()
      ),
      fields: [
        createFieldDefinition(
          createIdentifier('success', emptyLocation()),
          createFieldID((fieldID++), emptyLocation()),
          'optional',
          func.returnType,
          emptyLocation()
        ),
        ...func.throws.map((next: FieldDefinition): FieldDefinition => {
          return createFieldDefinition(
            next.name,
            createFieldID((fieldID++), emptyLocation()),
            'optional',
            next.fieldType,
            emptyLocation()
          )
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
