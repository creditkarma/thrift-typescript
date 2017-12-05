import * as ts from 'typescript'

import {
  ServiceDefinition,
  FunctionDefinition,
  FieldDefinition,
  ThriftStatement,
  SyntaxType,
} from '@creditkarma/thrift-parser'

import {
  TProtocolType,
  ContextType,
} from './types'

import {
  createStructArgsName,
  createStructResultName,
} from './utils'

import {
  createPublicMethod,
  createClassConstructor,
  createFunctionParameter,
  createAssignmentStatement,
  createConstStatement,
  createMethodCall,
  createMethodCallStatement,
  createApplicationException,
  createPromise,
  createCallStatement
} from '../utils'

import {
  IIdentifierMap
} from '../../../types'

import {
  createVoidType,
  createStringType,
  createNumberType,
  createAnyType,
  typeNodeForFieldType,
  constructorNameForFieldType,
} from '../types'

import {
  COMMON_IDENTIFIERS,
  MESSAGE_TYPE,
  THRIFT_TYPES,
} from '../identifiers'

/**
 * // thrift
 * service MyService {
 *   i32 add(1: i32 a, 2: i32 b)
 * }
 *
 * // typescript
 * interface IMyServiceHandler<Context> {
 *   add(a: number, b: number, context: Context): number
 * }
 * @param service
 */
export function renderHandlerInterface(service: ServiceDefinition): Array<ts.Statement> {
  const signatures = service.functions.map((func: FunctionDefinition) => {
    return ts.createPropertySignature(
      undefined,
      func.name.value,
      undefined,
      ts.createFunctionTypeNode(
        undefined,
        [
          ...func.fields.map((field: FieldDefinition) => {
            return createFunctionParameter(
              field.name.value,
              typeNodeForFieldType(field.fieldType)
            )
          }),
          createFunctionParameter(
            'context',
            ts.createTypeReferenceNode('Context', undefined),
            undefined,
            true
          )
        ],
        ts.createUnionTypeNode([
          typeNodeForFieldType(func.returnType),
          ts.createTypeReferenceNode(
            COMMON_IDENTIFIERS.Promise,
            [ typeNodeForFieldType(func.returnType) ]
          )
        ])
      ),
      undefined
    )
  })

  if (service.extends !== null) {
    return [
      ts.createInterfaceDeclaration(
        undefined,
        [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
        ts.createIdentifier('ILocalHandler'),
        [
          ts.createTypeParameterDeclaration(
            ts.createIdentifier('Context'),
            undefined,
            createAnyType(),
          )
        ],
        [],
        signatures,
      ),
      ts.createTypeAliasDeclaration(
        undefined,
        [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
        ts.createIdentifier('IHandler'),
        [
          ts.createTypeParameterDeclaration(
            ts.createIdentifier('Context'),
            undefined,
            createAnyType()
          )
        ],
        ts.createIntersectionTypeNode([
          ts.createTypeReferenceNode(
            ts.createIdentifier('ILocalHandler'),
            [
              ts.createTypeReferenceNode('Context', undefined)
            ]
          ),
          ts.createTypeReferenceNode(
            ts.createIdentifier(`${service.extends.value}.IHandler`),
            [
              ts.createTypeReferenceNode('Context', undefined)
            ]
          )
        ])
      )
    ]
  } else {
    return [
      ts.createInterfaceDeclaration(
        undefined,
        [ ts.createToken(ts.SyntaxKind.ExportKeyword) ],
        ts.createIdentifier('IHandler'),
        [
          ts.createTypeParameterDeclaration(
            ts.createIdentifier('Context'),
            undefined,
            createAnyType()
          )
        ],
        [],
        signatures,
      )
    ]
  }
}

function objectLiteralForServiceFunctions(node: ThriftStatement): ts.ObjectLiteralExpression {
  switch (node.type) {
    case SyntaxType.ServiceDefinition:
      return ts.createObjectLiteral(
        node.functions.map((next: FunctionDefinition): ts.PropertyAssignment => {
          return ts.createPropertyAssignment(
            ts.createIdentifier(next.name.value),
            ts.createIdentifier(`handler.${next.name.value}`)
          )
        }),
        true
      )

    default:
      throw new TypeError(`A service can only extend another service. Found: ${node.type}`);
  }
}

function handlerType(node: ServiceDefinition): ts.TypeNode {
  return ts.createTypeReferenceNode(
    ts.createIdentifier('IHandler'),
    [ ts.createTypeReferenceNode('Context', undefined) ]
  )
}

export function renderProcessor(node: ServiceDefinition, identifiers: IIdentifierMap): ts.ClassDeclaration {
  // private _handler
  const handler: ts.PropertyDeclaration = ts.createProperty(
    undefined,
    [ ts.createToken(ts.SyntaxKind.PublicKeyword) ],
    '_handler',
    undefined,
    handlerType(node),
    undefined
  )

  const ctor: ts.ConstructorDeclaration = createClassConstructor(
    [
      createFunctionParameter(
        ts.createIdentifier('handler'),
        handlerType(node)
      )
    ],
    [
      ...(
        (node.extends !== null) ?
          [
            ts.createStatement(ts.createCall(
              ts.createSuper(),
              [],
              [
                objectLiteralForServiceFunctions(
                  identifiers[node.extends.value].definition
                )
              ]
            ))
          ] :
          []
      ),
      createAssignmentStatement(
        ts.createIdentifier('this._handler'),
        ts.createIdentifier('handler'),
      )
    ]
  )

  const processMethod: ts.MethodDeclaration = createProcessMethod(node, identifiers)
  const processFunctions: Array<ts.MethodDeclaration> = node.functions.map((next: FunctionDefinition) => {
    return createProcessFunctionMethod(node, next);
  });

  const heritage: Array<ts.HeritageClause> = (
    (node.extends !== null) ?
      [
        ts.createHeritageClause(
          ts.SyntaxKind.ExtendsKeyword,
          [
            ts.createExpressionWithTypeArguments(
              [ ts.createTypeReferenceNode(ts.createIdentifier('Context'), undefined) ],
              ts.createIdentifier(`${node.extends.value}.Processor`),
            )
          ]
        )
      ] :
      []
  )

  // export class <node.name> { ... }
  return ts.createClassDeclaration(
    undefined, // decorators
    [
      ts.createToken(ts.SyntaxKind.ExportKeyword)
    ], // modifiers
    'Processor', // name
    [
      ts.createTypeParameterDeclaration(
        'Context',
        undefined,
        createAnyType()
      )
    ], // type parameters
    heritage, // heritage
    [
      handler,
      ctor,
      processMethod,
      ...processFunctions
    ] // body
  )
}

// public process_{{name}}(seqid: number, input: TProtocol, output: TProtocol, context: Context): Promise<Buffer> {
//     return new Promise<{{typeName}}>((resolve, reject) => {
//         try {
//             resolve(
//                 const args = new {{ServiceName}}{{nameTitleCase}}Args()
//                 args.read(input)
//                 input.readMessageEnd()
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
//         return output.flush()
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
//         return output.flush()
//     })
// }
function createProcessFunctionMethod(service: ServiceDefinition, funcDef: FunctionDefinition): ts.MethodDeclaration {
  return createPublicMethod(
    `process_${funcDef.name.value}`,
    [
      createFunctionParameter('seqid', createNumberType()),
      createFunctionParameter('input', TProtocolType),
      createFunctionParameter('output', TProtocolType),
      createFunctionParameter('context', ContextType, undefined, true)
    ], // parameters
    ts.createTypeReferenceNode(
      ts.createIdentifier('Promise<Buffer>'),
      undefined
    ), // return type
    [
      // new Promise<{{typeName}}>((resolve, reject) => {
      ts.createReturn(
        createMethodCall(
          createMethodCall(
            createPromise(
              typeNodeForFieldType(funcDef.returnType),
              createVoidType(),
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
                    ...(funcDef.fields.length > 0) ?
                      [ createConstStatement(
                        COMMON_IDENTIFIERS.args,
                        ts.createTypeReferenceNode(
                          ts.createIdentifier(createStructArgsName(funcDef)),
                          undefined
                        ),
                        ts.createCall(
                          ts.createPropertyAccess(
                            ts.createIdentifier(createStructArgsName(funcDef)),
                            ts.createIdentifier('read')
                          ),
                          undefined,
                          [ COMMON_IDENTIFIERS.input ]
                        )
                      ) ] :
                      [],
                    // input.readMessageEnd();
                    createMethodCallStatement(
                      COMMON_IDENTIFIERS.input,
                      'readMessageEnd'
                    ),
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
                ts.createTypeReferenceNode(
                  COMMON_IDENTIFIERS.Buffer,
                  undefined
                ),
                undefined,
                ts.createBlock([
                  // const result = new {{ServiceName}}{{nameTitleCase}}Result({success: data})
                  createConstStatement(
                    ts.createIdentifier('result'),
                    ts.createTypeReferenceNode(
                      ts.createIdentifier(createStructResultName(funcDef)),
                      undefined
                    ),
                    ts.createNew(
                      ts.createIdentifier(createStructResultName(funcDef)),
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
                    COMMON_IDENTIFIERS.output,
                    'writeMessageBegin',
                    [
                      ts.createLiteral(funcDef.name.value),
                      MESSAGE_TYPE.REPLY,
                      ts.createIdentifier('seqid')
                    ]
                  ),
                  // result.write(output)
                  createMethodCallStatement(
                    ts.createIdentifier('result'),
                    'write',
                    [
                      COMMON_IDENTIFIERS.output
                    ]
                  ),
                  // output.writeMessageEnd()
                  createMethodCallStatement(
                    COMMON_IDENTIFIERS.output,
                    'writeMessageEnd',
                    []
                  ),
                  // return output.flush()
                  ts.createReturn(
                    ts.createCall(
                      ts.createPropertyAccess(
                        COMMON_IDENTIFIERS.output,
                        'flush'
                      ),
                      undefined,
                      []
                    )
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
              ts.createTypeReferenceNode(
                COMMON_IDENTIFIERS.Buffer,
                undefined
              ),
              undefined,
              ts.createBlock([
                // if (def.throws.length > 0)
                ...createExceptionHandlers(funcDef)
              ], true)
            )
          ]
        )
      )
    ] // body
  )
}

function createExceptionHandlers(funcDef: FunctionDefinition): Array<ts.Statement> {
  if (funcDef.throws.length > 0) {
    return funcDef.throws.map((throwDef: FieldDefinition): ts.IfStatement => {
      // if (err instanceof {{throwType}}) {
      return ts.createIf(
        ts.createBinary(
          ts.createIdentifier('err'),
          ts.SyntaxKind.InstanceOfKeyword,
          constructorNameForFieldType(throwDef.fieldType)
        ),
        ts.createBlock([
          // const result: {{throwType}} = new {{ServiceName}}{{nameTitleCase}}Result({{{throwName}}: err as {{throwType}}});
          createConstStatement(
            ts.createIdentifier('result'),
            ts.createTypeReferenceNode(
              ts.createIdentifier(createStructResultName(funcDef)),
              undefined
            ),
            ts.createNew(
              ts.createIdentifier(createStructResultName(funcDef)),
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

            COMMON_IDENTIFIERS.output,
            'writeMessageBegin',
            [
              ts.createLiteral(funcDef.name.value),
              MESSAGE_TYPE.REPLY,
              ts.createIdentifier('seqid')
            ]
          ),
          // result.write(output)
          createMethodCallStatement(
            ts.createIdentifier('result'),
            'write',
            [
              COMMON_IDENTIFIERS.output
            ]
          ),
          // output.writeMessageEnd()
          createMethodCallStatement(
            COMMON_IDENTIFIERS.output,
            'writeMessageEnd'
          ),
          // return output.flush()
          ts.createReturn(
            ts.createCall(
              ts.createPropertyAccess(
                COMMON_IDENTIFIERS.output,
                'flush'
              ),
              undefined,
              []
            )
          ),
        ], true),
        ts.createBlock([
          // const result: Thrift.TApplicationException = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, err.message)
          createConstStatement(
            ts.createIdentifier('result'),
            ts.createTypeReferenceNode(
              COMMON_IDENTIFIERS.TApplicationException,
              undefined
            ),
            createApplicationException(
              'UNKNOWN',
              ts.createIdentifier('err.message')
            )
          ),
          // output.writeMessageBegin("{{name}}", Thrift.MessageType.EXCEPTION, seqid)
          createMethodCallStatement(
            COMMON_IDENTIFIERS.output,
            'writeMessageBegin',
            [
              ts.createLiteral(funcDef.name.value),
              MESSAGE_TYPE.EXCEPTION,
              ts.createIdentifier('seqid')
            ]
          ),
          // result.write(output)
          createMethodCallStatement(
            ts.createIdentifier('result'),
            'write',
            [
              COMMON_IDENTIFIERS.output
            ]
          ),
          // output.writeMessageEnd()
          createMethodCallStatement(
            COMMON_IDENTIFIERS.output,
            'writeMessageEnd'
          ),
          // return output.flush()
          ts.createReturn(
            ts.createCall(
              ts.createPropertyAccess(
                COMMON_IDENTIFIERS.output,
                'flush'
              ),
              undefined,
              []
            )
          ),
        ], true)
      )
    })
  } else {
    return [
      // const result: Thrift.TApplicationException = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN, err.message)
      createConstStatement(
        ts.createIdentifier('result'),
        ts.createTypeReferenceNode(
          COMMON_IDENTIFIERS.TApplicationException,
          undefined
        ),
        createApplicationException(
          'UNKNOWN',
          ts.createIdentifier('err.message')
        )
      ),
      // output.writeMessageBegin("{{name}}", Thrift.MessageType.EXCEPTION, seqid)
      createMethodCallStatement(
        COMMON_IDENTIFIERS.output,
        'writeMessageBegin',
        [
          ts.createLiteral(funcDef.name.value),
          MESSAGE_TYPE.EXCEPTION,
          ts.createIdentifier('seqid')
        ]
      ),
      // result.write(output)
      createMethodCallStatement(
        ts.createIdentifier('result'),
        'write',
        [
          COMMON_IDENTIFIERS.output
        ]
      ),
      // output.writeMessageEnd()
      createMethodCallStatement(
        COMMON_IDENTIFIERS.output,
        'writeMessageEnd'
      ),
      // return output.flush()
      ts.createReturn(
        ts.createCall(
          ts.createPropertyAccess(
            COMMON_IDENTIFIERS.output,
            'flush'
          ),
          undefined,
          []
        )
      ),
    ]
  }
}

// public process(input: TProtocol, output: TProtocol, context: Context): Promise<Buffer> {
//     const metadata = input.readMessageBegin()
//     const fieldName = metadata.fieldName;
//     const requestId = metadata.requestId;
//     const methodName: string = "process_" + fieldName;
//     switch (methodName) {
//       case "process_ping":
//         return this.process_ping(requestId, input, output, context)
//
//       default:
//         ...skip logic
//     }
// }
function createProcessMethod(service: ServiceDefinition, identifiers: IIdentifierMap): ts.MethodDeclaration {
  return createPublicMethod(
    'process',
    [
      createFunctionParameter('input', TProtocolType),
      createFunctionParameter('output', TProtocolType),
      createFunctionParameter('context', ContextType, undefined, true)
    ], // parameters
    ts.createTypeReferenceNode(
      ts.createIdentifier('Promise<Buffer>'),
      undefined,
    ), // return type
    [
      ts.createReturn(
        createPromise(
          ts.createTypeReferenceNode(
            COMMON_IDENTIFIERS.Buffer,
            undefined,
          ),
          createVoidType(),
          [
            createConstStatement(
              'metadata',
              ts.createTypeReferenceNode(
                COMMON_IDENTIFIERS.IThriftMessage,
                undefined,
              ),
              createMethodCall(
                COMMON_IDENTIFIERS.input,
                'readMessageBegin',
                []
              )
            ),
            createConstStatement(
              'fieldName',
              createStringType(),
              ts.createIdentifier('metadata.fieldName')
            ),
            createConstStatement(
              'requestId',
              createNumberType(),
              ts.createIdentifier('metadata.requestId')
            ),
            createConstStatement(
              ts.createIdentifier('methodName'),
              createStringType(),
              ts.createBinary(
                ts.createLiteral('process_'),
                ts.SyntaxKind.PlusToken,
                COMMON_IDENTIFIERS.fieldName
              )
            ),
            createMethodCallForFname(service, identifiers)
          ]
        )
      ),
    ] // body
  )
}

function createMethodCallForFunction(func: FunctionDefinition): ts.CaseClause {
  const processMethodName: string = `process_${func.name.value}`
  return ts.createCaseClause(
    ts.createLiteral(processMethodName),
    [
      ts.createBlock([
        ts.createStatement(ts.createCall(
          ts.createIdentifier('resolve'),
          undefined,
          [
            createMethodCall(
              ts.createIdentifier('this'),
              processMethodName,
              [
                ts.createIdentifier('requestId'),
                COMMON_IDENTIFIERS.input,
                COMMON_IDENTIFIERS.output,
                ts.createIdentifier('context'),
              ]
            )
          ]
        ))
      ], true)
    ]
  )
}

function functionsForService(node: ThriftStatement): Array<FunctionDefinition> {
  switch (node.type) {
    case SyntaxType.ServiceDefinition:
      return node.functions

    default:
      throw new TypeError(`A service can only extend another service. Found: ${node.type}`);
  }
}

function collectAllMethods(service: ServiceDefinition, identifiers: IIdentifierMap): Array<FunctionDefinition> {
  if (service.extends !== null) {
    const inheritedMethods: Array<FunctionDefinition> = functionsForService(identifiers[service.extends.value].definition)
    return [
      ...inheritedMethods,
      ...service.functions,
    ]
  } else {
    return service.functions
  }
}

/**
 * In Scrooge we did something like this:
 *
 * if (this["process_" + fieldName]) {
 *   retrun this["process_" + fieldName].call(this, requestId, input, output, context)
 * } else {
 *   ...skip logic
 * }
 *
 * When doing this we lose type safety. When we use the dynamic index access to call the method
 * the method and this are inferred to be of type any.
 *
 * We can maintain type safety through the generated code by removing the dynamic index access
 * and replace with a switch that will do static method calls.
 *
 * const methodName: string = "process_" + fieldName;
 * switch (methodName) {
 *   case "process_ping":
 *     return this.process_ping(requestId, input, output, context)
 *
 *   default:
 *     ...skip logic
 * }
 *
 * @param service
 */
function createMethodCallForFname(service: ServiceDefinition, identifiers: IIdentifierMap): ts.SwitchStatement {
  return ts.createSwitch(
    ts.createIdentifier('methodName'),
    ts.createCaseBlock([
      ...collectAllMethods(service, identifiers).map(createMethodCallForFunction),
      ts.createDefaultClause([
        ts.createBlock([
          // input.skip(Thrift.Type.STRUCT)
          createMethodCallStatement(
            COMMON_IDENTIFIERS.input,
            'skip',
            [ THRIFT_TYPES.STRUCT ]
          ),
          // input.readMessageEnd()
          createMethodCallStatement(
            COMMON_IDENTIFIERS.input,
            'readMessageEnd'
          ),
          // const err = `Unknown function ${fieldName}`
          createConstStatement(
            ts.createIdentifier('errMessage'),
            undefined,
            ts.createBinary(
              ts.createLiteral('Unknown function '),
              ts.SyntaxKind.PlusToken,
              ts.createIdentifier('fieldName')
            )
          ),
          // const x = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN_METHOD, err)
          createConstStatement(
            ts.createIdentifier('err'),
            undefined,
            createApplicationException(
              'UNKNOWN_METHOD',
              ts.createIdentifier('errMessage')
            )
          ),
          // output.writeMessageBegin(fieldName, Thrift.MessageType.EXCEPTION, requestId)
          createMethodCallStatement(
            COMMON_IDENTIFIERS.output,
            'writeMessageBegin',
            [
              ts.createIdentifier('fieldName'),
              MESSAGE_TYPE.EXCEPTION,
              ts.createIdentifier('requestId')
            ]
          ),
          // err.write(output)
          createMethodCallStatement(
            ts.createIdentifier('err'),
            'write',
            [ COMMON_IDENTIFIERS.output ]
          ),
          // output.writeMessageEnd()
          createMethodCallStatement(
            COMMON_IDENTIFIERS.output,
            'writeMessageEnd'
          ),
          // return output.flush()
          ts.createStatement(ts.createCall(
            ts.createIdentifier('resolve'),
            undefined,
            [
              createMethodCall(
                COMMON_IDENTIFIERS.output,
                'flush'
              )
            ]
          ))
        ], true)
      ])
    ])
  )
}
