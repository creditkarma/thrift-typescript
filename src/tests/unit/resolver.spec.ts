import { assert } from 'chai'

import {
  ThriftDocument,
  parse,
  SyntaxType,
  ExceptionDefinition
} from '@creditkarma/thrift-parser'

import { resolveIdentifiers } from '../../app/resolver'
import { IResolvedFile, IIncludeMap } from '../../app/types'

describe('Thrift TypeScript Resolver', () => {

  it('should find and resolve imported identifiers', () => {
    const content: string = `
      include "exception.thrift"

      service MyService {
        void ping() throws (1: exception.MyException exp)
      }
    `;
    const ast: ThriftDocument = parse(content)
    const mockIncludes: IIncludeMap = {
      exception: {
        sourcePath: 'exception.thrift',
        outPath: 'exception.ts',
        namespace: '',
        contents: '',
        includes: {},
        identifiers: {
          MyException: {
            name: 'MyException',
            resolvedName: 'MyException',
            definition: {
              type: SyntaxType.ExceptionDefinition,
              name: {
                type: SyntaxType.Identifier,
                value: 'MyException',
                loc: {
                  start: { line: 0, column: 0, index: 0 },
                  end: { line: 0, column: 0, index: 0 }
                }
              },
              fields: [],
              comments: [],
              loc: {
                start: { line: 0, column: 0, index: 0 },
                end: { line: 0, column: 0, index: 0 }
              }
            }
          }
        }
      }
    }
    const actual: IResolvedFile = resolveIdentifiers(ast, mockIncludes)
    const expected: IResolvedFile = {
      namespaces: {},
      includes: {
        exception: [
          {
            name: 'MyException',
            path: 'exception',
            resolvedName: 'exception$MyException'
          }
        ]
      },
      identifiers: {
        exception$MyException: {
          name: 'MyException',
          resolvedName: 'exception$MyException',
          definition: {
            type: SyntaxType.ExceptionDefinition,
            name: {
              type: SyntaxType.Identifier,
              value: 'MyException',
              loc: {
                start: {
                  line: 0,
                  column: 0,
                  index: 0
                },
                end: {
                  line: 0,
                  column: 0,
                  index: 0
                }
              }
            },
            fields: [],
            comments: [],
            loc: {
              start: {
                line: 0,
                column: 0,
                index: 0
              },
              end: {
                line: 0,
                column: 0,
                index: 0
              }
            }
          }
        }
      },
      body: [
        {
          type: SyntaxType.IncludeDefinition,
          path: {
            type: SyntaxType.StringLiteral,
            value: 'exception.thrift',
            loc: {
              start: {
                line: 2,
                column: 15,
                index: 15
              },
              end: {
                line: 2,
                column: 33,
                index: 33
              }
            }
          },
          comments: [],
          loc: {
            start: {
              line: 2,
              column: 7,
              index: 7
            },
            end: {
              line: 2,
              column: 33,
              index: 33
            }
          }
        },
        {
          type: SyntaxType.ServiceDefinition,
          name: {
            type: SyntaxType.Identifier,
            value: 'MyService',
            loc: {
              start: {
                line: 4,
                column: 15,
                index: 49
              },
              end: {
                line: 4,
                column: 24,
                index: 58
              }
            }
          },
          extends: null,
          functions: [
            {
              type: SyntaxType.FunctionDefinition,
              name: {
                type: SyntaxType.Identifier,
                value: 'ping',
                loc: {
                  start: {
                    line: 5,
                    column: 14,
                    index: 74
                  },
                  end: {
                    line: 5,
                    column: 18,
                    index: 78
                  }
                }
              },
              returnType: {
                type: SyntaxType.VoidKeyword,
                loc: {
                  start: {
                    line: 5,
                    column: 9,
                    index: 69
                  },
                  end: {
                    line: 5,
                    column: 13,
                    index: 73
                  }
                }
              },
              fields: [],
              throws: [
                {
                  type: SyntaxType.FieldDefinition,
                  name: {
                    type: SyntaxType.Identifier,
                    value: 'exp',
                    loc: {
                      start: {
                        line: 5,
                        column: 54,
                        index: 114
                      },
                      end: {
                        line: 5,
                        column: 57,
                        index: 117
                      }
                    }
                  },
                  fieldID: {
                    type: SyntaxType.FieldID,
                    value: 1,
                    loc: {
                      start: {
                        line: 5,
                        column: 29,
                        index: 89
                      },
                      end: {
                        line: 5,
                        column: 31,
                        index: 91
                      }
                    }
                  },
                  fieldType: {
                    type: SyntaxType.Identifier,
                    value: 'exception$MyException',
                    loc: {
                      start: {
                        line: 5,
                        column: 32,
                        index: 92
                      },
                      end: {
                        line: 5,
                        column: 53,
                        index: 113
                      }
                    }
                  },
                  requiredness: null,
                  defaultValue: null,
                  comments: [],
                  loc: {
                    start: {
                      line: 5,
                      column: 29,
                      index: 89
                    },
                    end: {
                      line: 5,
                      column: 57,
                      index: 117
                    }
                  }
                }
              ],
              oneway: false,
              modifiers: [],
              comments: [],
              loc: {
                start: {
                  line: 5,
                  column: 9,
                  index: 69
                },
                end: {
                  line: 5,
                  column: 58,
                  index: 118
                }
              }
            }
          ],
          comments: [],
          loc: {
            start: {
              line: 4,
              column: 7,
              index: 41
            },
            end: {
              line: 6,
              column: 8,
              index: 126
            }
          }
        }
      ]
    }

    assert.deepEqual(actual, expected)
  })
})