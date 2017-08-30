import {
  Block,
  CallExpression,
  Identifier,
  MethodDeclaration,
  ParameterDeclaration,
  ExpressionStatement,
  WhileStatement,
  VariableStatement,
  SwitchStatement,
  Statement,
  CaseClause,
  IfStatement,
  TypeLiteralNode,
  createIf,
  createFor,
  createUniqueName,
  createLessThan,
  createPostfixIncrement,
  createTypeReferenceNode,
  createTypeLiteralNode,
  createStatement,
  createCall,
  createLiteral,
  createWhile,
  createSwitch,
  createCaseBlock,
  createCaseClause,
  createDefaultClause,
  createBlock,
  createIdentifier,
  createBreak,
  createNew
} from 'typescript'

import {
  FieldType,
  SyntaxType,
  ContainerType,
  StructDefinition,
  FieldDefinition
} from '@creditkarma/thrift-parser'

import {
  createVoidType,
  createStringType,
  createNumberType,
  createTypeProperty,
  thriftPropertyAccessForFieldType,
  typeNodeForFieldType
} from '../types'

import {
  createPublicMethod,
  createFunctionParameter,
  propertyAccessForIdentifier,
  createAssignmentStatement,
  createConstStatement,
  createLet,
  createEquals
} from '../utils'

import {
  READ_METHODS
} from './methods'

/**
 * public read(input: TProtocol): void {
 *     input.readStructBegin()
 *     while (true) {
 *         {{#has_fields}}
 *         const {ftype, fid} = input.readFieldBegin()
 *         {{/has_fields}}
 *         {{^has_fields}}
 *         const {ftype} = input.readFieldBegin()
 *         {{/has_fields}}
 *         if (ftype === Thrift.Type.STOP) {
 *             break
 *         }
 *         {{#has_fields}}
 *         switch (fid) {
 *             {{#fields}}
 *             case {{id}}:
 *                 {{>readField}}
 *                 break
 *             {{/fields}}
 *             default:
 *                 input.skip(ftype)
 *         }
 *         {{/has_fields}}
 *         {{^has_fields}}
 *         input.skip(ftype)
 *         {{/has_fields}}
 *         input.readFieldEnd()
 *     }
 *     input.readStructEnd()
 *     return
 * }
 */
export function createReadMethod(struct: StructDefinition): MethodDeclaration {
  //const fieldWrites: Array<IfStatement> = struct.fields.map((field) => createWriteForField(struct, field))
  const inputParameter: ParameterDeclaration = createFunctionParameter(
    'input', // param name
    createTypeReferenceNode('TProtocol', undefined) // param type
  )
  
  /**
   * cosnt ret: { fname: string; ftype: Thrift.Type; fid: number; } = input.readFieldBegin()
   * const fname: string = ret.fname
   * const ftype: Thrift.Type = ret.ftype
   * const fid: number = ret.fid
   */
  const ret: VariableStatement = createConstStatement('ret', fieldMetadataType(), readFieldBegin())
  const fname: VariableStatement = createConstStatement('fname', createStringType(), propertyAccessForIdentifier('ret', 'fname'))
  const ftype: VariableStatement = createConstStatement('ftype', createTypeReferenceNode('Thrift.Type', undefined), propertyAccessForIdentifier('ret', 'ftype'))
  const fid: VariableStatement = createConstStatement('fid', createNumberType(), propertyAccessForIdentifier('ret', 'fid'))
  
  /**
   * if (ftype === Thrift.Type.STOP) {
   *     break;
   * }
   */
  const checkStop: IfStatement = createIf(
    createEquals(createIdentifier('ftype'), createIdentifier('Thrift.Type.STOP')),
    createBlock([
      createBreak()
    ], true)
  )

  const caseStatements: Array<CaseClause> = struct.fields.map(createCaseForField)

  /**
   * switch (fid) {
   *   ...caseStatements
   * } 
   */
  const switchStatement: SwitchStatement = createSwitch(
    createIdentifier('fid'), // what are we switch on
    createCaseBlock([
      ...caseStatements,
      createDefaultClause([
        createSkipBlock()
      ])
    ])
  )

  const whileBlock: Block = createBlock([
    ret,
    fname,
    ftype,
    fid,
    checkStop,
    switchStatement,
    createStatement(readFieldEnd())
  ], true)
  const whileLoop: WhileStatement = createWhile(createLiteral(true), whileBlock)
  
  return createPublicMethod(
    'read', // Method name
    [ inputParameter ], // Method parameters
    createVoidType(), // Method return type
    [
      readStructBegin(),
      whileLoop,
      readStructEnd()
    ] // Method body statements
  )
}

/**
 * EXAMPLE
 * 
 * case 1: {
 *   if (ftype === Thrift.Type.I32) {
 *     this.id = input.readI32();
 *   }
 *   else {
 *     input.skip(ftype);
 *   }
 *   break;
 * }
 * 
 * @param field
 */
function createCaseForField(field: FieldDefinition): CaseClause {
  const checkType: IfStatement = createIf(
    createEquals(createIdentifier('ftype'), thriftPropertyAccessForFieldType(field.fieldType)),
    readValueForFieldType(field.fieldType, createIdentifier(`this.${field.name.value}`)),
    createSkipBlock()
  )

  return createCaseClause(
    createLiteral(field.fieldID.value),
    [ checkType, createBreak() ]
  )
}

function metadataTypeForFieldType(fieldType: ContainerType): TypeLiteralNode {
  switch (fieldType.type) {
    case SyntaxType.MapType:
      return mapMetadataType()

    case SyntaxType.SetType:
    case SyntaxType.ListType:
      return listMetadataType()

    default:
      const msg: never = fieldType
      throw new Error(`Non-exhaustive match for: ${msg}`)
  }
}

function readBeginForFieldType(fieldType: ContainerType): CallExpression {
  switch (fieldType.type) {
    case SyntaxType.MapType:
      return readMapBegin()

    case SyntaxType.SetType:
      return readSetBegin()

    case SyntaxType.ListType:
      return readListBegin()

    default:
      const msg: never = fieldType
      throw new Error(`Non-exhaustive match for: ${msg}`)
  }
}

function readEndForFieldType(fieldType: ContainerType): CallExpression {
  switch (fieldType.type) {
    case SyntaxType.MapType:
      return readMapEnd()

    case SyntaxType.SetType:
      return readSetEnd()

    case SyntaxType.ListType:
      return readListEnd()

    default:
      const msg: never = fieldType
      throw new Error(`Non-exhaustive match for: ${msg}`)
  }
}

function loopBody(fieldType: ContainerType, fieldName: Identifier): Array<Statement> {
  const value: Identifier = createUniqueName('value')

  switch (fieldType.type) {
    case SyntaxType.MapType:
      const key: Identifier = createUniqueName('key')
      return [
        ..._readValueForFieldType(fieldType.keyType, key).statements,
        ..._readValueForFieldType(fieldType.valueType, value).statements,
        createStatement(createCall(
          propertyAccessForIdentifier(fieldName, 'set'),
          undefined,
          [ key, value ]
        ))
      ]

    case SyntaxType.ListType:
      return [
        ..._readValueForFieldType(fieldType.valueType, value).statements,
        createStatement(createCall(
          propertyAccessForIdentifier(fieldName, 'push'),
          undefined,
          [ value ]
        ))
      ]

    case SyntaxType.SetType:
      return [
        ..._readValueForFieldType(fieldType.valueType, value).statements,
        createStatement(createCall(
          propertyAccessForIdentifier(fieldName, 'add'),
          undefined,
          [ value ]
        ))
      ]
  }
}


/**
 * EXAMPLE OF MAP FIELD
 * 
 * if (ftype === Thrift.Type.MAP) {
 *   this.field1 = new Map<string, string>();
 *   const metadata_1: {
 *     ktype: Thrift.Type;
 *     vtype: Thrift.Type;
 *     size: number;
 *   } = input.readMapBegin();
 *   const size_1: number = metadata_1.size;
 *   for (let i_1: number = 0; i_1 < size_1; i_1++) {
 *     const key_2: string = input.readString();
 *     const value_2: string = input.readString();
 *     this.field1.set(key_2, value_2);
 *   }
 *   input.readMapEnd();
 * }
 */
function loopOverContainer(fieldType: ContainerType, fieldName: Identifier): Array<Statement> {
  const incrementer: Identifier = createUniqueName('i')
  const metadata: Identifier = createUniqueName('metadata')
  const size: Identifier = createUniqueName('size')

  return [
    // const metadata: { ktype: Thrift.Type; vtype: Thrift.Type; size: number; } = input.readMapBegin()
    createConstStatement(
      metadata,
      metadataTypeForFieldType(fieldType),
      readBeginForFieldType(fieldType)
    ),
    // cosnt size: number = metadata.size
    createConstStatement(
      size,
      createNumberType(),
      propertyAccessForIdentifier(metadata, 'size')
    ),
    // for (let i = 0, i < size; i++) { .. }
    createFor(
      createLet(
        incrementer,
        createNumberType(),
        createLiteral(0)
      ),
      createLessThan(incrementer, size),
      createPostfixIncrement(incrementer),
      createBlock(loopBody(fieldType, fieldName), true)
    ),
    createStatement(readEndForFieldType(fieldType))
  ]
}

function _readValueForFieldType(fieldType: FieldType, fieldName: Identifier): Block {
  switch (fieldType.type) {
    case SyntaxType.Identifier:
      return createBlock([
        createAssignmentStatement(
          fieldName,
          createNew(
            createIdentifier(fieldType.value), // class name
            undefined,
            []
          )
        ),
        createStatement(createCall(
          propertyAccessForIdentifier(fieldName, 'read'),
          undefined,
          [ createIdentifier('input') ]
        ))
      ], true)

    /**
     * Base types:
     * SyntaxType.StringKeyword | SyntaxType.DoubleKeyword | SyntaxType.BoolKeyword |
     * SyntaxType.I8Keyword | SyntaxType.I16Keyword | SyntaxType.I32Keyword |
     * SyntaxType.I64Keyword | SyntaxType.BinaryKeyword | SyntaxType.ByteKeyword;
     */
    case SyntaxType.BoolKeyword:
    case SyntaxType.ByteKeyword:
    case SyntaxType.BinaryKeyword:
    case SyntaxType.StringKeyword:
    case SyntaxType.DoubleKeyword:
    case SyntaxType.I8Keyword:
    case SyntaxType.I16Keyword:
    case SyntaxType.I32Keyword:
    case SyntaxType.I64Keyword:
      return createBlock([
        createConstStatement(
          fieldName,
          typeNodeForFieldType(fieldType),
          createCall(
            propertyAccessForIdentifier('input', READ_METHODS[fieldType.type]),
            undefined,
            undefined
          )
        )
      ], true)

    /**
     * Container types:
     * 
     * SetType | MapType | ListType
     */
    case SyntaxType.MapType:
      return createBlock([
        createConstStatement(
          fieldName,
          typeNodeForFieldType(fieldType),
          createNew(
            createIdentifier('Map'), // class name
            [ typeNodeForFieldType(fieldType.keyType), typeNodeForFieldType(fieldType.valueType) ],
            []
          )
        ),
        ...loopOverContainer(fieldType, fieldName)
      ], true)

    case SyntaxType.ListType:
      return createBlock([
        createConstStatement(
          fieldName,
          typeNodeForFieldType(fieldType),
          createNew(
            createIdentifier('Array'), // class name
            [ typeNodeForFieldType(fieldType.valueType) ],
            []
          )
        ),
        ...loopOverContainer(fieldType, fieldName)
      ], true)

    case SyntaxType.SetType:
      return createBlock([
        createConstStatement(
          fieldName,
          typeNodeForFieldType(fieldType),
          createNew(
            createIdentifier('Set'), // class name
            [ typeNodeForFieldType(fieldType.valueType) ],
            []
          )
        ),
        ...loopOverContainer(fieldType, fieldName)
      ], true)

    default:
      const msg: never = fieldType
      throw new Error(`Non-exhaustive match for: ${msg}`)
  }
}

export function readValueForFieldType(fieldType: FieldType, fieldName: Identifier): Block {
  switch (fieldType.type) {
    case SyntaxType.Identifier:
      return createBlock([
        createAssignmentStatement(
          fieldName,
          createNew(
            createIdentifier(fieldType.value), // class name
            undefined,
            []
          )
        ),
        createStatement(createCall(
          propertyAccessForIdentifier(fieldName, 'read'),
          undefined,
          [ createIdentifier('input') ]
        ))
      ], true)

    /**
     * Base types:
     * 
     * SyntaxType.StringKeyword | SyntaxType.DoubleKeyword | SyntaxType.BoolKeyword |
     * SyntaxType.I8Keyword | SyntaxType.I16Keyword | SyntaxType.I32Keyword |
     * SyntaxType.I64Keyword | SyntaxType.BinaryKeyword | SyntaxType.ByteKeyword;
     */
    case SyntaxType.BoolKeyword:
    case SyntaxType.ByteKeyword:
    case SyntaxType.BinaryKeyword:
    case SyntaxType.StringKeyword:
    case SyntaxType.DoubleKeyword:
    case SyntaxType.I8Keyword:
    case SyntaxType.I16Keyword:
    case SyntaxType.I32Keyword:
    case SyntaxType.I64Keyword:
      return createBlock([
        createAssignmentStatement(
          fieldName,
          createCall(
            propertyAccessForIdentifier('input', READ_METHODS[fieldType.type]),
            undefined,
            undefined
          )
        )
      ], true)

    /**
     * Container types:
     * 
     * SetType | MapType | ListType
     */
    case SyntaxType.MapType:
      return createBlock([
        createAssignmentStatement(
          createIdentifier(`${fieldName.text}`),
          createNew(
            createIdentifier('Map'), // class name
            [ typeNodeForFieldType(fieldType.keyType), typeNodeForFieldType(fieldType.valueType) ],
            []
          )
        ),
        ...loopOverContainer(fieldType, fieldName)
      ], true)

    case SyntaxType.ListType:
      return createBlock([
        createAssignmentStatement(
          createIdentifier(`${fieldName.text}`),
          createNew(
            createIdentifier('Array'), // class name
            [ typeNodeForFieldType(fieldType.valueType) ],
            []
          )
        ),
        ...loopOverContainer(fieldType, fieldName)
      ], true)

    case SyntaxType.SetType:
      return createBlock([
        createAssignmentStatement(
          createIdentifier(`${fieldName.text}`),
          createNew(
            createIdentifier('Set'), // class name
            [ typeNodeForFieldType(fieldType.valueType) ],
            []
          )
        ),
        ...loopOverContainer(fieldType, fieldName)
      ], true)

    default:
      const msg: never = fieldType
      throw new Error(`Non-exhaustive match for: ${msg}`)
  }
}

// output.readStructBegin(<structName>)
export function readStructBegin(): ExpressionStatement {
  return createStatement(createCall(
    propertyAccessForIdentifier('input', 'readStructBegin'),
    undefined,
    undefined
  ))
}

// output.readStructEnd()
export function readStructEnd(): ExpressionStatement {
  return createStatement(createCall(
    propertyAccessForIdentifier('input', 'readStructEnd'),
    undefined,
    undefined
  ))
}

// output.readFieldBegin()
export function readFieldBegin(): CallExpression {
  return createCall(
    propertyAccessForIdentifier('input', 'readFieldBegin'),
    undefined,
    undefined
  )
}

// output.readFieldEnd()
export function readFieldEnd(): CallExpression {
  return createCall(
    propertyAccessForIdentifier('input', 'readFieldEnd'),
    undefined,
    undefined
  )
}

// output.readMapBegin()
export function readMapBegin(): CallExpression {
  return createCall(
    propertyAccessForIdentifier('input', 'readMapBegin'),
    undefined,
    undefined
  )
}

// output.readMapEnd()
export function readMapEnd(): CallExpression {
  return createCall(
    propertyAccessForIdentifier('input', 'readMapEnd'),
    undefined,
    undefined
  )
}

// output.readListBegin()
export function readListBegin(): CallExpression {
  return createCall(
    propertyAccessForIdentifier('input', 'readListBegin'),
    undefined,
    undefined
  )
}

// output.readListEnd()
export function readListEnd(): CallExpression {
  return createCall(
    propertyAccessForIdentifier('input', 'readListEnd'),
    undefined,
    undefined
  )
}

// output.readSetBegin()
export function readSetBegin(): CallExpression {
  return createCall(
    propertyAccessForIdentifier('input', 'readSetBegin'),
    undefined,
    undefined
  )
}

// output.readSetEnd()
export function readSetEnd(): CallExpression {
  return createCall(
    propertyAccessForIdentifier('input', 'readSetEnd'),
    undefined,
    undefined
  )
}

// input.skip(ftype)
function createSkipBlock(): Block {
  return createBlock([
    createStatement(createCall(
      propertyAccessForIdentifier('input', 'skip'),
      undefined,
      [ createIdentifier('ftype') ]
    ))
  ], true)
}

// { ktype: Thrift.Type; vtype: Thrift.Type; size: number; }
function mapMetadataType(): TypeLiteralNode {
  return createTypeLiteralNode([
    createTypeProperty('ktype', createTypeReferenceNode('Thrift.Type', undefined)),
    createTypeProperty('vtype', createTypeReferenceNode('Thrift.Type', undefined)),
    createTypeProperty('size', createNumberType())
  ])
}

// { etype: Thrift.Type; size: number; }
function listMetadataType(): TypeLiteralNode {
  return createTypeLiteralNode([
    createTypeProperty('etype', createTypeReferenceNode('Thrift.Type', undefined)),
    createTypeProperty('size', createNumberType())
  ])
}

// { fname: string; ftype: Thrift.Type; fid: number; }
function fieldMetadataType(): TypeLiteralNode {
  return createTypeLiteralNode([
    createTypeProperty('fname', createStringType()),
    createTypeProperty('ftype', createTypeReferenceNode('Thrift.Type', undefined)),
    createTypeProperty('fid', createNumberType())
  ])
}
