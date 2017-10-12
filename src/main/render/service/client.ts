import * as ts from 'typescript'

import {
  ServiceDefinition,
  FunctionDefinition,
  FieldDefinition,
  SyntaxType,
  FunctionType,
} from '@creditkarma/thrift-parser'

import {
  createReqType,
  createProtocolType,
} from './types'

import {
  createStructArgsName,
  createStructResultName
} from './utils'

import {
  createMethodCall,
  createClassConstructor,
  createFunctionParameter,
  createAssignmentStatement,
  createPromise,
  createNotNull,
  createConstStatement,
  createCallStatement,
  createMethodCallStatement,
  createPublicProperty,
  createApplicationException,
} from '../utils'

import {
  createNumberType,
  createVoidType,
  createAnyType,
  typeNodeForFieldType as _typeNodeForFieldType,
} from '../types'

import {
  COMMON_IDENTIFIERS,
  MESSAGE_TYPE,
} from '../identifiers'

function typeNodeForFieldType(fieldType: FunctionType): ts.TypeNode {
  switch (fieldType.type) {
    case SyntaxType.I64Keyword:
      return ts.createUnionTypeNode([
        createNumberType(),
        ts.createTypeReferenceNode(COMMON_IDENTIFIERS.Int64, undefined),
      ])

    default:
      return _typeNodeForFieldType(fieldType)
  }
}

function createInt64Arg(field: FieldDefinition): ts.PropertyAssignment {
  if (field.fieldType.type === SyntaxType.I64Keyword) {
    return ts.createPropertyAssignment(
      ts.createIdentifier(field.name.value),
      ts.createCall(
        ts.createIdentifier('wrapInt64Value'),
        undefined,
        [
          ts.createIdentifier(field.name.value)
        ]
      )
    )
  } else {
    throw new Error('')
  }
}

export function renderClient(node: ServiceDefinition): ts.ClassDeclaration {
  // public _seqid: number;
  const seqid: ts.PropertyDeclaration = createPublicProperty(
    '_seqid',
    createNumberType()
  )

  // public _reqs: { [key: string]: (e?: Error|object, r? any) => void }
  const reqs: ts.PropertyDeclaration = createPublicProperty(
    '_reqs',
    createReqType()
  )

  // public output: TTransport;
  const output: ts.PropertyDeclaration = createPublicProperty(
    'output',
    ts.createTypeReferenceNode(COMMON_IDENTIFIERS.TTransport, undefined)
  )

  // public protocol: new (trans: TTransport) => TProtocol;
  const protocol: ts.PropertyDeclaration = createPublicProperty(
    'protocol',
    createProtocolType()
  )

  /**
   * constructor(output: TTransport, protocol: { new (trans: TTransport): TProtocol }) {
   *   this._seqid = 0;
   *   this._reqs = {};
   * }
   */
  const ctor: ts.ConstructorDeclaration = createClassConstructor(
    [
      createFunctionParameter(
        'output',
        ts.createTypeReferenceNode(COMMON_IDENTIFIERS.TTransport, undefined)
      ),
      createFunctionParameter(
        'protocol',
        createProtocolType()
      ),
    ], // parameters
    [
      ...(
        (node.extends !== null) ?
          [
            ts.createStatement(ts.createCall(
              ts.createSuper(),
              [],
              [
                ts.createIdentifier('output'),
                ts.createIdentifier('protocol')
              ]
            ))
          ] :
          []
      ),
      createAssignmentStatement(
        ts.createIdentifier('this._seqid'),
        ts.createLiteral(0)
      ),
      createAssignmentStatement(
        ts.createIdentifier('this._reqs'),
        ts.createObjectLiteral()
      ),
      createAssignmentStatement(
        ts.createIdentifier('this.output'),
        COMMON_IDENTIFIERS.output
      ),
      createAssignmentStatement(
        ts.createIdentifier('this.protocol'),
        ts.createIdentifier('protocol')
      )
    ] // body
  )

  const incrementSeqIdMethod: ts.MethodDeclaration = ts.createMethod(
    undefined,
    [ ts.createToken(ts.SyntaxKind.PublicKeyword) ],
    undefined,
    'incrementSeqId',
    undefined,
    undefined,
    [],
    createNumberType(),
    ts.createBlock([
      ts.createReturn(
        ts.createBinary(
          ts.createIdentifier('this._seqid'),
          ts.SyntaxKind.PlusEqualsToken,
          ts.createLiteral(1)
        )
      )
    ], true)
  )

  const baseMethods: Array<ts.MethodDeclaration> = node.functions.map(createBaseMethodForDefinition)
  const sendMethods: Array<ts.MethodDeclaration> = node.functions.map((next) => {
    return createSendMethodForDefinition(node, next)
  })
  const recvMethods: Array<ts.MethodDeclaration> = node.functions.map((next) => {
    return createRecvMethodForDefinition(node, next)
  })

  const heritage: Array<ts.HeritageClause> = (
    (node.extends !== null) ?
      [
        ts.createHeritageClause(
          ts.SyntaxKind.ExtendsKeyword,
          [
            ts.createExpressionWithTypeArguments(
              [],
              ts.createIdentifier(`${node.extends.value}.Client`),
            )
          ]
        )
      ] :
      []
  )

  // export class <node.name> { ... }
  return ts.createClassDeclaration(
    undefined, // decorators
    [ ts.createToken(ts.SyntaxKind.ExportKeyword) ], // modifiers
    'Client', // name
    [], // type parameters
    heritage, // heritage
    [
      seqid,
      reqs,
      output,
      protocol,
      ctor,
      incrementSeqIdMethod,
      ...baseMethods,
      ...sendMethods,
      ...recvMethods
    ] // body
  )
}

// public {{name}}( {{#args}}{{fieldName}}: {{fieldType}}, {{/args}} ): Promise<{{typeName}}> {
//     this._seqid = this.incrementSeqId()
//     return new Promise<{{typeName}}>((resolve, reject) => {
//         this._reqs[this.seqid()] = function(error, result) {
//             if (error) {
//                 reject(error)
//             } else {
//                 resolve(result)
//             }
//         }
//         this.send_{{name}}( {{#args}}{{fieldName}}, {{/args}} )
//     })
// }
function createBaseMethodForDefinition(def: FunctionDefinition): ts.MethodDeclaration {
  return ts.createMethod(
    undefined, // decorators
    [ ts.createToken(ts.SyntaxKind.PublicKeyword) ], // modifiers
    undefined, // asterisk token
    def.name.value, // name
    undefined, // question token
    undefined, // type parameters
    def.fields.map(createParametersForField), // parameters
    ts.createTypeReferenceNode(
      'Promise',
      [ typeNodeForFieldType(def.returnType) ]
    ), // return type
    ts.createBlock([
      // this._seqid = this.incrementSeqId()
      createConstStatement(
        ts.createIdentifier('requestId'),
        createNumberType(),
        ts.createCall(ts.createIdentifier('this.incrementSeqId'), undefined, [])
      ),
      // return new Promise<type>((resolve, reject) => { ... })
      ts.createReturn(
        createPromise(
          typeNodeForFieldType(def.returnType),
          [
            // this._reqs[this.seqid()] = (error, result) =>
            createAssignmentStatement(
              ts.createElementAccess(
                ts.createIdentifier('this._reqs'),
                ts.createIdentifier('requestId'),
              ),
              ts.createArrowFunction(
                undefined,
                undefined,
                [
                  createFunctionParameter('error', undefined, undefined),
                  createFunctionParameter('result', undefined, undefined)
                ],
                undefined,
                undefined,
                ts.createBlock([
                  // delete this._reqs[_seqid]
                  ts.createStatement(ts.createDelete(
                    ts.createElementAccess(
                      ts.createIdentifier('this._reqs'),
                      ts.createIdentifier('requestId')
                    )
                  )),
                  ts.createIf(
                    // if (error != null)
                    createNotNull('error'),
                    // reject(error)
                    ts.createBlock([
                      createCallStatement(
                        ts.createIdentifier('reject'),
                        [ ts.createIdentifier('error') ]
                      )
                    ], true),
                    // resolve(result)
                    ts.createBlock([
                      createCallStatement(
                        ts.createIdentifier('resolve'),
                        [ ts.createIdentifier('result') ]
                      )
                    ], true)
                  )
                ], true)
              )
            ),
            // this.send_{{name}}( {{#args}}{{fieldName}}, {{/args}} )
            createMethodCallStatement(
              ts.createIdentifier('this'),
              `send_${def.name.value}`,
              [
                ...def.fields.map((next: FieldDefinition) => {
                  return ts.createIdentifier(next.name.value)
                }),
                ts.createIdentifier('requestId')
              ]
            )
          ]
        )
      )
    ], true) // body
  )
}

// public send_{{name}}({{#args}}{{fieldName}}: {{fieldType}}, {{/args}}): void {
//     const output = new (this.protocol as any)(this.output)
//     output.writeMessageBegin("{{name}}", Thrift.MessageType.CALL, this.seqid())
//     const args = new {{ServiceName}}{{nameTitleCase}}Args()
//     args.write(output)
//     output.writeMessageEnd()
//     return this.output.flush()
// }
function createSendMethodForDefinition(service: ServiceDefinition, def: FunctionDefinition): ts.MethodDeclaration {
  return ts.createMethod(
    undefined, // decorators
    [ ts.createToken(ts.SyntaxKind.PublicKeyword) ], // modifiers
    undefined, // asterisk token
    `send_${def.name.value}`, // name
    undefined, // question token
    undefined, // type params
    [
      ...def.fields.map((next: FieldDefinition) => {
        return createFunctionParameter(
          ts.createIdentifier(next.name.value),
          typeNodeForFieldType(next.fieldType)
        )
      }),
      createFunctionParameter(
        ts.createIdentifier('requestId'),
        createNumberType()
      )
    ], // parameters
    createVoidType(), // return type
    ts.createBlock([
      // const output = new (this.protocol as any)(this.output)
      createConstStatement(
        COMMON_IDENTIFIERS.output,
        ts.createTypeReferenceNode(
          COMMON_IDENTIFIERS.TProtocol,
          undefined
        ),
        ts.createNew(
          ts.createIdentifier('this.protocol'),
          undefined,
          [ ts.createIdentifier('this.output') ]
        )
      ),
      // output.writeMessageBegin("{{name}}", Thrift.MessageType.CALL, this.seqid())
      createMethodCallStatement(
        COMMON_IDENTIFIERS.output,
        'writeMessageBegin',
        [
          ts.createLiteral(def.name.value),
          MESSAGE_TYPE.CALL,
          ts.createIdentifier('requestId')
        ]
      ),
      // MortgageServiceGetMortgageOffersArgs
      // const args = new {{ServiceName}}{{nameTitleCase}}Args( { {{#args}}{{fieldName}}, {{/args}} } )
      createConstStatement(
        COMMON_IDENTIFIERS.args,
        ts.createTypeReferenceNode(
          ts.createIdentifier(createStructArgsName(def)),
          undefined
        ),
        ts.createNew(
          ts.createIdentifier(createStructArgsName(def)),
          undefined,
          [ ts.createObjectLiteral(
            def.fields.map((next: FieldDefinition) => {
              if (next.fieldType.type === SyntaxType.I64Keyword) {
                return createInt64Arg(next)
              } else {
                return ts.createShorthandPropertyAssignment(next.name.value)
              }
            }),
            true
          ) ]
        )
      ),
      // args.write(output)
      createMethodCallStatement(
        COMMON_IDENTIFIERS.args,
        'write',
        [ COMMON_IDENTIFIERS.output ]
      ),
      // output.writeMessageEnd()
      createMethodCallStatement(
        COMMON_IDENTIFIERS.output,
        'writeMessageEnd'
      ),
      // return this.output.flush()
      ts.createReturn(
        createMethodCall(
          ts.createIdentifier('this.output'),
          'flush',
          []
        )
      )
    ], true) // body
  )
}

// public recv_{{name}}(input: TProtocol, mtype: Thrift.MessageType, rseqid: number): void {
//     const noop = () => null
//     let callback = this._reqs[rseqid] || noop
//     delete this._reqs[rseqid]
//     if (mtype === Thrift.MessageType.EXCEPTION) {
//         const x = new Thrift.TApplicationException()
//         x.read(input)
//         input.readMessageEnd()
//         return callback(x)
//     }
//     const result = new {{ServiceName}}{{nameTitleCase}}Result()
//     result.read(input)
//     input.readMessageEnd()
//     // Dont check if
//     {{#throws}}if (result.{{throwName}} != null) {
//         return callback(result.{{throwName}})
//     }
//     {{/throws}}
//     {{^isVoid}}
//     if (result.success != null) {
//         return callback(undefined, result.success)
//     }
//     {{/isVoid}}
//     return callback(new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, "{{name}} failed: unknown result"))
// }
function createRecvMethodForDefinition(service: ServiceDefinition, def: FunctionDefinition): ts.MethodDeclaration {
  return ts.createMethod(
    undefined, // decorators
    [ ts.createToken(ts.SyntaxKind.PublicKeyword) ], // modifiers
    undefined, // asterisk token
    `recv_${def.name.value}`, // method name
    undefined, // question token
    undefined, // type parameters
    [
      createFunctionParameter(
        COMMON_IDENTIFIERS.input,
        ts.createTypeReferenceNode(
          COMMON_IDENTIFIERS.TProtocol,
          undefined
        )
      ),
      createFunctionParameter(
        ts.createIdentifier('mtype'),
        ts.createTypeReferenceNode(
          COMMON_IDENTIFIERS.MessageType,
          undefined
        )
      ),
      createFunctionParameter(
        ts.createIdentifier('rseqid'),
        createNumberType()
      )
    ], // parameters
    createVoidType(), // return type
    ts.createBlock([
      // const noop = () => null
      createConstStatement(
        ts.createIdentifier('noop'),
        undefined,
        ts.createArrowFunction(
          undefined,
          undefined,
          [],
          createAnyType(),
          undefined,
          ts.createIdentifier('null')
        )
      ),

      // const callback = this._reqs[rseqid] || noop
      createConstStatement(
        COMMON_IDENTIFIERS.callback,
        undefined,
        ts.createBinary(
          ts.createElementAccess(
            ts.createIdentifier('this._reqs'),
            ts.createIdentifier('rseqid')
          ),
          ts.SyntaxKind.BarBarToken,
          ts.createIdentifier('noop')
        )
      ),

      // if (mtype === Thrift.MessageType.EXCEPTION) {
      //     const x = new Thrift.TApplicationException()
      //     x.read(input)
      //     input.readMessageEnd()
      //     return callback(x)
      // }
      createExceptionHandler(),

      // const result = new {{ServiceName}}{{nameTitleCase}}Result()
      createNewResultInstance(def),

      // result.read(input)
      createMethodCallStatement(
        ts.createIdentifier('result'),
        'read',
        [ COMMON_IDENTIFIERS.input ]
      ),

      // input.readMessageEnd()
      createMethodCallStatement(
        COMMON_IDENTIFIERS.input,
        'readMessageEnd'
      ),

      // {{#throws}}if (result.{{throwName}} != null) {
      //     return callback(result.{{throwName}})
      // }
      ...def.throws.map((next: FieldDefinition): ts.IfStatement => {
        return ts.createIf(
          createNotNull(`result.${next.name.value}`),
          ts.createBlock([
            ts.createReturn(
              ts.createCall(
                COMMON_IDENTIFIERS.callback,
                undefined,
                [ ts.createIdentifier(`result.${next.name.value}`) ]
              )
            )
          ], true)
        )
      }),

      createResultHandler(def)
    ], true)
  )
}

function createNewResultInstance(def: FunctionDefinition): ts.Statement {
  return createConstStatement(
    ts.createIdentifier('result'),
    ts.createTypeReferenceNode(
      ts.createIdentifier(createStructResultName(def)),
      undefined
    ),
    ts.createNew(
      ts.createIdentifier(createStructResultName(def)),
      undefined,
      []
    )
  )
}

function createExceptionHandler(): ts.Statement {
  return ts.createIf(
    ts.createBinary(
      ts.createIdentifier('mtype'),
      ts.SyntaxKind.EqualsEqualsEqualsToken,
      MESSAGE_TYPE.EXCEPTION
    ),
    ts.createBlock([
      createConstStatement(
        ts.createIdentifier('x'),
        ts.createTypeReferenceNode(COMMON_IDENTIFIERS.TApplicationException, undefined),
        ts.createNew(
          COMMON_IDENTIFIERS.TApplicationException,
          undefined,
          []
        )
      ),
      createMethodCallStatement(
        ts.createIdentifier('x'),
        'read',
        [ COMMON_IDENTIFIERS.input ]
      ),
      createMethodCallStatement(
        COMMON_IDENTIFIERS.input,
        'readMessageEnd'
      ),
      ts.createReturn(
        ts.createCall(
          COMMON_IDENTIFIERS.callback,
          undefined,
          [ ts.createIdentifier('x') ]
        )
      )
    ], true)
  )
}

function createResultHandler(def: FunctionDefinition): ts.Statement {

  if (def.returnType.type === SyntaxType.VoidKeyword) {
    return ts.createReturn(
      ts.createCall(
        COMMON_IDENTIFIERS.callback,
        undefined,
        [
          COMMON_IDENTIFIERS.undefined
        ]
      )
    )
  } else {
    // {{^isVoid}}
    // if (result.success != null) {
    //     return callback(undefined, result.success)
    // }
    // {{/isVoid}}
    return ts.createIf(
      createNotNull(
        ts.createIdentifier('result.success')
      ),
      ts.createBlock([
        ts.createReturn(
          ts.createCall(
            COMMON_IDENTIFIERS.callback,
            undefined,
            [
              COMMON_IDENTIFIERS.undefined,
              ts.createIdentifier('result.success')
            ]
          )
        )
      ], true),
      ts.createBlock([
        // return callback(new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, "{{name}} failed: unknown result"))
        ts.createReturn(
          ts.createCall(
            COMMON_IDENTIFIERS.callback,
            undefined,
            [
              createApplicationException(
                'UNKNOWN',
                `${def.name.value} failed: unknown result`
              )
            ]
          )
        )
      ], true)
    )
  }
}

function createParametersForField(field: FieldDefinition): ts.ParameterDeclaration {
  return createFunctionParameter(
    field.name.value,
    typeNodeForFieldType(field.fieldType)
  )
}
