import {
  Block,
  CallExpression,
  Identifier,
  MethodDeclaration,
  ParameterDeclaration,
  ExpressionStatement,
  WhileStatement,
  VariableStatement,
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
  createStatement,
  createLiteral,
  createWhile,
  createSwitch,
  createReturn,
  createCaseBlock,
  createCaseClause,
  createDefaultClause,
  createBlock,
  createIdentifier,
  createBreak,
  createNew
} from 'typescript'

import {
  FunctionType,
  SyntaxType,
  ContainerType,
  InterfaceWithFields,
  FieldDefinition
} from '@creditkarma/thrift-parser'

import {
  createVoidType,
  createStringType,
  createNumberType,
  thriftPropertyAccessForFieldType,
  typeNodeForFieldType
} from '../types'

import {
  createMethodCallStatement,
  createMethodCall,
  createPublicMethod,
  createFunctionParameter,
  propertyAccessForIdentifier,
  createAssignmentStatement,
  createConstStatement,
  createLet,
  createEquals
} from '../utils'

import {
  COMMON_IDENTIFIERS
} from '../identifiers'

import {
  READ_METHODS
} from './methods'

import {
  fieldMetadataType,
  listMetadataType,
  mapMetadataType
} from './types'

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
export function createReadMethod(struct: InterfaceWithFields): MethodDeclaration {
  //const fieldWrites: Array<IfStatement> = struct.fields.map((field) => createWriteForField(struct, field))
  const inputParameter: ParameterDeclaration = createInputParameter();
  
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
    createEquals(COMMON_IDENTIFIERS['ftype'], createIdentifier('Thrift.Type.STOP')),
    createBlock([
      createBreak()
    ], true)
  )

  const whileLoop: WhileStatement = createWhile(
    createLiteral(true),
    createBlock([
      ret,
      fname,
      ftype,
      fid,
      checkStop,
      createSwitch(
        COMMON_IDENTIFIERS['fid'], // what to switch on
        createCaseBlock([
          ...struct.fields.map(createCaseForField),
          createDefaultClause([
            createSkipBlock()
          ])
        ])
      ),
      createStatement(readFieldEnd())
    ], true)
  )
  
  return createPublicMethod(
    'read', // Method name
    [ inputParameter ], // Method parameters
    createVoidType(), // Method return type
    [
      readStructBegin(),
      whileLoop,
      readStructEnd(),
      createReturn()
    ] // Method body statements
  )
}

export function createInputParameter(): ParameterDeclaration {
  return createFunctionParameter(
    'input', // param name
    createTypeReferenceNode('TProtocol', undefined) // param type
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
export function createCaseForField(field: FieldDefinition): CaseClause {
  const checkType: IfStatement = createIf(
    createEquals(COMMON_IDENTIFIERS['ftype'], thriftPropertyAccessForFieldType(field.fieldType)),
    createBlock(readValueForFieldType(field.fieldType, createIdentifier(`this.${field.name.value}`)), true),
    createSkipBlock()
  )

  return createCaseClause(
    createLiteral(field.fieldID.value),
    [ checkType, createBreak() ]
  )
}

export function metadataTypeForFieldType(fieldType: ContainerType): TypeLiteralNode {
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
        ..._readValueForFieldType(fieldType.keyType, key),
        ..._readValueForFieldType(fieldType.valueType, value),
        createMethodCallStatement(fieldName, 'set', [ key, value ])
      ]

    case SyntaxType.ListType:
      return [
        ..._readValueForFieldType(fieldType.valueType, value),
        createMethodCallStatement(fieldName, 'push', [ value ])
      ]

    case SyntaxType.SetType:
      return [
        ..._readValueForFieldType(fieldType.valueType, value),
        createMethodCallStatement(fieldName, 'add', [ value ])
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

function _readValueForFieldType(fieldType: FunctionType, fieldName: Identifier): Array<Statement> {
  switch (fieldType.type) {
    case SyntaxType.Identifier:
      return [
        createAssignmentStatement(
          fieldName,
          createNew(
            createIdentifier(fieldType.value), // class name
            undefined,
            []
          )
        ),
        createMethodCallStatement(fieldName, 'read', [
          COMMON_IDENTIFIERS['input']
        ])
      ]

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
      return [
        createConstStatement(
          fieldName,
          typeNodeForFieldType(fieldType),
          createMethodCall('input', READ_METHODS[fieldType.type])
        )
      ]

    /**
     * Container types:
     * 
     * SetType | MapType | ListType
     */
    case SyntaxType.MapType:
      return [
        createConstStatement(
          fieldName,
          typeNodeForFieldType(fieldType),
          createNew(
            COMMON_IDENTIFIERS['Map'], // class name
            [ typeNodeForFieldType(fieldType.keyType), typeNodeForFieldType(fieldType.valueType) ],
            []
          )
        ),
        ...loopOverContainer(fieldType, fieldName)
      ]

    case SyntaxType.ListType:
      return [
        createConstStatement(
          fieldName,
          typeNodeForFieldType(fieldType),
          createNew(
            COMMON_IDENTIFIERS['Array'], // class name
            [ typeNodeForFieldType(fieldType.valueType) ],
            []
          )
        ),
        ...loopOverContainer(fieldType, fieldName)
      ]

    case SyntaxType.SetType:
      return [
        createConstStatement(
          fieldName,
          typeNodeForFieldType(fieldType),
          createNew(
            COMMON_IDENTIFIERS['Set'], // class name
            [ typeNodeForFieldType(fieldType.valueType) ],
            []
          )
        ),
        ...loopOverContainer(fieldType, fieldName)
      ]

    case SyntaxType.VoidKeyword:
      return [
        createMethodCallStatement('input', 'skip', [
          COMMON_IDENTIFIERS['ftype']
        ])
      ]

    default:
      const msg: never = fieldType
      throw new Error(`Non-exhaustive match for: ${msg}`)
  }
}

export function readValueForFieldType(fieldType: FunctionType, fieldName: Identifier): Array<Statement> {
  switch (fieldType.type) {
    case SyntaxType.Identifier:
      return [
        createAssignmentStatement(
          fieldName,
          createNew(
            createIdentifier(fieldType.value), // class name
            undefined,
            []
          )
        ),
        createMethodCallStatement(fieldName, 'read', [
          COMMON_IDENTIFIERS['input']
        ])
      ]

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
      return [
        createAssignmentStatement(
          fieldName,
          createMethodCall('input', READ_METHODS[fieldType.type])
        )
      ]

    /**
     * Container types:
     * 
     * SetType | MapType | ListType
     */
    case SyntaxType.MapType:
      return [
        createAssignmentStatement(
          createIdentifier(`${fieldName.text}`),
          createNew(
            COMMON_IDENTIFIERS['Map'], // class name
            [ typeNodeForFieldType(fieldType.keyType), typeNodeForFieldType(fieldType.valueType) ],
            []
          )
        ),
        ...loopOverContainer(fieldType, fieldName)
      ]

    case SyntaxType.ListType:
      return [
        createAssignmentStatement(
          createIdentifier(`${fieldName.text}`),
          createNew(
            COMMON_IDENTIFIERS['Array'], // class name
            [ typeNodeForFieldType(fieldType.valueType) ],
            []
          )
        ),
        ...loopOverContainer(fieldType, fieldName)
      ]

    case SyntaxType.SetType:
      return [
        createAssignmentStatement(
          createIdentifier(`${fieldName.text}`),
          createNew(
            COMMON_IDENTIFIERS['Set'], // class name
            [ typeNodeForFieldType(fieldType.valueType) ],
            []
          )
        ),
        ...loopOverContainer(fieldType, fieldName)
      ]

    case SyntaxType.VoidKeyword:
      return [
        createMethodCallStatement('input', 'skip', [
          COMMON_IDENTIFIERS['ftype']
        ])
      ]

    default:
      const msg: never = fieldType
      throw new Error(`Non-exhaustive match for: ${msg}`)
  }
}

// input.readStructBegin(<structName>)
export function readStructBegin(): ExpressionStatement {
  return createMethodCallStatement('input', 'readStructBegin')
}

// input.readStructEnd()
export function readStructEnd(): ExpressionStatement {
  return createMethodCallStatement('input', 'readStructEnd')
}

// input.readFieldBegin()
export function readFieldBegin(): CallExpression {
  return createMethodCall('input', 'readFieldBegin')
}

// input.readFieldEnd()
export function readFieldEnd(): CallExpression {
  return createMethodCall('input', 'readFieldEnd')
}

// input.readMapBegin()
export function readMapBegin(): CallExpression {
  return createMethodCall('input', 'readMapBegin')
}

// input.readMapEnd()
export function readMapEnd(): CallExpression {
  return createMethodCall('input', 'readMapEnd')
}

// input.readListBegin()
export function readListBegin(): CallExpression {
  return createMethodCall('input', 'readListBegin')
}

// input.readListEnd()
export function readListEnd(): CallExpression {
  return createMethodCall('input', 'readListEnd')
}

// input.readSetBegin()
export function readSetBegin(): CallExpression {
  return createMethodCall('input', 'readSetBegin')
}

// input.readSetEnd()
export function readSetEnd(): CallExpression {
  return createMethodCall('input', 'readSetEnd')
}

// input.skip(ftype)
export function createSkipBlock(): Block {
  return createBlock([
    createSkipStatement()
  ], true)
}

function createSkipStatement(): ExpressionStatement {
  return createMethodCallStatement('input', 'skip', [
    COMMON_IDENTIFIERS['ftype']
  ])
}
