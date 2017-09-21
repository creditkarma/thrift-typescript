import { assert } from 'chai'

import {
  ThriftDocument,
  parse,
  SyntaxType,
} from '@creditkarma/thrift-parser'

import { resolve } from '../../app/resolver'
import { validate } from '../../app/validator'
import { IResolvedFile, IIncludeMap } from '../../app/types'

describe('Thrift TypeScript Validator', () => {

  it('should throw if oneway keyword is not followed by void type', () => {
    const content: string = `
      service Test {
        oneway string test()
      }
    `;
    const rawAST: ThriftDocument = parse(content)
    const resolvedAST: IResolvedFile = resolve(rawAST, {})

    assert.throws(() => validate(resolvedAST))
  })

  it('should not throw if oneway keyword is followed by void type', () => {
    const content: string = `
      service Test {
        oneway void test()
      }
    `;
    const rawAST: ThriftDocument = parse(content)
    const resolvedAST: IResolvedFile = resolve(rawAST, {})

    assert.doesNotThrow(() => validate(resolvedAST))
  })

  it('should throw if a service tries to extend a non-service', () => {
    const content: string = `
      struct TestStruct {
        1: string field1;
      }

      service ServiceOne extends TestStruct {
        void ping()
      }
    `;
    const rawAST: ThriftDocument = parse(content)
    const resolvedAST: IResolvedFile = resolve(rawAST, {})

    assert.throws(() => validate(resolvedAST))
  })

  it('should not throw if a service extends a service', () => {
    const content: string = `
      service ServiceOne {
        void sendMessage(1: string msg)
      }

      service ServiceTwo extends ServiceOne {
        void ping()
      }
    `;
    const rawAST: ThriftDocument = parse(content)
    const resolvedAST: IResolvedFile = resolve(rawAST, {})

    assert.throws(() => validate(resolvedAST))
  })

  it('should throw if it finds incorrect list types', () => {
    const content: string = `
      const list<string> TEST = [ 32, 41, 65 ]
    `;
    const rawAST: ThriftDocument = parse(content)
    const resolvedAST: IResolvedFile = resolve(rawAST, {})

    assert.throws(() => validate(resolvedAST))
  })

  it('should not throw if it finds correct list types', () => {
    const content: string = `
      const list<i32> TEST = [ 32, 41, 65 ]
    `;
    const rawAST: ThriftDocument = parse(content)
    const resolvedAST: IResolvedFile = resolve(rawAST, {})

    assert.doesNotThrow(() => validate(resolvedAST))
  })

  it('should throw if it finds incorrect nested list types', () => {
    const content: string = `
      const list<list<string>> TEST = [ [ 32, 41, 65 ], [ 2, 3 ] ]
    `;
    const rawAST: ThriftDocument = parse(content)
    const resolvedAST: IResolvedFile = resolve(rawAST, {})

    assert.throws(() => validate(resolvedAST))
  })

  it('should not throw if it finds correct nested list types', () => {
    const content: string = `
      const list<list<i32>> TEST = [ [ 32, 41, 65 ], [ 2, 3 ] ]
    `;
    const rawAST: ThriftDocument = parse(content)
    const resolvedAST: IResolvedFile = resolve(rawAST, {})

    assert.doesNotThrow(() => validate(resolvedAST))
  })

  it('should throw if it finds incorrect set types', () => {
    const content: string = `
      const set<string> TEST = [ 32, 41, 65 ]
    `;
    const rawAST: ThriftDocument = parse(content)
    const resolvedAST: IResolvedFile = resolve(rawAST, {})

    assert.throws(() => validate(resolvedAST))
  })

  it('should not throw if it finds correct set types', () => {
    const content: string = `
      const set<i32> TEST = [ 32, 41, 65 ]
    `;
    const rawAST: ThriftDocument = parse(content)
    const resolvedAST: IResolvedFile = resolve(rawAST, {})

    assert.doesNotThrow(() => validate(resolvedAST))
  })

  it('should throw if it finds incorrect map types', () => {
    const content: string = `
      const map<string,string> TEST = { 'one': 1, 'two': 2 }
    `;
    const rawAST: ThriftDocument = parse(content)
    const resolvedAST: IResolvedFile = resolve(rawAST, {})

    assert.throws(() => validate(resolvedAST))
  })

  it('should not throw if it finds correct map types', () => {
    const content: string = `
      const map<string,string> TEST = { 'one': 'value one', 'two': 'value two' }
    `;
    const rawAST: ThriftDocument = parse(content)
    const resolvedAST: IResolvedFile = resolve(rawAST, {})

    assert.doesNotThrow(() => validate(resolvedAST))
  })

  it('should throw if it finds incorrect nested map types', () => {
    const content: string = `
      const map<string,map<string,string>> TEST = { 'one': { 'a': 1 }, 'two': { 'b': 4 } }
    `;
    const rawAST: ThriftDocument = parse(content)
    const resolvedAST: IResolvedFile = resolve(rawAST, {})

    assert.throws(() => validate(resolvedAST))
  })

  it('should not throw if it finds correct nested map types', () => {
    const content: string = `
      const map<string,map<string,string>> TEST = { 'one': { 'a': 'blah' }, 'two': { 'b': 'blam' } }
    `;
    const rawAST: ThriftDocument = parse(content)
    const resolvedAST: IResolvedFile = resolve(rawAST, {})

    assert.doesNotThrow(() => validate(resolvedAST))
  })

  it('should throw if it finds duplicate field IDs', () => {
    const content: string = `
      struct TestStruct {
        1: i32 field1
        1: string field2
      }
    `;
    const rawAST: ThriftDocument = parse(content)
    const resolvedAST: IResolvedFile = resolve(rawAST, {})

    assert.throws(() => validate(resolvedAST))
  })

  it('should throw if unable to resolve type of identifier', () => {
    const content: string = `
      struct TestStruct {
        1: i32 test = status.Status.SUCCESS
      }
    `;
    const rawAST: ThriftDocument = parse(content)
    const resolvedAST: IResolvedFile = resolve(rawAST, {})

    assert.throws(() => validate(resolvedAST))
  })

  it('should not throw if assigning an int to and int field', () => {
    const content: string = `
      struct TestStruct {
        1: i32 test = 45
      }
    `;
    const rawAST: ThriftDocument = parse(content)
    const resolvedAST: IResolvedFile = resolve(rawAST, {})

    assert.doesNotThrow(() => validate(resolvedAST))
  })

  it('should throw if assigning a string to an int field', () => {
    const content: string = `
      struct TestStruct {
        1: i32 test = "whoa"
      }
    `;
    const rawAST: ThriftDocument = parse(content)
    const resolvedAST: IResolvedFile = resolve(rawAST, {})

    assert.throws(() => validate(resolvedAST))
  })

  it('should throw when assigning an enum member to i32 field', () => {
    const content: string = `
      enum Status {
        SUCCESS,
        FAILURE
      }

      struct TestStruct {
        1: i32 test = Status.SUCCESS
      }
    `;
    const rawAST: ThriftDocument = parse(content)
    const resolvedAST: IResolvedFile = resolve(rawAST, {})

    assert.throws(() => validate(resolvedAST))
  })

  it('should not throw if assigning valid int to enum type', () => {
    const content: string = `
      enum TestEnum {
        ONE,
        TWO,
        THREE
      }

      const TestEnum test = 1
    `;
    const rawAST: ThriftDocument = parse(content)
    const resolvedAST: IResolvedFile = resolve(rawAST, {})

    assert.doesNotThrow(() => validate(resolvedAST))
  })

  it('should throw if assigning to enum out of range', () => {
    const content: string = `
      enum TestEnum {
        ONE,
        TWO,
        THREE
      }

      const TestEnum test = 6
    `;
    const rawAST: ThriftDocument = parse(content)
    const resolvedAST: IResolvedFile = resolve(rawAST, {})

    assert.throws(() => validate(resolvedAST))
  })

  it('should validate types for includes', () => {
    const content: string = `
      include "exception.thrift"

      exception MyException {
        1: exception.Status status = exception.Status.SUCCESS;
      }
    `;
    const rawAST: ThriftDocument = parse(content)
    const mockIncludes: IIncludeMap = {
      exception: {
        sourcePath: 'exception.thrift',
        outPath: 'exception.ts',
        namespace: '',
        contents: '',
        includes: {},
        identifiers: {
          Status: {
            name: 'Status',
            resolvedName: 'Status',
            definition: {
              type: SyntaxType.EnumDefinition,
              name: {
                type: SyntaxType.Identifier,
                value: 'Status',
                loc: {
                  start: { line: 0, column: 0, index: 0 },
                  end: { line: 0, column: 0, index: 0 }
                }
              },
              members: [
                {
                  type: SyntaxType.EnumMember,
                  name: {
                    type: SyntaxType.Identifier,
                    value: 'SUCCESS',
                    loc: {
                      start: { line: 0, column: 0, index: 0 },
                      end: { line: 0, column: 0, index: 0 }
                    }
                  },
                  initializer: null,
                  comments: [],
                  loc: {
                    start: { line: 0, column: 0, index: 0 },
                    end: { line: 0, column: 0, index: 0 }
                  }
                },
                {
                  type: SyntaxType.EnumMember,
                  name: {
                    type: SyntaxType.Identifier,
                    value: 'FAILURE',
                    loc: {
                      start: { line: 0, column: 0, index: 0 },
                      end: { line: 0, column: 0, index: 0 }
                    }
                  },
                  initializer: null,
                  comments: [],
                  loc: {
                    start: { line: 0, column: 0, index: 0 },
                    end: { line: 0, column: 0, index: 0 }
                  }
                }
              ],
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
    const resolvedAST: IResolvedFile = resolve(rawAST, mockIncludes)
    const validatedAST: IResolvedFile = validate(resolvedAST)
    const expected: IResolvedFile = {
      namespaces: {},
      includes: {
        exception: [
          {
            name: 'Status',
            path: 'exception',
            resolvedName: 'exception$Status'
          }
        ]
      },
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
                start: {
                  line: 4,
                  column: 17,
                  index: 51
                },
                end: {
                  line: 4,
                  column: 28,
                  index: 62
                }
              }
            },
            fields: [
              {
                type: SyntaxType.FieldDefinition,
                name: {
                  type: SyntaxType.Identifier,
                  value: 'status',
                  loc: {
                    start: {
                      line: 5,
                      column: 29,
                      index: 93
                    },
                    end: {
                      line: 5,
                      column: 35,
                      index: 99
                    }
                  }
                },
                fieldID: {
                  type: SyntaxType.FieldID,
                  value: 1,
                  loc: {
                    start: {
                      line: 5,
                      column: 9,
                      index: 73
                    },
                    end: {
                      line: 5,
                      column: 11,
                      index: 75
                    }
                  }
                },
                fieldType: {
                  type: SyntaxType.Identifier,
                  value: 'exception.Status',
                  loc: {
                    start: {
                      line: 5,
                      column: 12,
                      index: 76
                    },
                    end: {
                      line: 5,
                      column: 28,
                      index: 92
                    }
                  }
                },
                requiredness: null,
                defaultValue: {
                  type: SyntaxType.Identifier,
                  value: 'exception.Status.SUCCESS',
                  loc: {
                    start: {
                      line: 5,
                      column: 38,
                      index: 102
                    },
                    end: {
                      line: 5,
                      column: 62,
                      index: 126
                    }
                  }
                },
                comments: [],
                loc: {
                  start: {
                    line: 5,
                    column: 9,
                    index: 73
                  },
                  end: {
                    line: 5,
                    column: 63,
                    index: 127
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
                index: 135
              }
            }
          }
        },
        exception$Status: {
          name: 'Status',
          resolvedName: 'exception$Status',
          definition: {
            type: SyntaxType.EnumDefinition,
            name: {
              type: SyntaxType.Identifier,
              value: 'Status',
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
            members: [
              {
                type: SyntaxType.EnumMember,
                name: {
                  type: SyntaxType.Identifier,
                  value: 'SUCCESS',
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
                initializer: null,
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
              },
              {
                type: SyntaxType.EnumMember,
                name: {
                  type: SyntaxType.Identifier,
                  value: 'FAILURE',
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
                initializer: null,
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
            ],
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
          type: SyntaxType.ExceptionDefinition,
          name: {
            type: SyntaxType.Identifier,
            value: 'MyException',
            loc: {
              start: {
                line: 4,
                column: 17,
                index: 51
              },
              end: {
                line: 4,
                column: 28,
                index: 62
              }
            }
          },
          fields: [
            {
              type: SyntaxType.FieldDefinition,
              name: {
                type: SyntaxType.Identifier,
                value: 'status',
                loc: {
                  start: {
                    line: 5,
                    column: 29,
                    index: 93
                  },
                  end: {
                    line: 5,
                    column: 35,
                    index: 99
                  }
                }
              },
              fieldID: {
                type: SyntaxType.FieldID,
                value: 1,
                loc: {
                  start: {
                    line: 5,
                    column: 9,
                    index: 73
                  },
                  end: {
                    line: 5,
                    column: 11,
                    index: 75
                  }
                }
              },
              fieldType: {
                type: SyntaxType.Identifier,
                value: 'exception$Status',
                loc: {
                  start: {
                    line: 5,
                    column: 12,
                    index: 76
                  },
                  end: {
                    line: 5,
                    column: 28,
                    index: 92
                  }
                }
              },
              requiredness: null,
              defaultValue: {
                type: SyntaxType.Identifier,
                value: 'exception$Status.SUCCESS',
                loc: {
                  start: {
                    line: 5,
                    column: 38,
                    index: 102
                  },
                  end: {
                    line: 5,
                    column: 62,
                    index: 126
                  }
                }
              },
              comments: [],
              loc: {
                start: {
                  line: 5,
                  column: 9,
                  index: 73
                },
                end: {
                  line: 5,
                  column: 63,
                  index: 127
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
              index: 135
            }
          }
        }
      ]
    }

    assert.deepEqual(validatedAST, expected)
  })
})