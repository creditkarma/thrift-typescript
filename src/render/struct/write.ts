import {
  SyntaxKind,
  Statement,
  Expression,
  ExpressionStatement,
  CallExpression,
  IfStatement,
  Identifier,
  Block,
  ParameterDeclaration,
  MethodDeclaration,
  createCall,
  createToken,
  createIdentifier,
  createBlock,
  createLiteral,
  createStatement,
  createIf,
  createArrowFunction,
  createTypeReferenceNode,
  createUniqueName
} from 'typescript'

import {
  FieldType,
  BaseType,
  ContainerType,
  SetType,
  ListType,
  MapType,
  StructDefinition,
  FieldDefinition,
  SyntaxType
} from '@creditkarma/thrift-parser'

import {
  propertyAccessForIdentifier,
  createFunctionParameter,
  createNotNull,
  createPublicMethod
} from '../utils'

import {
  createVoidType,
  thriftPropertyAccessForFieldType,
  typeNodeForFieldType
} from '../types'

/**
 * public write(output: TProtocol): void {
 *     output.writeStructBegin("{{StructName}}")
 *     {{#fields}}
 *     if (this.{{fieldName}} != null) {
 *         {{>writeField}}
 *     }
 *     {{/fields}}
 *     output.writeFieldStop()
 *     output.writeStructEnd()
 *     return
 * }
 */
export function createWriteMethod(struct: StructDefinition): MethodDeclaration {
  const fieldWrites: Array<IfStatement> = struct.fields.map((field) => createWriteForField(struct, field))
  const inputParameter: ParameterDeclaration = createFunctionParameter('output', createTypeReferenceNode('TProtocol', undefined))
  
  return createPublicMethod(
    'write', // Method name
    [ inputParameter ], // Method parameters
    createVoidType(), // Method return type
    [
      writeStructBegin(struct.name.value),
      ...fieldWrites,
      writeFieldStop(),
      writeStructEnd()
    ] // Method body statements
  )
}

/**
 * {{#optional}}
 * if (this.{{fieldName}} !== undefined) {
 * {{/optional}}
 * {{^optional}}
 * {{#nullable}}
 * if (this.{{fieldName}} !== null) {
 * {{/nullable}}
 * {{^nullable}}
 * if (true) {
 * {{/nullable}}
 * {{/optional}}
 *     const {{valueVariableName}} = this.{{fieldName}}
 *     output.writeFieldBegin("{{fieldName}}", Thrift.Type.{{^isEnum}}{{constType}}{{/isEnum}}{{#isEnum}}I32{{/isEnum}}, {{id}})
 *     {{#readWriteInfo}}
 *     {{>writeValue}}
 *     {{/readWriteInfo}}
 *     output.writeFieldEnd()
 * }
 */
export function createWriteForField(struct: StructDefinition, field: FieldDefinition): IfStatement {
  return createIf(
    createNotNull('this', field.name.value), // Condition
    createWriteForFieldType(struct, field, createIdentifier(`this.${field.name.value}`)), // Then block
    undefined // Else block
  )
}

/**
 * This generates the method calls to write for a single field
 * 
 * EXAMPLE
 * 
 * output.writeFieldBegin("id", Thrift.Type.I32, 1);
 * output.writeI32(this.id);
 * output.writeFieldEnd();
 * 
 * @param struct
 * @param field 
 */
export function createWriteForFieldType(struct: StructDefinition, field: FieldDefinition, fieldName: Identifier): Block {
  return createBlock([
    writeFieldBegin(field),
    ...writeValueForField(struct, field.fieldType, fieldName),
    writeFieldEnd()
  ])
}

export type WriteMethodName =
  'writeString' | 'writeBinary' | 'writeDouble' | 'writeI16' |
  'writeI32' | 'writeI64' | 'writeByte' | 'writeBool'

function writeMethodForBaseType(fieldType: BaseType): WriteMethodName {
  switch(fieldType.type) {
    case SyntaxType.BoolKeyword:
      return 'writeBool'

    case SyntaxType.BinaryKeyword:
      return 'writeBinary'

    case SyntaxType.StringKeyword:
      return 'writeString'
      
    case SyntaxType.DoubleKeyword:
      return 'writeDouble'

    case SyntaxType.I8Keyword:
    case SyntaxType.ByteKeyword:
      return 'writeByte'

    case SyntaxType.I16Keyword:
      return 'writeI16'

    case SyntaxType.I32Keyword:
      return 'writeI32'
    
    case SyntaxType.I64Keyword:
      return 'writeI64'

    default:
      const msg: never = fieldType.type
      throw new Error(`Non-exhaustive match for ${msg}`)
  }
}

export function writeValueForType(
  struct: StructDefinition,
  fieldType: FieldType,
  fieldName: Identifier
): Array<Expression> {
  switch (fieldType.type) {
    case SyntaxType.Identifier:
      return [ createCall(
        propertyAccessForIdentifier(fieldName, 'write'),
        undefined,
        [ createIdentifier('output') ]
      ) ]

    /**
     * Container types:
     * 
     * SetType | MapType | ListType
     */
    case SyntaxType.SetType:
      return  [
        writeSetBegin(fieldType, fieldName),
        forEach(struct, fieldType, fieldName),
        writeSetEnd()
      ]

    case SyntaxType.MapType:
      return [
        writeMapBegin(fieldType, fieldName),
        forEach(struct, fieldType, fieldName),
        writeMapEnd()
      ]

    case SyntaxType.ListType:
      return  [
        writeListBegin(fieldType, fieldName),
        forEach(struct, fieldType, fieldName),
        writeListEnd()
      ]

    /**
     * BaseTypes:
     * 
     * SyntaxType.StringKeyword | SyntaxType.DoubleKeyword | SyntaxType.BoolKeyword |
     * SyntaxType.I8Keyword | SyntaxType.I16Keyword | SyntaxType.I32Keyword |
     * SyntaxType.I64Keyword | SyntaxType.BinaryKeyword | SyntaxType.ByteKeyword
     */
    case SyntaxType.BoolKeyword:
    case SyntaxType.BinaryKeyword:
    case SyntaxType.StringKeyword:
    case SyntaxType.DoubleKeyword:
    case SyntaxType.I8Keyword:
    case SyntaxType.ByteKeyword:
    case SyntaxType.I16Keyword:
    case SyntaxType.I32Keyword:
    case SyntaxType.I64Keyword:
      return [ writeMethodForName(writeMethodForBaseType(fieldType), fieldName) ]

    default:
      const msg: never = fieldType
      throw new Error(`Non-exhaustive match for: ${msg}`)
  }
}

function writeMethodForName(methodName: WriteMethodName, fieldName: Identifier): CallExpression {
  return createCall(
    propertyAccessForIdentifier('output', methodName),
    undefined,
    [ fieldName ]
  )
}

function writeValueForField(
  struct: StructDefinition,
  fieldType: FieldType,
  fieldName: Identifier
): Array<ExpressionStatement> {
  return writeValueForType(struct, fieldType, fieldName).map(createStatement)
}

/**
 * Loop through container types and write the values for all children
 * 
 * EXAMPLE FOR SET
 * 
 * // thrift
 * struct MyStruct {
 *   1: required set<string> field1;
 * }
 * 
 * // typescript
 * this.field1.forEach((value_1: string): void => {
 *   output.writeString(value_1);
 * });
 * 
 * @param struct 
 * @param fieldType 
 * @param fieldName 
 */
function forEach(
  struct: StructDefinition,
  fieldType: ContainerType,
  fieldName: Identifier
): CallExpression {
  const value: Identifier = createUniqueName('value')
  const forEachParameters: Array<ParameterDeclaration> = [
    createFunctionParameter(
      value,
      typeNodeForFieldType(fieldType.valueType)
    )
  ]

  const forEachStatements: Array<Statement> = [
    ...writeValueForField(struct, fieldType.valueType, value)
  ]

  // If map we have to handle key type as well as value type
  if (fieldType.type === SyntaxType.MapType) {
    const key: Identifier = createUniqueName('key')
    forEachParameters.push(createFunctionParameter(
      key,
      typeNodeForFieldType(fieldType.keyType)
    ))

    forEachStatements.unshift(...writeValueForField(struct, fieldType.keyType, key))
  }
  
  return createCall(
    propertyAccessForIdentifier(fieldName, 'forEach'),
    undefined,
    [ createArrowFunction(
      undefined, // modifiers
      undefined, // type parameters
      forEachParameters, // parameters
      createVoidType(), // return type,
      createToken(SyntaxKind.EqualsGreaterThanToken), // greater than equals token
      createBlock(forEachStatements, true) // body
    ) ]
  )
}

// output.writeStructBegin(<structName>)
function writeStructBegin(structName: string): ExpressionStatement {
  return createStatement(createCall(
    propertyAccessForIdentifier('output', 'wrtieStructBegin'),
    undefined,
    [ createLiteral(structName) ]
  ))
}

// output.writeStructEnd()
function writeStructEnd(): ExpressionStatement {
  return createStatement(createCall(
    propertyAccessForIdentifier('output', 'writeStructEnd'),
    undefined,
    undefined
  ))
}

// output.writeMapBeing(<field.keyType>, <field.valueType>, <field.size>)
function writeMapBegin(fieldType: MapType, fieldName: string | Identifier): CallExpression {
  return createCall(
    propertyAccessForIdentifier('output', 'writeMapBegin'),
    undefined,
    [ 
      thriftPropertyAccessForFieldType(fieldType.keyType),
      thriftPropertyAccessForFieldType(fieldType.valueType),
      propertyAccessForIdentifier(fieldName, 'size')
    ]
  )
}

// output.writeMapEnd()
function writeMapEnd(): CallExpression {
  return createCall(
    propertyAccessForIdentifier('output', 'writeMapEnd'),
    undefined,
    []
  )
}

// output.writeListBegin(<field.type>, <field.length>)
function writeListBegin(fieldType: ListType, fieldName: string | Identifier): CallExpression {
  return createCall(
    propertyAccessForIdentifier('output', 'writeListBegin'),
    undefined,
    [ 
      thriftPropertyAccessForFieldType(fieldType.valueType),
      propertyAccessForIdentifier(fieldName, 'length')
    ]
  )
}

// output.writeListEnd()
function writeListEnd(): CallExpression {
  return createCall(
    propertyAccessForIdentifier('output', 'writeListEnd'),
    undefined,
    []
  )
}

// output.writeSetBegin(<field.type>, <field.size>)
function writeSetBegin(fieldType: SetType, fieldName: string | Identifier): CallExpression {
  return createCall(
    propertyAccessForIdentifier('output', 'writeSetBegin'),
    undefined,
    [ 
      thriftPropertyAccessForFieldType(fieldType.valueType),
      propertyAccessForIdentifier(fieldName, 'size')
    ]
  )
}

// output.writeSetEnd()
function writeSetEnd(): CallExpression {
  return createCall(
    propertyAccessForIdentifier('output', 'writeSetEnd'),
    undefined,
    []
  )
}

// output.writeFieldBegin(<field.name>, <field.fieldType>, <field.fieldID>)
function writeFieldBegin(field: FieldDefinition): ExpressionStatement {
  return createStatement(createCall(
    propertyAccessForIdentifier('output', 'writeFieldBegin'),
    undefined,
    [ 
      createLiteral(field.name.value),
      thriftPropertyAccessForFieldType(field.fieldType),
      createLiteral(field.fieldID.value)
    ]
  ))
}

// output.writeFieldEnd
function writeFieldEnd(): ExpressionStatement {
  return createStatement(createCall(
    propertyAccessForIdentifier('output', 'writeFieldEnd'),
    undefined,
    undefined
  ))
}

// output.writeFieldStop
function writeFieldStop(): ExpressionStatement {
  return createStatement(createCall(
    propertyAccessForIdentifier('output', 'writeFieldStop'),
    undefined,
    undefined
  ))
}