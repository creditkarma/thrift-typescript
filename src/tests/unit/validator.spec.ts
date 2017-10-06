import { assert } from 'chai'
import { SyntaxType } from '@creditkarma/thrift-parser'

import { resolveFile } from '../../main/resolver'
import { validateFile } from '../../main/validator'
import { parseSource, parseThriftString } from '../../main/utils'
import {
  IResolvedFile,
  IParsedFile,
  IThriftError,
  ErrorType,
} from '../../main/types'

describe('Thrift TypeScript Validator', () => {

  it('should return error if oneway keyword is not followed by void type', () => {
    const content: string = `
      service Test {
        oneway string test()
      }
    `;
    const parsedFile: IParsedFile = parseSource(content)
    const resolvedAST: IResolvedFile = resolveFile(parsedFile)
    const validatedAST: IResolvedFile = validateFile(resolvedAST)
    const expected: Array<IThriftError> = [
      {
        type: ErrorType.ValidationError,
        message: 'Oneway function must have return type of void, instead found string',
        loc: {
          start: {
            line: 3,
            column: 16,
            index: 37
          },
          end: {
            line: 3,
            column: 29,
            index: 50
          }
        }
      }
    ]

    assert.deepEqual(validatedAST.errors, expected)
  })

  it('should not return error if oneway keyword is followed by void type', () => {
    const content: string = `
      service Test {
        oneway void test()
      }
    `;
    const parsedFile: IParsedFile = parseSource(content)
    const resolvedAST: IResolvedFile = resolveFile(parsedFile)
    const validatedAST: IResolvedFile = validateFile(resolvedAST)
    const expected: Array<IThriftError> = []

    assert.deepEqual(validatedAST.errors, expected)
  })

  it('should return an error if a service tries to extend a non-service', () => {
    const content: string = `
      struct TestStruct {
        1: string field1;
      }

      service ServiceOne extends TestStruct {
        void ping()
      }
    `;
    const parsedFile: IParsedFile = parseSource(content)
    const resolvedAST: IResolvedFile = resolveFile(parsedFile)
    const validatedAST: IResolvedFile = validateFile(resolvedAST)
    const expected: Array<IThriftError> = [
      {
        type: ErrorType.ValidationError,
        message: 'Service type expected but found type StructDefinition',
        loc: {
          start: {
            line: 6,
            column: 26,
            index: 87
          },
          end: {
            line: 6,
            column: 44,
            index: 105
          }
        }
      }
    ]

    assert.deepEqual(validatedAST.errors, expected)
  })

  it('should not return an error if a service extends a service', () => {
    const content: string = `
      service ServiceOne {
        void sendMessage(1: string msg)
      }

      service ServiceTwo extends ServiceOne {
        void ping()
      }
    `;
    const parsedFile: IParsedFile = parseSource(content)
    const resolvedAST: IResolvedFile = resolveFile(parsedFile)
    const validatedAST: IResolvedFile = validateFile(resolvedAST)
    const expected: Array<IThriftError> = []

    assert.deepEqual(validatedAST.errors, expected)
  })

  it('should return an error if it finds incorrect list types', () => {
    const content: string = `
      const list<string> TEST = [ 32, 41, 65 ]
    `;
    const parsedFile: IParsedFile = parseSource(content)
    const resolvedAST: IResolvedFile = resolveFile(parsedFile)
    const validatedAST: IResolvedFile = validateFile(resolvedAST)
    const expected: Array<IThriftError> = [
      {
        type: ErrorType.ValidationError,
        message: 'Expected type string but found type number',
        loc: {
          start: {
            line: 2,
            column: 35,
            index: 35
          },
          end: {
            line: 2,
            column: 37,
            index: 37
          }
        }
      }
    ]

    assert.deepEqual(validatedAST.errors, expected)
  })

  it('should not return an error if it finds correct list types', () => {
    const content: string = `
      const list<i32> TEST = [ 32, 41, 65 ]
    `;
    const parsedFile: IParsedFile = parseSource(content)
    const resolvedAST: IResolvedFile = resolveFile(parsedFile)
    const validatedAST: IResolvedFile = validateFile(resolvedAST)
    const expected: Array<IThriftError> = []

    assert.deepEqual(validatedAST.errors, expected)
  })

  it('should return an error if it finds incorrect nested list types', () => {
    const content: string = `
      const list<list<string>> TEST = [ [ 32, 41, 65 ], [ 2, 3 ] ]
    `;
    const parsedFile: IParsedFile = parseSource(content)
    const resolvedAST: IResolvedFile = resolveFile(parsedFile)
    const validatedAST: IResolvedFile = validateFile(resolvedAST)
    const expected: Array<IThriftError> = [
      {
        type: ErrorType.ValidationError,
        message: 'Expected type string but found type number',
        loc: {
          start: {
            line: 2,
            column: 43,
            index: 43
          },
          end: {
            line: 2,
            column: 45,
            index: 45
          }
        }
      }
    ]

    assert.deepEqual(validatedAST.errors, expected)
  })

  it('should not return an error if it finds correct nested list types', () => {
    const content: string = `
      const list<list<i32>> TEST = [ [ 32, 41, 65 ], [ 2, 3 ] ]
    `;
    const parsedFile: IParsedFile = parseSource(content)
    const resolvedAST: IResolvedFile = resolveFile(parsedFile)
    const validatedAST: IResolvedFile = validateFile(resolvedAST)
    const expected: Array<IThriftError> = []

    assert.deepEqual(validatedAST.errors, expected)
  })

  it('should return an error if it finds incorrect set types', () => {
    const content: string = `
      const set<string> TEST = [ 32, 41, 65 ]
    `;
    const parsedFile: IParsedFile = parseSource(content)
    const resolvedAST: IResolvedFile = resolveFile(parsedFile)
    const validatedAST: IResolvedFile = validateFile(resolvedAST)
    const expected: Array<IThriftError> = [
      {
        type: ErrorType.ValidationError,
        message: 'Expected type string but found type number',
        loc: {
          start: {
            line: 2,
            column: 34,
            index: 34
          },
          end: {
            line: 2,
            column: 36,
            index: 36
          }
        }
      }
    ]

    assert.deepEqual(validatedAST.errors, expected)
  })

  it('should not return an error if it finds correct set types', () => {
    const content: string = `
      const set<i32> TEST = [ 32, 41, 65 ]
    `;
    const parsedFile: IParsedFile = parseSource(content)
    const resolvedAST: IResolvedFile = resolveFile(parsedFile)
    const validatedAST: IResolvedFile = validateFile(resolvedAST)
    const expected: Array<IThriftError> = []

    assert.deepEqual(validatedAST.errors, expected)
  })

  it('should return an error if it finds incorrect map types', () => {
    const content: string = `
      const map<string,string> TEST = { 'one': 1, 'two': 2 }
    `;
    const parsedFile: IParsedFile = parseSource(content)
    const resolvedAST: IResolvedFile = resolveFile(parsedFile)
    const validatedAST: IResolvedFile = validateFile(resolvedAST)
    const expected: Array<IThriftError> = [
      {
        type: ErrorType.ValidationError,
        message: 'Expected type string but found type number',
        loc: {
          start: {
            line: 2,
            column: 48,
            index: 48
          },
          end: {
            line: 2,
            column: 49,
            index: 49
          }
        }
      }
    ]

    assert.deepEqual(validatedAST.errors, expected)
  })

  it('should not return an error if it finds correct map types', () => {
    const content: string = `
      const map<string,string> TEST = { 'one': 'value one', 'two': 'value two' }
    `;
    const parsedFile: IParsedFile = parseSource(content)
    const resolvedAST: IResolvedFile = resolveFile(parsedFile)
    const validatedAST: IResolvedFile = validateFile(resolvedAST)
    const expected: Array<IThriftError> = []

    assert.deepEqual(validatedAST.errors, expected)
  })

  it('should return an error if it finds incorrect nested map types', () => {
    const content: string = `
      const map<string,map<string,string>> TEST = { 'one': { 'a': 1 }, 'two': { 'b': 4 } }
    `;
    const parsedFile: IParsedFile = parseSource(content)
    const resolvedAST: IResolvedFile = resolveFile(parsedFile)
    const validatedAST: IResolvedFile = validateFile(resolvedAST)
    const expected: Array<IThriftError> = [
      {
        type: ErrorType.ValidationError,
        message: 'Expected type string but found type number',
        loc: {
          start: {
            line: 2,
            column: 67,
            index: 67
          },
          end: {
            line: 2,
            column: 68,
            index: 68
          }
        }
      }
    ]

    assert.deepEqual(validatedAST.errors, expected)
  })

  it('should not return an error if it finds correct nested map types', () => {
    const content: string = `
      const map<string,map<string,string>> TEST = { 'one': { 'a': 'blah' }, 'two': { 'b': 'blam' } }
    `;
    const parsedFile: IParsedFile = parseSource(content)
    const resolvedAST: IResolvedFile = resolveFile(parsedFile)
    const validatedAST: IResolvedFile = validateFile(resolvedAST)
    const expected: Array<IThriftError> = []

    assert.deepEqual(validatedAST.errors, expected)
  })

  it('should return an error if it finds duplicate field IDs', () => {
    const content: string = `
      struct TestStruct {
        1: i32 field1
        1: string field2
      }
    `;
    const parsedFile: IParsedFile = parseSource(content)
    const resolvedAST: IResolvedFile = resolveFile(parsedFile)
    const validatedAST: IResolvedFile = validateFile(resolvedAST)
    const expected: Array<IThriftError> = [
      {
        type: ErrorType.ValidationError,
        message: 'Found duplicate usage of fieldID: 1',
        loc: {
          start: {
            line: 4,
            column: 9,
            index: 57
          },
          end: {
            line: 4,
            column: 11,
            index: 59
          }
        }
      }
    ]

    assert.deepEqual(validatedAST.errors, expected)
  })

  it('should return an error if unable to resolve type of identifier', () => {
    const content: string = `
      struct TestStruct {
        1: i32 test = status.Status.SUCCESS
      }
    `;
    const parsedFile: IParsedFile = parseSource(content)
    const resolvedAST: IResolvedFile = resolveFile(parsedFile)
    const validatedAST: IResolvedFile = validateFile(resolvedAST)
    const expected: Array<IThriftError> = [
      {
        type: ErrorType.ValidationError,
        message: 'Expected type number but found type status.Status.SUCCESS',
        loc: {
          start: {
            line: 3,
            column: 23,
            index: 49
          },
          end: {
            line: 3,
            column: 44,
            index: 70
          }
        }
      }
    ]

    assert.deepEqual(validatedAST.errors, expected)
  })

  it('should not return an error if assigning an int to and int field', () => {
    const content: string = `
      struct TestStruct {
        1: i32 test = 45
      }
    `;
    const parsedFile: IParsedFile = parseSource(content)
    const resolvedAST: IResolvedFile = resolveFile(parsedFile)
    const validatedAST: IResolvedFile = validateFile(resolvedAST)
    const expected: Array<IThriftError> = []

    assert.deepEqual(validatedAST.errors, expected)
  })

  it('should return an error if assigning a string to an int field', () => {
    const content: string = `
      struct TestStruct {
        1: i32 test = 'whoa'
      }
    `;
    const parsedFile: IParsedFile = parseSource(content)
    const resolvedAST: IResolvedFile = resolveFile(parsedFile)
    const validatedAST: IResolvedFile = validateFile(resolvedAST)
    const expected: Array<IThriftError> = [
      {
        type: ErrorType.ValidationError,
        message: 'Expected type number but found type string',
        loc: {
          start: {
            line: 3,
            column: 23,
            index: 49
          },
          end: {
            line: 3,
            column: 29,
            index: 55
          }
        }
      }
    ]

    assert.deepEqual(validatedAST.errors, expected)
  })

  it('should return an error when assigning an enum member to i32 field', () => {
    const content: string = `
      enum Status {
        SUCCESS,
        FAILURE
      }

      struct TestStruct {
        1: i32 test = Status.SUCCESS
      }
    `;
    const parsedFile: IParsedFile = parseSource(content)
    const resolvedAST: IResolvedFile = resolveFile(parsedFile)
    const validatedAST: IResolvedFile = validateFile(resolvedAST)
    const expected: Array<IThriftError> = [
      {
        type: ErrorType.ValidationError,
        message: 'Expected type number but found type Status.SUCCESS',
        loc: {
          start: {
            line: 8,
            column: 23,
            index: 111
          },
          end: {
            line: 8,
            column: 37,
            index: 125
          }
        }
      }
    ]

    assert.deepEqual(validatedAST.errors, expected)
  })

  it('should not return an error if assigning valid int to enum type', () => {
    const content: string = `
      enum TestEnum {
        ONE,
        TWO,
        THREE
      }

      const TestEnum test = 1
    `;
    const parsedFile: IParsedFile = parseSource(content)
    const resolvedAST: IResolvedFile = resolveFile(parsedFile)
    const validatedAST: IResolvedFile = validateFile(resolvedAST)
    const expected: Array<IThriftError> = []

    assert.deepEqual(validatedAST.errors, expected)
  })

  it('should return an error if assigning to enum out of range', () => {
    const content: string = `
      enum TestEnum {
        ONE,
        TWO,
        THREE
      }

      const TestEnum test = 6
    `;
    const parsedFile: IParsedFile = parseSource(content)
    const resolvedAST: IResolvedFile = resolveFile(parsedFile)
    const validatedAST: IResolvedFile = validateFile(resolvedAST)
    const expected: Array<IThriftError> = [
      {
        type: ErrorType.ValidationError,
        message: 'The value 6 is not assignable to type TestEnum',
        loc: {
          start: {
            line: 8,
            column: 29,
            index: 100
          },
          end: {
            line: 8,
            column: 30,
            index: 101
          }
        }
      }
    ]

    assert.deepEqual(validatedAST.errors, expected)
  })

  it('should add missing field IDs', () => {
    const content: string = `
      struct TestStruct {
        i32 status
        required string message
      }
    `
    const parsedFile: IParsedFile = parseSource(content)
    const resolvedFile: IResolvedFile = resolveFile(parsedFile)
    const validatedFile: IResolvedFile = validateFile(resolvedFile)
    const expected: IResolvedFile = {
      name: 'source',
      path: '',
      source: '\n      struct TestStruct {\n        i32 status\n        required string message\n      }\n    ',
      namespace: {
        scope: '',
        name: '',
        path: ''
      },
      includes: {},
      identifiers: {
        TestStruct: {
          name: 'TestStruct',
          resolvedName: 'TestStruct',
          definition: {
            type: SyntaxType.StructDefinition,
            name: {
              type: SyntaxType.Identifier,
              value: 'TestStruct',
              loc: {
                start: {
                  line: 2,
                  column: 14,
                  index: 14
                },
                end: {
                  line: 2,
                  column: 24,
                  index: 24
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
                      line: 3,
                      column: 13,
                      index: 39
                    },
                    end: {
                      line: 3,
                      column: 19,
                      index: 45
                    }
                  }
                },
                fieldID: null,
                fieldType: {
                  type: SyntaxType.I32Keyword,
                  loc: {
                    start: {
                      line: 3,
                      column: 9,
                      index: 35
                    },
                    end: {
                      line: 3,
                      column: 12,
                      index: 38
                    }
                  }
                },
                requiredness: null,
                defaultValue: null,
                comments: [],
                loc: {
                  start: {
                    line: 3,
                    column: 9,
                    index: 35
                  },
                  end: {
                    line: 3,
                    column: 19,
                    index: 45
                  }
                }
              },
              {
                type: SyntaxType.FieldDefinition,
                name: {
                  type: SyntaxType.Identifier,
                  value: 'message',
                  loc: {
                    start: {
                      line: 4,
                      column: 25,
                      index: 70
                    },
                    end: {
                      line: 4,
                      column: 32,
                      index: 77
                    }
                  }
                },
                fieldID: null,
                fieldType: {
                  type: SyntaxType.StringKeyword,
                  loc: {
                    start: {
                      line: 4,
                      column: 18,
                      index: 63
                    },
                    end: {
                      line: 4,
                      column: 24,
                      index: 69
                    }
                  }
                },
                requiredness: 'required',
                defaultValue: null,
                comments: [],
                loc: {
                  start: {
                    line: 4,
                    column: 9,
                    index: 54
                  },
                  end: {
                    line: 4,
                    column: 32,
                    index: 77
                  }
                }
              }
            ],
            comments: [],
            loc: {
              start: {
                line: 2,
                column: 7,
                index: 7
              },
              end: {
                line: 5,
                column: 8,
                index: 85
              }
            }
          }
        }
      },
      body: [
        {
          type: SyntaxType.StructDefinition,
          name: {
            type: SyntaxType.Identifier,
            value: 'TestStruct',
            loc: {
              start: {
                line: 2,
                column: 14,
                index: 14
              },
              end: {
                line: 2,
                column: 24,
                index: 24
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
                    line: 3,
                    column: 13,
                    index: 39
                  },
                  end: {
                    line: 3,
                    column: 19,
                    index: 45
                  }
                }
              },
              fieldID: {
                type: SyntaxType.FieldID,
                value: -1,
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
              fieldType: {
                type: SyntaxType.I32Keyword,
                loc: {
                  start: {
                    line: 3,
                    column: 9,
                    index: 35
                  },
                  end: {
                    line: 3,
                    column: 12,
                    index: 38
                  }
                }
              },
              requiredness: null,
              defaultValue: null,
              comments: [],
              loc: {
                start: {
                  line: 3,
                  column: 9,
                  index: 35
                },
                end: {
                  line: 3,
                  column: 19,
                  index: 45
                }
              }
            },
            {
              type: SyntaxType.FieldDefinition,
              name: {
                type: SyntaxType.Identifier,
                value: 'message',
                loc: {
                  start: {
                    line: 4,
                    column: 25,
                    index: 70
                  },
                  end: {
                    line: 4,
                    column: 32,
                    index: 77
                  }
                }
              },
              fieldID: {
                type: SyntaxType.FieldID,
                value: -2,
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
              fieldType: {
                type: SyntaxType.StringKeyword,
                loc: {
                  start: {
                    line: 4,
                    column: 18,
                    index: 63
                  },
                  end: {
                    line: 4,
                    column: 24,
                    index: 69
                  }
                }
              },
              requiredness: 'required',
              defaultValue: null,
              comments: [],
              loc: {
                start: {
                  line: 4,
                  column: 9,
                  index: 54
                },
                end: {
                  line: 4,
                  column: 32,
                  index: 77
                }
              }
            }
          ],
          comments: [],
          loc: {
            start: {
              line: 2,
              column: 7,
              index: 7
            },
            end: {
              line: 5,
              column: 8,
              index: 85
            }
          }
        }
      ],
      errors: []
    }

    assert.deepEqual(validatedFile, expected)
  })

  it('should validate types for includes', () => {
    const content: string = `
      include 'exception.thrift'

      exception MyException {
        1: exception.Status status = exception.Status.SUCCESS;
      }
    `;
    const mockIncludeContent: string = `
      enum Status {
        SUCCESS,
        FAILURE
      }
    `
    const parsedFile: IParsedFile = {
      name: 'test',
      path: '',
      source: `
        include 'exception.thrift'

        exception MyException {
          1: exception.Status status = exception.Status.SUCCESS;
        }
      `,
      includes: [
        {
          name: 'exception',
          path: '',
          source: '',
          includes: [],
          ast: parseThriftString(mockIncludeContent)
        }
      ],
      ast: parseThriftString(content)
    }
    const resolvedFile: IResolvedFile = resolveFile(parsedFile)
    const validatedFile: IResolvedFile = validateFile(resolvedFile)
    const expected: IResolvedFile = {
      name: 'test',
      path: '',
      source: "\n        include 'exception.thrift'\n\n        exception MyException {\n          1: exception.Status status = exception.Status.SUCCESS;\n        }\n      ",
      namespace: {
        scope: '',
        name: '',
        path: ''
      },
      includes: {
        exception: {
          file: {
            name: 'exception',
            path: '',
            source: '',
            namespace: {
              scope: '',
              name: '',
              path: ''
            },
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
                      start: {
                        line: 2,
                        column: 12,
                        index: 12
                      },
                      end: {
                        line: 2,
                        column: 18,
                        index: 18
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
                            line: 3,
                            column: 9,
                            index: 29
                          },
                          end: {
                            line: 3,
                            column: 16,
                            index: 36
                          }
                        }
                      },
                      initializer: null,
                      comments: [],
                      loc: {
                        start: {
                          line: 3,
                          column: 9,
                          index: 29
                        },
                        end: {
                          line: 3,
                          column: 16,
                          index: 36
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
                            line: 4,
                            column: 9,
                            index: 46
                          },
                          end: {
                            line: 4,
                            column: 16,
                            index: 53
                          }
                        }
                      },
                      initializer: null,
                      comments: [],
                      loc: {
                        start: {
                          line: 4,
                          column: 9,
                          index: 46
                        },
                        end: {
                          line: 4,
                          column: 16,
                          index: 53
                        }
                      }
                    }
                  ],
                  comments: [],
                  loc: {
                    start: {
                      line: 2,
                      column: 7,
                      index: 7
                    },
                    end: {
                      line: 5,
                      column: 8,
                      index: 61
                    }
                  }
                }
              }
            },
            body: [
              {
                type: SyntaxType.EnumDefinition,
                name: {
                  type: SyntaxType.Identifier,
                  value: 'Status',
                  loc: {
                    start: {
                      line: 2,
                      column: 12,
                      index: 12
                    },
                    end: {
                      line: 2,
                      column: 18,
                      index: 18
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
                          line: 3,
                          column: 9,
                          index: 29
                        },
                        end: {
                          line: 3,
                          column: 16,
                          index: 36
                        }
                      }
                    },
                    initializer: null,
                    comments: [],
                    loc: {
                      start: {
                        line: 3,
                        column: 9,
                        index: 29
                      },
                      end: {
                        line: 3,
                        column: 16,
                        index: 36
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
                          line: 4,
                          column: 9,
                          index: 46
                        },
                        end: {
                          line: 4,
                          column: 16,
                          index: 53
                        }
                      }
                    },
                    initializer: null,
                    comments: [],
                    loc: {
                      start: {
                        line: 4,
                        column: 9,
                        index: 46
                      },
                      end: {
                        line: 4,
                        column: 16,
                        index: 53
                      }
                    }
                  }
                ],
                comments: [],
                loc: {
                  start: {
                    line: 2,
                    column: 7,
                    index: 7
                  },
                  end: {
                    line: 5,
                    column: 8,
                    index: 61
                  }
                }
              }
            ],
            errors: []
          },
          identifiers: [
            {
              name: 'Status',
              resolvedName: 'exception$Status',
              definition: {
                type: SyntaxType.EnumDefinition,
                name: {
                  type: SyntaxType.Identifier,
                  value: 'Status',
                  loc: {
                    start: {
                      line: 2,
                      column: 12,
                      index: 12
                    },
                    end: {
                      line: 2,
                      column: 18,
                      index: 18
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
                          line: 3,
                          column: 9,
                          index: 29
                        },
                        end: {
                          line: 3,
                          column: 16,
                          index: 36
                        }
                      }
                    },
                    initializer: null,
                    comments: [],
                    loc: {
                      start: {
                        line: 3,
                        column: 9,
                        index: 29
                      },
                      end: {
                        line: 3,
                        column: 16,
                        index: 36
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
                          line: 4,
                          column: 9,
                          index: 46
                        },
                        end: {
                          line: 4,
                          column: 16,
                          index: 53
                        }
                      }
                    },
                    initializer: null,
                    comments: [],
                    loc: {
                      start: {
                        line: 4,
                        column: 9,
                        index: 46
                      },
                      end: {
                        line: 4,
                        column: 16,
                        index: 53
                      }
                    }
                  }
                ],
                comments: [],
                loc: {
                  start: {
                    line: 2,
                    column: 7,
                    index: 7
                  },
                  end: {
                    line: 5,
                    column: 8,
                    index: 61
                  }
                }
              }
            }
          ]
        }
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
                  line: 2,
                  column: 12,
                  index: 12
                },
                end: {
                  line: 2,
                  column: 18,
                  index: 18
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
                      line: 3,
                      column: 9,
                      index: 29
                    },
                    end: {
                      line: 3,
                      column: 16,
                      index: 36
                    }
                  }
                },
                initializer: null,
                comments: [],
                loc: {
                  start: {
                    line: 3,
                    column: 9,
                    index: 29
                  },
                  end: {
                    line: 3,
                    column: 16,
                    index: 36
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
                      line: 4,
                      column: 9,
                      index: 46
                    },
                    end: {
                      line: 4,
                      column: 16,
                      index: 53
                    }
                  }
                },
                initializer: null,
                comments: [],
                loc: {
                  start: {
                    line: 4,
                    column: 9,
                    index: 46
                  },
                  end: {
                    line: 4,
                    column: 16,
                    index: 53
                  }
                }
              }
            ],
            comments: [],
            loc: {
              start: {
                line: 2,
                column: 7,
                index: 7
              },
              end: {
                line: 5,
                column: 8,
                index: 61
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
      ],
      errors: []
    }

    assert.deepEqual(validatedFile, expected)
  })

  it('should not return an error if assigning an int with value 0 or 1 to a bool field', () => {
    const content: string = `
      struct TestStruct {
        1: bool testFalse = 0
        2: bool testTrue = 1
      }
    `;
    const parsedFile: IParsedFile = parseSource(content)
    const resolvedAST: IResolvedFile = resolveFile(parsedFile)
    const validatedAST: IResolvedFile = validateFile(resolvedAST)
    const expected: Array<IThriftError> = []

    assert.deepEqual(validatedAST.errors, expected)
  })

  it('should return an error if assigning an int with value not 0 or 1 to a bool field', () => {
    const content: string = `
      struct TestStruct {
        1: bool test = 2
      }
    `;
    const parsedFile: IParsedFile = parseSource(content)
    const resolvedAST: IResolvedFile = resolveFile(parsedFile)
    const validatedAST: IResolvedFile = validateFile(resolvedAST)
    const expected: Array<IThriftError> = [
      {
        type: ErrorType.ValidationError,
        message: 'Expected type boolean but found type number',
        loc: {
          start: {
            line: 3,
            column: 24,
            index: 50
          },
          end: {
            line: 3,
            column: 25,
            index: 51
          }
        }
      }
    ]

    assert.deepEqual(validatedAST.errors, expected)
  })
})
