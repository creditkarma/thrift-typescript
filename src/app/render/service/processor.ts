import * as ts from 'typescript'

import {
  ServiceDefinition,
  FunctionDefinition,
  FieldDefinition
} from '@creditkarma/thrift-parser'

import {
  TProtocolType,
  ContextType,
  createReadMessageType
} from './types'

import {
  createStructArgsName,
  createStructResultName
} from './utils'

import {
  createPublicMethod,
  createClassConstructor,
  createFunctionParameter,
  createAssignmentStatement,
  createConstStatement,
  createLetStatement,
  createMethodCall,
  createMethodCallStatement,
  createNotNull,
  createApplicationException,
  createPromise,
  createCallStatement
} from '../utils'

import {
  createStringType,
  createNumberType,
  createVoidType,
  typeNodeForFieldType,
  constructorNameForFieldType
} from '../types'

export function renderProcessor(node: ServiceDefinition): ts.ClassDeclaration {
  // private _handler
  const handler: ts.PropertyDeclaration = ts.createProperty(
    undefined,
    [ ts.createToken(ts.SyntaxKind.PrivateKeyword) ],
    '_handler',
    undefined,
    undefined,
    undefined
  )

  const ctor: ts.ConstructorDeclaration = createClassConstructor(
    [ createFunctionParameter('handler', undefined) ],
    [
      createAssignmentStatement(
        ts.createIdentifier('this._handler'),
        ts.createIdentifier('handler')
      )
    ]
  )

  const processMethod: ts.MethodDeclaration = createProcessMethod()
  const processFunctions: Array<ts.MethodDeclaration> = node.functions.map((next: FunctionDefinition) => {
    return createProcessFunctionMethod(node, next);
  });

  // export class <node.name> { ... }
  return ts.createClassDeclaration(
    undefined, // decorators
    [ ts.createToken(ts.SyntaxKind.ExportKeyword) ], // modifiers
    'Processor', // name
    [ ts.createTypeParameterDeclaration('Context') ], // type parameters
    [], // heritage
    [
      handler,
      ctor,
      processMethod,
      ...processFunctions
    ] // body
  )
}

// public process_{{name}}(seqid: number, input: TProtocol, output: TProtocol, context: Context) {
//     const args = new {{ServiceName}}{{nameTitleCase}}Args()
//     args.read(input)
//     input.readMessageEnd()
//     new Promise<{{typeName}}>((resolve, reject) => {
//         try {
//             resolve(
//                 this._handler.{{name}}({{#args}}args.{{fieldName}}, {{/args}}context)
//             )
//         } catch (e) {
//             reject(e)
//         }
//     }).then((data: {{typeName}}) => {
//         const result = new {{ServiceName}}{{nameTitleCase}}Result({success: data})
//         output.writeMessageBegin("{{name}}", Thrift.MessageType.REPLY, seqid)
//         result.write(output)
//         output.writeMessageEnd()
//         output.flush()
//     }).catch((err: Error) => {
//         let result
//         {{#hasThrows}}{{#throws}}if (err instanceof {{throwType}}) {
//             result = new {{ServiceName}}{{nameTitleCase}}Result()
//             result.populate({{{throwName}}: err as {{throwType}}})
//             output.writeMessageBegin("{{name}}", Thrift.MessageType.REPLY, seqid)
//         } else {{/throws}}{
//             result = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, err.message)
//             output.writeMessageBegin("{{name}}", Thrift.MessageType.EXCEPTION, seqid)
//         }
//         {{/hasThrows}}
//         {{^hasThrows}}
//         result = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, err.message)
//         output.writeMessageBegin("{{name}}", Thrift.MessageType.EXCEPTION, seqid)
//         {{/hasThrows}}
//         result.write(output)
//         output.writeMessageEnd()
//         output.flush()
//     })
// }
function createProcessFunctionMethod(service: ServiceDefinition, funcDef: FunctionDefinition): ts.MethodDeclaration {
  return createPublicMethod(
    `process_${funcDef.name.value}`,
    [
      createFunctionParameter('seqid', createNumberType()),
      createFunctionParameter('input', TProtocolType),
      createFunctionParameter('output', TProtocolType),
      createFunctionParameter('context', ContextType)
    ], // parameters
    createVoidType(), // return type
    [
      createConstStatement(
        ts.createIdentifier('args'),
        undefined,
        ts.createNew(
          ts.createIdentifier(createStructArgsName(service, funcDef)),
          [],
          []
        )
      ),
      // args.read(input);
      createMethodCallStatement(
        ts.createIdentifier('args'),
        'read',
        [ ts.createIdentifier('input') ]
      ),
      // input.readMessageEnd();
      createMethodCallStatement(
        ts.createIdentifier('input'),
        'readMessageEnd'
      ),
      // new Promise<{{typeName}}>((resolve, reject) => {
      ts.createStatement(
        createMethodCall(
          createMethodCall(
            createPromise(
              typeNodeForFieldType(funcDef.returnType),
              [
                // try {
                //     resolve(
                //         this._handler.{{name}}({{#args}}args.{{fieldName}}, {{/args}}context)
                //     )
                // } catch (e) {
                //     reject(e)
                // }
                ts.createTry(
                  ts.createBlock([
                    createCallStatement(
                      ts.createIdentifier('resolve'),
                      [
                        createMethodCall(
                          ts.createIdentifier('this._handler'),
                          funcDef.name.value,
                          [
                            ...funcDef.fields.map((next: FieldDefinition) => {
                              return ts.createIdentifier(`args.${next.name.value}`)
                            }),
                            ts.createIdentifier('context')
                          ]
                        )
                      ]
                    )
                  ], true),
                  ts.createCatchClause(
                    ts.createVariableDeclaration('err'),
                    ts.createBlock([
                      createCallStatement(
                        ts.createIdentifier('reject'),
                        [ ts.createIdentifier('err') ]
                      )
                    ], true)
                  ),
                  undefined
                )
              ]
            ),
            'then',
            [
              // }).then((data: {{typeName}}) => {
              ts.createArrowFunction(
                undefined,
                undefined,
                [
                  createFunctionParameter(
                    ts.createIdentifier('data'),
                    typeNodeForFieldType(funcDef.returnType)
                  )
                ],
                createVoidType(),
                undefined,
                ts.createBlock([
                  // const result = new {{ServiceName}}{{nameTitleCase}}Result({success: data})
                  createConstStatement(
                    ts.createIdentifier('result'),
                    undefined,
                    ts.createNew(
                      ts.createIdentifier(createStructResultName(service, funcDef)),
                      undefined,
                      [
                        ts.createObjectLiteral(
                          [
                            ts.createPropertyAssignment(
                              ts.createIdentifier('success'),
                              ts.createIdentifier('data')
                            )
                          ]
                        )
                      ]
                    )
                  ),
                  // output.writeMessageBegin("{{name}}", Thrift.MessageType.REPLY, seqid)
                  createMethodCallStatement(
                    ts.createIdentifier('output'),
                    'writeMessageBegin',
                    [
                      ts.createLiteral(funcDef.name.value),
                      ts.createIdentifier('Thrift.MessageType.REPLY'),
                      ts.createIdentifier('seqid')
                    ]
                  ),
                  // result.write(output)
                  createMethodCallStatement(
                    ts.createIdentifier('result'),
                    'write',
                    [
                      ts.createIdentifier('output')
                    ]
                  ),
                  // output.writeMessageEnd()
                  createMethodCallStatement(
                    ts.createIdentifier('output'),
                    'writeMessageEnd',
                    []
                  ),
                  // output.flush()
                  createMethodCallStatement(
                    ts.createIdentifier('output'),
                    'flush',
                    []
                  ),
                ], true)
              )
            ]
          ),
          'catch',
          [
            ts.createArrowFunction(
              undefined,
              undefined,
              [
                createFunctionParameter(
                  ts.createIdentifier('err'),
                  ts.createTypeReferenceNode(
                    ts.createIdentifier('Error'),
                    undefined
                  )
                )
              ],
              createVoidType(),
              undefined,
              ts.createBlock([
                // let result;
                createLetStatement(
                  ts.createIdentifier('result')
                ),
                // if (def.throws.length > 0)
                ts.createIf(
                  ts.createBinary(
                    ts.createLiteral(funcDef.throws.length),
                    ts.SyntaxKind.GreaterThanToken,
                    ts.createLiteral(0)
                  ),
                  ts.createBlock([
                    ...funcDef.throws.map((throwDef: FieldDefinition): ts.IfStatement => {
                      // if (err instanceof {{throwType}}) {
                      return ts.createIf(
                        ts.createBinary(
                          ts.createIdentifier('err'),
                          ts.SyntaxKind.InstanceOfKeyword,
                          constructorNameForFieldType(throwDef.fieldType)
                        ),
                        ts.createBlock([
                          // result = new {{ServiceName}}{{nameTitleCase}}Result({{{throwName}}: err as {{throwType}}})
                          createAssignmentStatement(
                            ts.createIdentifier('result'),
                            ts.createNew(
                              ts.createIdentifier(createStructResultName(service, funcDef)),
                              undefined,
                              [
                                ts.createObjectLiteral(
                                  [
                                    ts.createPropertyAssignment(
                                      ts.createIdentifier(throwDef.name.value),
                                      ts.createIdentifier('err')
                                    )
                                  ]
                                )
                              ]
                            )
                          ),
                          // output.writeMessageBegin("{{name}}", Thrift.MessageType.REPLY, seqid)
                          createMethodCallStatement(
                            ts.createIdentifier('output'),
                            'writeMessageBegin',
                            [
                              ts.createLiteral(funcDef.name.value),
                              ts.createIdentifier('Thrift.MessageType.REPLY'),
                              ts.createIdentifier('seqid')
                            ]
                          )
                        ], true),
                        ts.createBlock([
                          // result = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, err.message)
                          createAssignmentStatement(
                            ts.createIdentifier('result'),
                            createApplicationException(
                              'TApplicationExceptionType.UNKNOWN',
                              ts.createIdentifier('err.message')
                            )
                          ),
                          // output.writeMessageBegin("{{name}}", Thrift.MessageType.EXCEPTION, seqid)
                          createMethodCallStatement(
                            ts.createIdentifier('output'),
                            'writeMessageBegin',
                            [
                              ts.createLiteral(funcDef.name.value),
                              ts.createIdentifier('Thrift.MessageType.EXCEPTION'),
                              ts.createIdentifier('seqid')
                            ]
                          )
                        ], true)
                      )
                    })
                  ], true),
                  ts.createBlock([
                    // result = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, err.message)
                    createAssignmentStatement(
                      ts.createIdentifier('result'),
                      createApplicationException(
                        'TApplicationExceptionType.UNKNOWN',
                        ts.createIdentifier('err.message')
                      )
                    ),
                    // output.writeMessageBegin("{{name}}", Thrift.MessageType.EXCEPTION, seqid)
                    createMethodCallStatement(
                      ts.createIdentifier('output'),
                      'writeMessageBegin',
                      [
                        ts.createLiteral(funcDef.name.value),
                        ts.createIdentifier('Thrift.MessageType.EXCEPTION'),
                        ts.createIdentifier('seqid')
                      ]
                    )
                  ], true)
                ),
                // result.write(output)
                createMethodCallStatement(
                  ts.createIdentifier('result'),
                  'write',
                  [
                    ts.createIdentifier('output')
                  ]
                ),
                // output.writeMessageEnd()
                createMethodCallStatement(
                  ts.createIdentifier('output'),
                  'writeMessageEnd'
                ),
                // output.flush()
                createMethodCallStatement(
                  ts.createIdentifier('output'),
                  'flush'
                ),
              ], true)
            )
          ]
        )
      )
    ] // body
  )
}

// public process(input: TProtocol, output: TProtocol, context: Context) {
//     const metadata = input.readMessageBegin()
//     const fname = metadata.fname;
//     const rseqid = metadata.rseqid;
//     if (this["process_" + fname]) {
//         return this["process_" + fname].call(this, rseqid, input, output, context)
//     } else {
//         input.skip(Thrift.Type.STRUCT)
//         input.readMessageEnd()
//         const errMessage = `Unknown function ${fname}`
//         const err = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN_METHOD, errMessage)
//         output.writeMessageBegin(fname, Thrift.MessageType.EXCEPTION, rseqid)
//         err.write(output)
//         output.writeMessageEnd()
//         output.flush()
//     }
// }
function createProcessMethod(): ts.MethodDeclaration {
  return createPublicMethod(
    'process',
    [
      createFunctionParameter('input', TProtocolType),
      createFunctionParameter('output', TProtocolType),
      createFunctionParameter('context', ContextType)
    ], // parameters
    createVoidType(), // return type
    [
      createConstStatement(
        'metadata',
        createReadMessageType(),
        createMethodCall(
          ts.createIdentifier('input'),
          'readMessageBegin',
          []
        )
      ),
      createConstStatement(
        'fname',
        createStringType(),
        ts.createIdentifier('metadata.fname')
      ),
      createConstStatement(
        'rseqid',
        createNumberType(),
        ts.createIdentifier('metadata.rseqid')
      ),
      ts.createIf(
        createNotNull(
          createFnameAccess()
        ),
        ts.createBlock([
          // return this["process_" + fname].call(this, rseqid, input, output, context)
          ts.createReturn(
            createMethodCall(
              createFnameAccess(),
              'call',
              [
                ts.createIdentifier('this'),
                ts.createIdentifier('rseqid'),
                ts.createIdentifier('input'),
                ts.createIdentifier('output'),
                ts.createIdentifier('context'),
              ]
            )
          )
        ], true),
        ts.createBlock([
          // input.skip(Thrift.Type.STRUCT)
          createMethodCallStatement(
            ts.createIdentifier('input'),
            'skip',
            [ ts.createIdentifier('Thrift.Type.STRUCT') ]
          ),
          // input.readMessageEnd()
          createMethodCallStatement(
            ts.createIdentifier('input'),
            'readMessageEnd'
          ),
          // const err = `Unknown function ${fname}`
          createConstStatement(
            ts.createIdentifier('errMessage'),
            undefined,
            ts.createBinary(
              ts.createLiteral('Unknown function '),
              ts.SyntaxKind.PlusToken,
              ts.createIdentifier('fname')
            )
          ),
          // const x = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN_METHOD, err)
          createConstStatement(
            ts.createIdentifier('err'),
            undefined,
            createApplicationException(
              'TApplicationExceptionType.UNKNOWN_METHOD',
              ts.createIdentifier('errMessage')
            )
          ),
          // output.writeMessageBegin(fname, Thrift.MessageType.EXCEPTION, rseqid)
          createMethodCallStatement(
            ts.createIdentifier('output'),
            'writeMessageBegin',
            [
              ts.createIdentifier('fname'),
              ts.createIdentifier('Thrift.MessageType.EXCEPTION'),
              ts.createIdentifier('rseqid')
            ]
          ),
          // err.write(output)
          createMethodCallStatement(
            ts.createIdentifier('err'),
            'write',
            [ ts.createIdentifier('output') ]
          ),
          // output.writeMessageEnd()
          createMethodCallStatement(
            ts.createIdentifier('output'),
            'writeMessageEnd'
          ),
          // output.flush()
          createMethodCallStatement(
            ts.createIdentifier('output'),
            'flush'
          )
        ], true)
      )
    ] // body
  )
}

function createFnameAccess(): ts.ElementAccessExpression {
  return ts.createElementAccess(
    ts.createIdentifier('this'),
    ts.createBinary(
      ts.createLiteral('process_'),
      ts.SyntaxKind.PlusToken,
      ts.createIdentifier('fname')
    )
  )
}
