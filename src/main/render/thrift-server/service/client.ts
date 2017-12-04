import * as ts from 'typescript'

import {
  ServiceDefinition,
  FunctionDefinition,
  FieldDefinition,
  SyntaxType,
} from '@creditkarma/thrift-parser'

import {
  createReqType,
  createProtocolType,
  ContextType,
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
  createProtectedProperty,
  createApplicationException,
} from '../utils'

import {
  createNumberType,
  createVoidType,
  createAnyType,
  typeNodeForFieldType,
} from '../types'

import {
  COMMON_IDENTIFIERS,
  MESSAGE_TYPE,
} from '../identifiers'

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

  // private send: (data: Buffer, seqid: number, context: Context) => void;
  const sendCallback: ts.PropertyDeclaration = createProtectedProperty(
    'onSend',
    createSendCallbackType()
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
        createProtocolType(),
      ),
      createFunctionParameter(
        'callback',
        createSendCallbackType()
      )
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
                ts.createIdentifier('protocol'),
                ts.createIdentifier('callback'),
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
      ),
      createAssignmentStatement(
        ts.createIdentifier('this.onSend'),
        ts.createIdentifier('callback'),
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
              [
                ts.createTypeReferenceNode(ts.createIdentifier('Context'), undefined)
              ],
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
    [
      ts.createTypeParameterDeclaration(
        ts.createIdentifier('Context'),
        undefined,
        createAnyType()
      )
    ], // type parameters
    heritage, // heritage
    [
      seqid,
      reqs,
      output,
      protocol,
      sendCallback,
      ctor,
      incrementSeqIdMethod,
      ...baseMethods,
      ...sendMethods,
      ...recvMethods
    ] // body
  )
}

function createSendCallbackType(): ts.TypeNode {
  return ts.createFunctionTypeNode(
    undefined,
    [
      createFunctionParameter(
        ts.createIdentifier('data'),
        ts.createTypeReferenceNode('Buffer', undefined)
      ),
      createFunctionParameter(
        ts.createIdentifier('seqid'),
        createNumberType()
      ),
      createFunctionParameter(
        ts.createIdentifier('context'),
        ContextType,
        undefined,
        true,
      )
    ],
    createVoidType()
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
    [
      ...def.fields.map(createParametersForField),
      createFunctionParameter(
        ts.createIdentifier('context'),
        ContextType,
        undefined,
        true,
      )
    ], // parameters
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
          createVoidType(),
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
                ts.createIdentifier('requestId'),
                ts.createIdentifier('context')
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
      ),
      createFunctionParameter(
        ts.createIdentifier('context'),
        ContextType,
        undefined,
        true,
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
          [
            ts.createObjectLiteral(
              def.fields.map((next: FieldDefinition) => {
                return ts.createShorthandPropertyAssignment(next.name.value)
              })
            )
          ]
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
      // this.onSend
      ts.createStatement(createMethodCall(
        ts.createIdentifier('this'),
        'onSend',
        [
          createMethodCall(
            ts.createIdentifier('this.output'),
            'flush',
            []
          ),
          ts.createIdentifier('requestId'),
          ts.createIdentifier('context'),
        ]
      ))
    ], true) // body
  )
}

// public recv_{{name}}(input: TProtocol, messageType: Thrift.MessageType, requestId: number): void {
//     const noop = () => null
//     let callback = this._reqs[requestId] || noop
//     delete this._reqs[requestId]
//     if (messageType === Thrift.MessageType.EXCEPTION) {
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
        ts.createIdentifier('messageType'),
        ts.createTypeReferenceNode(
          COMMON_IDENTIFIERS.MessageType,
          undefined
        )
      ),
      createFunctionParameter(
        ts.createIdentifier('requestId'),
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

      // const callback = this._reqs[requestId] || noop
      createConstStatement(
        COMMON_IDENTIFIERS.callback,
        undefined,
        ts.createBinary(
          ts.createElementAccess(
            ts.createIdentifier('this._reqs'),
            ts.createIdentifier('requestId')
          ),
          ts.SyntaxKind.BarBarToken,
          ts.createIdentifier('noop')
        )
      ),

      // if (messageType === Thrift.MessageType.EXCEPTION) {
      //     const x = new Thrift.TApplicationException()
      //     x.read(input)
      //     input.readMessageEnd()
      //     return callback(x)
      // }
      createExceptionHandler(),

      // const result = new {{ServiceName}}{{nameTitleCase}}Result()
      ...createNewResultInstance(def),

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

// const result = new {{ServiceName}}{{nameTitleCase}}Result()
function createNewResultInstance(def: FunctionDefinition): Array<ts.Statement> {
  return [
    createConstStatement(
      ts.createIdentifier('result'),
      ts.createTypeReferenceNode(
        ts.createIdentifier(createStructResultName(def)),
        undefined
      ),
      ts.createCall(
        ts.createPropertyAccess(
          ts.createIdentifier(createStructResultName(def)),
          ts.createIdentifier('read')
        ),
        undefined,
        [ COMMON_IDENTIFIERS.input ],
      )
    ),
  ]
}

function createExceptionHandler(): ts.Statement {
  return ts.createIf(
    ts.createBinary(
      ts.createIdentifier('messageType'),
      ts.SyntaxKind.EqualsEqualsEqualsToken,
      MESSAGE_TYPE.EXCEPTION
    ),
    ts.createBlock([
      createConstStatement(
        ts.createIdentifier('x'),
        ts.createTypeReferenceNode(COMMON_IDENTIFIERS.TApplicationException, undefined),
        ts.createCall(
          ts.createPropertyAccess(
            COMMON_IDENTIFIERS.TApplicationException,
            ts.createIdentifier('read')
          ),
          undefined,
          [ COMMON_IDENTIFIERS.input ],
        )
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
          COMMON_IDENTIFIERS.undefined,
          ts.createIdentifier('result.success')
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
