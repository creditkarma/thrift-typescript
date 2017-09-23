import { assert } from 'chai'

import {
  parse,
  SyntaxType
} from '@creditkarma/thrift-parser'

import { resolveFile } from '../../main/resolver'
import {
  IResolvedFile,
  IParsedFile,
} from '../../main/types'

/**
 * interface IParsedFile {
 *   name: string
 *   path: string
 *   includes: Array<IParsedFile>
 *   ast: ThriftDocument
 * }
 */
describe('Thrift TypeScript Resolver', () => {

  it('should find and resolve imported identifiers as types', () => {
    const content: string = `
      include 'exception.thrift'

      service MyService {
        void ping() throws (1: exception.MyException exp)
      }
    `;
    const mockIncludeContent = `
      exception MyException {
        1: required string message
      }
    `
    const mockParsedFile: IParsedFile = {
      name: 'test',
      path: '',
      includes: [
        {
          name: 'exception',
          path: '',
          includes: [],
          ast: parse(mockIncludeContent)
        }
      ],
      ast: parse(content)
    }
    const actual: IResolvedFile = resolveFile(mockParsedFile)
    const expected: IResolvedFile = {
      name: 'test',
      path: '',
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
            namespace: {
              scope: '',
              name: '',
              path: ''
            },
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
                      start: {
                        line: 2,
                        column: 17,
                        index: 17
                      },
                      end: {
                        line: 2,
                        column: 28,
                        index: 28
                      }
                    }
                  },
                  fields: [
                    {
                      type: SyntaxType.FieldDefinition,
                      name: {
                        type: SyntaxType.Identifier,
                        value: 'message',
                        loc: {
                          start: {
                            line: 3,
                            column: 28,
                            index: 58
                          },
                          end: {
                            line: 3,
                            column: 35,
                            index: 65
                          }
                        }
                      },
                      fieldID: {
                        type: SyntaxType.FieldID,
                        value: 1,
                        loc: {
                          start: {
                            line: 3,
                            column: 9,
                            index: 39
                          },
                          end: {
                            line: 3,
                            column: 11,
                            index: 41
                          }
                        }
                      },
                      fieldType: {
                        type: SyntaxType.StringKeyword,
                        loc: {
                          start: {
                            line: 3,
                            column: 21,
                            index: 51
                          },
                          end: {
                            line: 3,
                            column: 27,
                            index: 57
                          }
                        }
                      },
                      requiredness: 'required',
                      defaultValue: null,
                      comments: [],
                      loc: {
                        start: {
                          line: 3,
                          column: 9,
                          index: 39
                        },
                        end: {
                          line: 3,
                          column: 35,
                          index: 65
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
                      line: 4,
                      column: 8,
                      index: 73
                    }
                  }
                }
              }
            },
            body: [
              {
                type: SyntaxType.ExceptionDefinition,
                name: {
                  type: SyntaxType.Identifier,
                  value: 'MyException',
                  loc: {
                    start: {
                      line: 2,
                      column: 17,
                      index: 17
                    },
                    end: {
                      line: 2,
                      column: 28,
                      index: 28
                    }
                  }
                },
                fields: [
                  {
                    type: SyntaxType.FieldDefinition,
                    name: {
                      type: SyntaxType.Identifier,
                      value: 'message',
                      loc: {
                        start: {
                          line: 3,
                          column: 28,
                          index: 58
                        },
                        end: {
                          line: 3,
                          column: 35,
                          index: 65
                        }
                      }
                    },
                    fieldID: {
                      type: SyntaxType.FieldID,
                      value: 1,
                      loc: {
                        start: {
                          line: 3,
                          column: 9,
                          index: 39
                        },
                        end: {
                          line: 3,
                          column: 11,
                          index: 41
                        }
                      }
                    },
                    fieldType: {
                      type: SyntaxType.StringKeyword,
                      loc: {
                        start: {
                          line: 3,
                          column: 21,
                          index: 51
                        },
                        end: {
                          line: 3,
                          column: 27,
                          index: 57
                        }
                      }
                    },
                    requiredness: 'required',
                    defaultValue: null,
                    comments: [],
                    loc: {
                      start: {
                        line: 3,
                        column: 9,
                        index: 39
                      },
                      end: {
                        line: 3,
                        column: 35,
                        index: 65
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
                    line: 4,
                    column: 8,
                    index: 73
                  }
                }
              }
            ]
          },
          identifiers: [
            {
              name: 'MyException',
              resolvedName: 'exception$MyException',
              definition: {
                type: SyntaxType.ExceptionDefinition,
                name: {
                  type: SyntaxType.Identifier,
                  value: 'MyException',
                  loc: {
                    start: {
                      line: 2,
                      column: 17,
                      index: 17
                    },
                    end: {
                      line: 2,
                      column: 28,
                      index: 28
                    }
                  }
                },
                fields: [
                  {
                    type: SyntaxType.FieldDefinition,
                    name: {
                      type: SyntaxType.Identifier,
                      value: 'message',
                      loc: {
                        start: {
                          line: 3,
                          column: 28,
                          index: 58
                        },
                        end: {
                          line: 3,
                          column: 35,
                          index: 65
                        }
                      }
                    },
                    fieldID: {
                      type: SyntaxType.FieldID,
                      value: 1,
                      loc: {
                        start: {
                          line: 3,
                          column: 9,
                          index: 39
                        },
                        end: {
                          line: 3,
                          column: 11,
                          index: 41
                        }
                      }
                    },
                    fieldType: {
                      type: SyntaxType.StringKeyword,
                      loc: {
                        start: {
                          line: 3,
                          column: 21,
                          index: 51
                        },
                        end: {
                          line: 3,
                          column: 27,
                          index: 57
                        }
                      }
                    },
                    requiredness: 'required',
                    defaultValue: null,
                    comments: [],
                    loc: {
                      start: {
                        line: 3,
                        column: 9,
                        index: 39
                      },
                      end: {
                        line: 3,
                        column: 35,
                        index: 65
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
                    line: 4,
                    column: 8,
                    index: 73
                  }
                }
              }
            }
          ]
        }
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
                  line: 2,
                  column: 17,
                  index: 17
                },
                end: {
                  line: 2,
                  column: 28,
                  index: 28
                }
              }
            },
            fields: [
              {
                type: SyntaxType.FieldDefinition,
                name: {
                  type: SyntaxType.Identifier,
                  value: 'message',
                  loc: {
                    start: {
                      line: 3,
                      column: 28,
                      index: 58
                    },
                    end: {
                      line: 3,
                      column: 35,
                      index: 65
                    }
                  }
                },
                fieldID: {
                  type: SyntaxType.FieldID,
                  value: 1,
                  loc: {
                    start: {
                      line: 3,
                      column: 9,
                      index: 39
                    },
                    end: {
                      line: 3,
                      column: 11,
                      index: 41
                    }
                  }
                },
                fieldType: {
                  type: SyntaxType.StringKeyword,
                  loc: {
                    start: {
                      line: 3,
                      column: 21,
                      index: 51
                    },
                    end: {
                      line: 3,
                      column: 27,
                      index: 57
                    }
                  }
                },
                requiredness: 'required',
                defaultValue: null,
                comments: [],
                loc: {
                  start: {
                    line: 3,
                    column: 9,
                    index: 39
                  },
                  end: {
                    line: 3,
                    column: 35,
                    index: 65
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
                line: 4,
                column: 8,
                index: 73
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
              comments: [],
              oneway: false,
              modifiers: [],
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

  it('should find and resolve imported identifiers as values', () => {
    const content: string = `
      include 'exception.thrift'

      struct MyStruct {
        1: exception.Status status = exception.Status.SUCCESS
      }
    `;
    const mockIncludeContent: string = `
      enum Status {
        SUCCESS,
        FAILURE
      }
    `
    const mockParsedFile: IParsedFile = {
      name: 'test',
      path: '',
      includes: [
        {
          name: 'exception',
          path: '',
          includes: [],
          ast: parse(mockIncludeContent)
        }
      ],
      ast: parse(content)
    }
    const actual: IResolvedFile = resolveFile(mockParsedFile)
    const expected: IResolvedFile = {
      name: 'test',
      path: '',
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
            ]
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
        MyStruct: {
          name: 'MyStruct',
          resolvedName: 'MyStruct',
          definition: {
            type: SyntaxType.StructDefinition,
            name: {
              type: SyntaxType.Identifier,
              value: 'MyStruct',
              loc: {
                start: {
                  line: 4,
                  column: 14,
                  index: 48
                },
                end: {
                  line: 4,
                  column: 22,
                  index: 56
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
                      index: 87
                    },
                    end: {
                      line: 5,
                      column: 35,
                      index: 93
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
                      index: 67
                    },
                    end: {
                      line: 5,
                      column: 11,
                      index: 69
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
                      index: 70
                    },
                    end: {
                      line: 5,
                      column: 28,
                      index: 86
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
                      index: 96
                    },
                    end: {
                      line: 5,
                      column: 62,
                      index: 120
                    }
                  }
                },
                comments: [],
                loc: {
                  start: {
                    line: 5,
                    column: 9,
                    index: 67
                  },
                  end: {
                    line: 5,
                    column: 62,
                    index: 120
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
                index: 128
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
          type: SyntaxType.StructDefinition,
          name: {
            type: SyntaxType.Identifier,
            value: 'MyStruct',
            loc: {
              start: {
                line: 4,
                column: 14,
                index: 48
              },
              end: {
                line: 4,
                column: 22,
                index: 56
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
                    index: 87
                  },
                  end: {
                    line: 5,
                    column: 35,
                    index: 93
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
                    index: 67
                  },
                  end: {
                    line: 5,
                    column: 11,
                    index: 69
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
                    index: 70
                  },
                  end: {
                    line: 5,
                    column: 28,
                    index: 86
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
                    index: 96
                  },
                  end: {
                    line: 5,
                    column: 62,
                    index: 120
                  }
                }
              },
              comments: [],
              loc: {
                start: {
                  line: 5,
                  column: 9,
                  index: 67
                },
                end: {
                  line: 5,
                  column: 62,
                  index: 120
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
              index: 128
            }
          }
        }
      ]
    }

    assert.deepEqual(actual, expected)
  })
})