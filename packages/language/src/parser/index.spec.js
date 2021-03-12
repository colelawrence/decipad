import assert from 'assert'
import { parse } from "./";

const tests = {
  "invalid syntax": {
    source: "A = 1 = 3",
    expectError: "Syntax error at line 1 col 8"
  },

  "expression is number literal": {
    source: " -41 ",
    ast: [{
      type: "literal",
      args: [
        "number",
        -41,
        null
      ],
      start: {
        char: 1,
        line: 1,
        column: 2
      },
      end: {
        char: 3,
        line: 1,
        column: 4
      }
    }]
  },

  "expression is decimal literal": {
    source: "\n\n  -41.5 ",
    ast: [{
      type: "literal",
      args: [
        "number",
        -41.5,
        null
      ],
      start: {
        char: 4,
        line: 3,
        column: 3
      },
      end: {
        char: 8,
        line: 3,
        column: 7
      }
    }]
  },

  "expression is exp literal": {
    source: " -21.3e4 ",
    ast: [{
      type: "literal",
      args: [
        "number",
        -213000,
        null
      ],
      start: {
        char: 1,
        line: 1,
        column: 2
      },
      end: {
        char: 7,
        line: 1,
        column: 8
      }
    }]
  },

  "expression is character literal": {
    source: " 'B' ",
    ast: [{
      type: "literal",
      args: [
        "char",
        "B"
      ],
      start: {
        char: 1,
        line: 1,
        column: 2
      },
      end: {
        char: 3,
        line: 1,
        column: 4
      }
    }]
  },

  "invalid character syntax": {
    source: " 'BB' ",
    expectError: 'Syntax error at line 1 col 4'
  },

  "expression is boolean literal true": {
    source: " true ",
    ast: [{
      type: "literal",
      args: [
        "boolean",
        true
      ],
      start: {
        char: 1,
        line: 1,
        column: 2
      },
      end: {
        char: 4,
        line: 1,
        column: 5
      }
    }]
  },

  "expression is boolean literal false": {
    source: " false ",
    ast: [{
      type: "literal",
      args: [
        "boolean",
        false
      ],
      start: {
        char: 1,
        line: 1,
        column: 2
      },
      end: {
        char: 5,
        line: 1,
        column: 6
      }
    }]
  },

  "ref assignment with simple name": {
    source: " simpleName = 12 ",
    ast: [{
      type: "assign",
      args: [
        {
          type: "def",
          args: [
            "simpleName"
          ],
          start: {
            char: 1,
            line: 1,
            column: 2,
          },
          end: {
            char: 10,
            line: 1,
            column: 11
          }
        },
        {
          type: "literal",
          args: [
            "number",
            12,
            null
          ],
          start: {
            char: 14,
            line: 1,
            column: 15
          },
          end: {
            char: 15,
            line: 1,
            column: 16
          }
        }
      ],
      start: {
        char: 1,
        line: 1,
        column: 2
      },
      end: {
        char: 15,
        line: 1,
        column: 16
      }
    }]
  },

  "ref assignment": {
    source: " this is a ref name = 12 ",
    ast: [{
      type: "assign",
      args: [
        {
          type: "def",
          args: [
            "this is a ref name"
          ],
          start: {
            char: 1,
            line: 1,
            column: 2
          },
          end: {
            char: 18,
            line: 1,
            column: 19
          }
        },
        {
          type: "literal",
          args: [
            "number",
            12,
            null
          ],
          start: {
            char: 22,
            line: 1,
            column: 23
          },
          end: {
            char: 23,
            line: 1,
            column: 24
          }
        }
      ],
      start: {
        char: 1,
        line: 1,
        column: 2
      },
      end: {
        char: 23,
        line: 1,
        column: 24
      }
    }]
  },

  "ref as expression": {
    source: "refname",
    ast: [{
      type: 'ref',
      args: [
        "refname"
      ],
      start: {
        char: 0,
        line: 1,
        column: 1
      },
      end: {
        char: 6,
        line: 1,
        column: 7
      }
    }]
  },

  "unary operation": {
    source: "-something",
    ast: [{
      type: "function-call",
      args: [
        {
          type: "funcref",
          args: ["-"],
          start: {
            char: 0,
            line: 1,
            column: 1
          },
          end: {
            char: 0,
            line: 1,
            column: 1
          }
        },
        {
          type: 'argument-list',
          args: [
            {
              type: "ref",
              args: [
                "something"
              ],
              start: {
                char: 1,
                line: 1,
                column: 2
              },
              end: {
                char: 9,
                line: 1,
                column: 10
              }
            }
          ],
          start: {
            char: 1,
            line: 1,
            column: 2
          },
          end: {
            char: 9,
            line: 1,
            column: 10
          }
        }
      ],
      start: {
        char: 0,
        line: 1,
        column: 1
      },
      end: {
        char: 9,
        line: 1,
        column: 10
      }
    }]
  },

  "binary op between 2 literals": {
    source: " 2 + 3 ",
    ast: [{
      type: 'function-call',
      args: [
        {
          type: "funcref",
          args: ["+"],
          start: {
            char: 3,
            line: 1,
            column: 4
          },
          end: {
            char: 3,
            line: 1,
            column: 4
          }
        },
        {
          type: 'argument-list',
          args: [
            {
              type: 'literal',
              args: [
                "number",
                2,
                null
              ],
              start: {
                char: 1,
                line: 1,
                column: 2
              },
              end: {
                char: 1,
                line: 1,
                column: 2
              }
            },
            {
              type: 'literal',
              args: [
                "number",
                3,
                null
              ],
              start: {
                char: 5,
                line: 1,
                column: 6
              },
              end: {
                char: 5,
                line: 1,
                column: 6
              }
            }
          ],
          start: {
            char: 1,
            line: 1,
            column: 2
          },
          end: {
            char: 5,
            line: 1,
            column: 6
          }
        }
      ],
      start: {
        char: 1,
        line: 1,
        column: 2
      },
      end: {
        char: 5,
        line: 1,
        column: 6
      }
    }]
  },

  "reference as binary op": {
    source: " 2 `some reference` 3 ",
    ast: [{
      type: 'function-call',
      args: [
        {
          type: "funcref",
          args: ["some reference"],
          start: {
            char: 3,
            line: 1,
            column: 4
          },
          end: {
            char: 18,
            line: 1,
            column: 19
          }
        },
        {
          type: 'argument-list',
          args: [
            {
              type: 'literal',
              args: [
                "number",
                2,
                null
              ],
              start: {
                char: 1,
                line: 1,
                column: 2
              },
              end: {
                char: 1,
                line: 1,
                column: 2
              }
            },
            {
              type: 'literal',
              args: [
                "number",
                3,
                null
              ],
              start: {
                char: 20,
                line: 1,
                column: 21
              },
              end: {
                char: 20,
                line: 1,
                column: 21
              }
            }
          ],
          start: {
            char: 1,
            line: 1,
            column: 2
          },
          end: {
            char: 20,
            line: 1,
            column: 21
          }
        }
      ],
      start: {
        char: 1,
        line: 1,
        column: 2
      },
      end: {
        char: 20,
        line: 1,
        column: 21
      }
    }]
  },

  "binary operation": {
     source: "Something - `Something Else`",
     ast: [{
      type: "function-call",
      args: [
        {
          type: "funcref",
          args: ["-"],
          start: {
            char: 10,
            line: 1,
            column: 11
          },
          end: {
            char: 10,
            line: 1,
            column: 11
          }
        },
        {
          type: 'argument-list',
          args: [
            {
              type: "ref",
              args: ["Something"],
              start: {
                char: 0,
                line: 1,
                column: 1
              },
              end: {
                char: 8,
                line: 1,
                column: 9
              }
            },
            {
              type: "ref",
              args: ["Something Else"],
              start: {
                char: 12,
                line: 1,
                column: 13
              },
              end: {
                char: 27,
                line: 1,
                column: 28
              }
            }
          ],
          start: {
            char: 0,
            line: 1,
            column: 1
          },
          end: {
            char: 27,
            line: 1,
            column: 28
          }
        }
      ],
      start: {
        char: 0,
        line: 1,
        column: 1
      },
      end: {
        char: 27,
        line: 1,
        column: 28
      }
     }]
   },

  "conditional": {
    source: "if Condition then IfTrue else `If False`",
    ast: [{
      type: "conditional",
      args: [
        {
          type: "ref",
          args: ["Condition"],
          start: {
            char: 3,
            line: 1,
            column: 4
          },
          end: {
            char: 11,
            line: 1,
            column: 12
          }
        },
        {
          type: "ref",
          args: ["IfTrue"],
          start: {
            char: 18,
            line: 1,
            column: 19
          },
          end: {
            char: 23,
            line: 1,
            column: 24
          }
        },
        {
          type: "ref",
          args: ["If False"],
          start: {
            char: 30,
            line: 1,
            column: 31
          },
          end: {
            char: 39,
            line: 1,
            column: 40
          }
        },
      ],
      start: {
        char: 0,
        line: 1,
        column: 1
      },
      end: {
        char: 39,
        line: 1,
        column: 40
      }
    }]
  },

  "function definition with simple name": {
    source: "functionname = arg1 arg2 => Ref1 ",
    ast: [{
      type: "function-definition",
      args: [
        {
          type: "funcdef",
          args: ["functionname"],
          start: {
            char: 0,
            line: 1,
            column: 1
          },
          end: {
            char: 11,
            line: 1,
            column: 12
          }
        },
        {
          type: "argument-names",
          args: [
            {
              type: "def",
              args: ["arg1"],
              start: {
                char: 15,
                line: 1,
                column: 16
              },
              end: {
                char: 18,
                line: 1,
                column: 19
              }
             },
            {
              type: "def",
              args: ["arg2"],
              start: {
                char: 20,
                line: 1,
                column: 21
              },
              end: {
                char: 23,
                line: 1,
                column: 24
              }
            },
          ],
          start: {
            char: 15,
            line: 1,
            column: 16
          },
          end: {
            char: 23,
            line: 1,
            column: 24
          }
        },
        {
          type: "block",
          args: [
            {
              type: "ref",
              args: ["Ref1"],
              start: {
                char: 28,
                line: 1,
                column: 29
              },
              end: {
                char: 31,
                line: 1,
                column: 32
              }
            }
          ],
          start: {
            char: 27,
            line: 1,
            column: 28
          },
          end: {
            char: 31,
            line: 1,
            column: 32
          }
        }
      ],
      start: {
        char: 0,
        line: 1,
        column: 1
      },
      end: {
        char: 31,
        line: 1,
        column: 32
      }
    }]
   },

  "function definition": {
    source: "function name = arg1 arg2 => Ref1",
    ast: [{
      type: "function-definition",
      args: [
        {
          type: "funcdef",
          args: ["function name"],
          start: {
            char: 0,
            line: 1,
            column: 1
          },
          end: {
            char: 12,
            line: 1,
            column: 13
          }
        },
        {
          type: "argument-names",
          args: [
            {
              type: "def",
              args: ["arg1"],
              start: {
                char: 16,
                line: 1,
                column: 17
              },
              end: {
                char: 19,
                line: 1,
                column: 20
              }
            },
            {
              type: "def",
              args: ["arg2"],
              start: {
                char: 21,
                line: 1,
                column: 22
              },
              end: {
                char: 24,
                line: 1,
                column: 25
              }
            },
          ],
          start: {
            char: 16,
            line: 1,
            column: 17
          },
          end: {
            char: 24,
            line: 1,
            column: 25
          }
        },
        {
          type: "block",
          args: [
            {
              type: "ref",
              args: ["Ref1"],
              start: {
                char: 29,
                line: 1,
                column: 30
              },
              end: {
                char: 32,
                line: 1,
                column: 33
              }
            }
          ],
          start: {
            char: 28,
            line: 1,
            column: 29
          },
          end: {
            char: 32,
            line: 1,
            column: 33
          }
        }
      ],
      start: {
        char: 0,
        line: 1,
        column: 1
      },
      end: {
        char: 32,
        line: 1,
        column: 33
      }
     }]
   },

  "function call": {
    source: "functionname 1 2",
    ast: [{
      type: "function-call",
      args: [
        {
          type: "funcref",
          args: ["functionname"],
          start: {
            char: 0,
            line: 1,
            column: 1
          },
          end: {
            char: 11,
            line: 1,
            column: 12
          }
        },
        {
          type: "argument-list",
          args: [
            {
              type: "literal",
              args: ["number", 1, null],
              start: {
                char: 13,
                line: 1,
                column: 14
              },
              end: {
                char: 13,
                line: 1,
                column: 14
              }
            },
            {
              type: "literal",
              args: ["number", 2, null],
              start: {
                char: 15,
                line: 1,
                column: 16
              },
              end: {
                char: 15,
                line: 1,
                column: 16
              }
            }
          ],
          start: {
            char: 13,
            line: 1,
            column: 14
          },
          end: {
            char: 15,
            line: 1,
            column: 16
          }
        }
      ],
      start: {
        char: 0,
        line: 1,
        column: 1
      },
      end: {
        char: 15,
        line: 1,
        column: 16
      }
    }]
  },

  "operator precedence": {
    source: "2 + 3 * 4",
    ast: [{
      type: "function-call",
      args: [
        {
          type: 'funcref',
          args: ['+'],
          start: {
            char: 2,
            line: 1,
            column: 3
          },
          end: {
            char: 2,
            line: 1,
            column: 3
          }
        },
        {
          type: 'argument-list',
          args: [
            {
              type: 'literal',
              args: ["number", 2, null],
              start: {
                char: 0,
                line: 1,
                column: 1
              },
              end: {
                char: 0,
                line: 1,
                column: 1
              }
            },
            {
              type: 'function-call',
              args: [
                {
                  type: 'funcref',
                  args: ['*'],
                  start: {
                    char: 5,
                    line: 1,
                    column: 6
                  },
                  end: {
                    char: 5,
                    line: 1,
                    column: 6
                  }
                },
                {
                  type: 'argument-list',
                  args: [
                    {
                      type: 'literal',
                      args: ['number', 3, null],
                      start: {
                        char: 4,
                        line: 1,
                        column: 5
                      },
                      end: {
                        char: 4,
                        line: 1,
                        column: 5
                      }
                    },
                    {
                      type: 'literal',
                      args: ['number', 4, null],
                      start: {
                        char: 8,
                        line: 1,
                        column: 9
                      },
                      end: {
                        char: 8,
                        line: 1,
                        column: 9
                      }
                    }
                  ],
                  start: {
                    char: 4,
                    line: 1,
                    column: 5
                  },
                  end: {
                    char: 6,
                    line: 1,
                    column: 7
                  }
                }
              ],
              start: {
                char: 4,
                line: 1,
                column: 5
              },
              end: {
                char: 6,
                line: 1,
                column: 7
              }
            }
          ],
          start: {
            char: 0,
            line: 1,
            column: 1
          },
          end: {
            char: 6,
            line: 1,
            column: 7
          }
        }
      ],
      start: {
        char: 0,
        line: 1,
        column: 1
      },
      end: {
        char: 6,
        line: 1,
        column: 7
      }
    }]
  },

  "expression is number with units": {
    source: "10 apples",
    ast: [{
      type: "literal",
      args: [
        "number",
        10,
        [
          {
            unit: "apples",
            exp: 1,
            multiplier: 1,
            known: false,
            start: {
              char: 3,
              line: 1,
              column: 4
            },
            end: {
              char: 8,
              line: 1,
              column: 9
            }
          }
        ]
      ],
      start: {
        char: 0,
        line: 1,
        column: 1
      },
      end: {
        char: 8,
        line: 1,
        column: 9
      }
    }]
  },

  "expression is number with composed units": {
    source: "10 apples.oranges",
    ast: [{
      type: "literal",
      args: [
        "number",
        10,
        [
          {
            unit: "apples",
            exp: 1,
            multiplier: 1,
            known: false,
            start: {
              char: 3,
              line: 1,
              column: 4
            },
            end: {
              char: 8,
              line: 1,
              column: 9
            }
          },
          {
            unit: "oranges",
            exp: 1,
            multiplier: 1,
            known: false,
            start: {
              char: 10,
              line: 1,
              column: 11
            },
            end: {
              char: 16,
              line: 1,
              column: 17
            }
          }
        ]
      ],
      start: {
        char: 0,
        line: 1,
        column: 1
      },
      end: {
        char: 16,
        line: 1,
        column: 17
      }
    }]
  },

  "expression is number with divided units": {
    source: "10 apples/oranges",
    ast: [{
      type: "literal",
      args: [
        "number",
        10,
        [
          {
            unit: "apples",
            exp: 1,
            multiplier: 1,
            known: false,
            start: {
              char: 3,
              line: 1,
              column: 4
            },
            end: {
              char: 8,
              line: 1,
              column: 9
            }
          },
          {
            unit: "oranges",
            exp: -1,
            multiplier: 1,
            known: false,
            start: {
              char: 10,
              line: 1,
              column: 11
            },
            end: {
              char: 16,
              line: 1,
              column: 17
            }
          }
        ]
      ],
      start: {
        char: 0,
        line: 1,
        column: 1
      },
      end: {
        char: 16,
        line: 1,
        column: 17
      }
    }]
  },

  "expression is number with multiplier simple unit": {
    source: "10 km",
    ast: [{
      type: "literal",
      args: [
        "number",
        10,
        [
          {
            unit: "m",
            exp: 1,
            multiplier: 1000,
            known: true,
            start: {
              char: 3,
              line: 1,
              column: 4
            },
            end: {
              char: 4,
              line: 1,
              column: 5
            }
          }
        ]
      ],
      start: {
        char: 0,
        line: 1,
        column: 1
      },
      end: {
        char: 4,
        line: 1,
        column: 5
      }
    }]
  },

  "expression is number with simple known unit": {
    source: "2 Gbytes",
    ast: [{
      type: "literal",
      args: [
        "number",
        2,
        [
          {
            unit: "bytes",
            exp: 1,
            multiplier: 1e9,
            known: true,
            start: {
              char: 2,
              line: 1,
              column: 3
            },
            end: {
              char: 7,
              line: 1,
              column: 8
            }
          }
        ]
      ],
      start: {
        char: 0,
        line: 1,
        column: 1
      },
      end: {
        char: 7,
        line: 1,
        column: 8
      }
    }]
  },

  "expression is number with composed squared unit": {
    source: "3 km^2",
    ast: [{
      type: "literal",
      args: [
        "number",
        3,
        [
          {
            unit: "m",
            exp: 2,
            multiplier: 1000,
            known: true,
            start: {
              char: 2,
              line: 1,
              column: 3
            },
            end: {
              char: 5,
              line: 1,
              column: 6
            }
          }
        ]
      ],
      start: {
        char: 0,
        line: 1,
        column: 1
      },
      end: {
        char: 5,
        line: 1,
        column: 6
      }
    }]
  },

  "expression is number with complex composed unit": {
    source: "3 kg^3/hm^2",
    ast: [{
      type: "literal",
      args: [
        "number",
        3,
        [
          {
            unit: "kg",
            exp: 3,
            multiplier: 1,
            known: true,
            start: {
              char: 2,
              line: 1,
              column: 3,
            },
            end: {
              char: 5,
              line: 1,
              column: 6
            }
          },
          {
            unit: "m",
            exp: -2,
            multiplier: 100,
            known: true,
            start: {
              char: 7,
              line: 1,
              column: 8
            },
            end: {
              char: 10,
              line: 1,
              column: 11
            }
          }
        ]
      ],
      start: {
        char: 0,
        line: 1,
        column: 1
      },
      end: {
        char: 10,
        line: 1,
        column: 11
      }
    }]
  },

  "expression is number with complex composed unit (2)": {
    source: "3 kg^3/hm^2.MWatt",
    ast: [{
      type: "literal",
      args: [
        "number",
        3,
        [
          {
            unit: "kg",
            exp: 3,
            multiplier: 1,
            known: true,
            start: {
              char: 2,
              line: 1,
              column: 3
            },
            end: {
              char: 5,
              line: 1,
              column: 6
            }
          },
          {
            unit: "m",
            exp: -2,
            multiplier: 100,
            known: true,
            start: {
              char: 7,
              line: 1,
              column: 8
            },
            end: {
              char: 10,
              line: 1,
              column: 11
            }
          },
          {
            unit: "Watt",
            exp: 1,
            multiplier: 1000000,
            known: true,
            start: {
              char: 12,
              line: 1,
              column: 13
            },
            end: {
              char: 16,
              line: 1,
              column: 17
            }
          }
        ]
      ],
      start: {
        char: 0,
        line: 1,
        column: 1
      },
      end: {
        char: 16,
        line: 1,
        column: 17
      }
    }]
  },

  "one statement per line": {
    source: "RefName1 = 1\nRefName2 = 2",
    ast: [
      {
        type: "assign",
        args: [
          {
            type: "def",
            args: [
              "RefName1"
            ],
            start: {
              char: 0,
              line: 1,
              column: 1
            },
            end: {
              char: 7,
              line: 1,
              column: 8
            }
          },
          {
            type: "literal",
            args: [
              "number",
              1,
              null
            ],
            start: {
              char: 11,
              line: 1,
              column: 12
            },
            end: {
              char: 11,
              line: 1,
              column: 12
            }
          }
        ],
        start: {
          char: 0,
          line: 1,
          column: 1
        },
        end: {
          char: 11,
          line: 1,
          column: 12
        }
      },
      {
        type: "assign",
        args: [
          {
            type: "def",
            args: [
              "RefName2"
            ],
            start: {
              char: 13,
              line: 2,
              column: 1
            },
            end: {
              char: 20,
              line: 2,
              column: 8
            }
          },
          {
            type: "literal",
            args: [
              "number",
              2,
              null
            ],
            start: {
              char: 24,
              line: 2,
              column: 12
            },
            end: {
              char: 24,
              line: 2,
              column: 12
            }
          }
        ],
        start: {
          char: 13,
          line: 2,
          column: 1
        },
        end: {
          char: 24,
          line: 2,
          column: 12
        }
      }
    ]
  },

  "one statement spans multiple lines": {
    source: "RefName1\n=\n1\nRefName2\n=\n2",
    ast: [
      {
        type: "assign",
        args: [
          {
            type: "def",
            args: [
              "RefName1"
            ],
            start: {
              char: 0,
              line: 1,
              column: 1
            },
            end: {
              char: 7,
              line: 1,
              column: 8
            }
          },
          {
            type: "literal",
            args: [
              "number",
              1,
              null
            ],
            start: {
              char: 11,
              line: 3,
              column: 1
            },
            end: {
              char: 11,
              line: 3,
              column: 1
            }
          }
        ],
        start: {
          char: 0,
          line: 1,
          column: 1
        },
        end: {
          char: 11,
          line: 3,
          column: 1
        }
      },
      {
        type: "assign",
        args: [
          {
            type: "def",
            args: [
              "RefName2"
            ],
            start: {
              char: 13,
              line: 4,
              column: 1
            },
            end: {
              char: 20,
              line: 4,
              column: 8
            }
          },
          {
            type: "literal",
            args: [
              "number",
              2,
              null
            ],
            start: {
              char: 24,
              line: 6,
              column: 1
            },
            end: {
              char: 24,
              line: 6,
              column: 1
            }
          }
        ],
        start: {
          char: 13,
          line: 4,
          column: 1
        },
        end: {
          char: 24,
          line: 6,
          column: 1
        }
      }
    ]
  },

  "one expression spans multiple lines": {
    source: "RefName1\n=\n1\n+\n2\n2\n+\n3",
    ast: [
      {
        "type": "assign",
        "args": [
          {
            "type": "def",
            "args": [
              "RefName1"
            ],
            start: {
              char: 0,
              line: 1,
              column: 1
            },
            end: {
              char: 7,
              line: 1,
              column: 8
            }
          },
          {
            "type": "function-call",
            "args": [
              {
                "type": "funcref",
                "args": [
                  "+"
                ],
                start: {
                  char: 13,
                  line: 4,
                  column: 1
                },
                end: {
                  char: 13,
                  line: 4,
                  column: 1
                }
              },
              {
                "type": "argument-list",
                "args": [
                  {
                    "type": "literal",
                    "args": [
                      "number",
                      1,
                      null
                    ],
                    start: {
                      char: 11,
                      line: 3,
                      column: 1
                    },
                    end: {
                      char: 11,
                      line: 3,
                      column: 1
                    }
                  },
                  {
                    "type": "literal",
                    "args": [
                      "number",
                      2,
                      null
                    ],
                    start: {
                      char: 15,
                      line: 5,
                      column: 1
                    },
                    end: {
                      char: 15,
                      line: 5,
                      column: 1
                    }
                  }
                ],
                start: {
                  char: 11,
                  line: 3,
                  column: 1
                },
                end: {
                  char: 15,
                  line: 5,
                  column: 1
                }
              }
            ],
            start: {
              char: 11,
              line: 3,
              column: 1
            },
            end: {
              char: 15,
              line: 5,
              column: 1
            }
          }
        ],
        start: {
          char: 0,
          line: 1,
          column: 1
        },
        end: {
          char: 15,
          line: 5,
          column: 1
        }
      },
      {
        "type": "function-call",
        "args": [
          {
            "type": "funcref",
            "args": [
              "+"
            ],
            start: {
              char: 19,
              line: 7,
              column: 1
            },
            end: {
              char: 19,
              line: 7,
              column: 1
            }
          },
          {
            "type": "argument-list",
            "args": [
              {
                "type": "literal",
                "args": [
                  "number",
                  2,
                  null
                ],
                start: {
                  char: 17,
                  line: 6,
                  column: 1
                },
                end: {
                  char: 17,
                  line: 6,
                  column: 1
                }
              },
              {
                "type": "literal",
                "args": [
                  "number",
                  3,
                  null
                ],
                start: {
                  char: 21,
                  line: 8,
                  column: 1
                },
                end: {
                  char: 21,
                  line: 8,
                  column: 1
                }
              }
            ],
            start: {
              char: 17,
              line: 6,
              column: 1
            },
            end: {
              char: 21,
              line: 8,
              column: 1
            }
          }
        ],
        start: {
          char: 17,
          line: 6,
          column: 1
        },
        end: {
          char: 21,
          line: 8,
          column: 1
        }
      }
    ]
  },

  "empty column": {
    source: " [ ] ",
    ast: [
      {
        "type": "column",
        "args": [
          []
        ],
        "start": {
          "char": 1,
          "line": 1,
          "column": 2
        },
        "end": {
          "char": 3,
          "line": 1,
          "column": 4
        }
      }
    ]
  },

  "column with two expressions": {
    source: " [ 1, 2 + 3 ] ",
    ast: [
      {
        "type": "column",
        "args": [
          [
            {
              "type": "literal",
              "args": [
                "number",
                1,
                null
              ],
              "location": 3,
              "length": 1
            },
            {
              "type": "function-call",
              "args": [
                {
                  "type": "funcref",
                  "args": [
                    "+"
                  ],
                  "location": 8,
                  "length": 1
                },
                {
                  "type": "argument-list",
                  "args": [
                    {
                      "type": "literal",
                      "args": [
                        "number",
                        2,
                        null
                      ],
                      "location": 6,
                      "length": 1
                    },
                    {
                      "type": "literal",
                      "args": [
                        "number",
                        3,
                        null
                      ],
                      "location": 10,
                      "length": 1
                    }
                  ],
                  "location": 6,
                  "length": 5
                }
              ],
              "location": 6,
              "length": 5
            }
          ]
        ],
        "start": {
          "char": 1,
          "line": 1,
          "column": 2
        },
        "end": {
          "char": 10,
          "line": 1,
          "column": 11
        }
      }
    ]
  },

  "comparison and boolean operators": {
    source: "a > b && c < d",
    ast: [
      {
        type: "function-call",
        args: [
          {
            type: "funcref",
            args: ["&&"],
            start: {
              char: 6,
              line: 1,
              column: 7,
            },
            end: {
              char: 7,
              line: 1,
              column: 8
            }
          },
          {
            type: "argument-list",
            args: [
              {
                type: "function-call",
                args: [
                  {
                    type: "funcref",
                    args: [">"],
                    start: {
                      char: 2,
                      line: 1,
                      column: 3
                    },
                    end: {
                      char: 2,
                      line: 1,
                      column: 3
                    }
                  },
                  {
                    type: "argument-list",
                    args: [
                      {
                        type: "ref",
                        args: ["a"],
                        start: {
                          char: 0,
                          line: 1,
                          column: 1
                        },
                        end: {
                          char: 0,
                          line: 1,
                          column: 1
                        }
                      },
                      {
                        type: "ref",
                        args: ["b"],
                        start: {
                          char: 4,
                          line: 1,
                          column: 5
                        },
                        end: {
                          char: 4,
                          line: 1,
                          column: 5
                        }
                      }
                    ],
                    start: {
                      char: 0,
                      line: 1,
                      column: 1
                    },
                    end: {
                      char: 4,
                      line: 1,
                      column: 5
                    }
                  }
                ],
                start: {
                  char: 0,
                  line: 1,
                  column: 1
                },
                end: {
                  char: 4,
                  line: 1,
                  column: 5
                }
              },
              {
                type: "function-call",
                args: [
                  {
                    type: "funcref",
                    args: ["<"],
                    start: {
                      char: 11,
                      line: 1,
                      column: 12
                    },
                    end: {
                      char: 11,
                      line: 1,
                      column: 12
                    }
                  },
                  {
                    type: "argument-list",
                    args: [
                      {
                        type: "ref",
                        args: ["c"],
                        start: {
                          char: 9,
                          line: 1,
                          column: 10
                        },
                        end: {
                          char: 9,
                          line: 1,
                          column: 10
                        }
                      },
                      {
                        type: "ref",
                        args: ["d"],
                        start: {
                          char: 13,
                          line: 1,
                          column: 14
                        },
                        end: {
                          char: 13,
                          line: 1,
                          column: 14
                        }
                      }
                    ],
                    start: {
                      char: 9,
                      line: 1,
                      column:10
                    },
                    end: {
                      char: 13,
                      line: 1,
                      column: 14
                    }
                  }
                ],
                start: {
                  char: 9,
                  line: 1,
                  column: 10
                },
                end: {
                  char: 13,
                  line: 1,
                  column: 14
                }
              },
            ],
            start: {
              char: 0,
              line: 1,
              column: 1
            },
            end: {
              char: 13,
              line: 1,
              column: 14
            }
          }
        ],
        start: {
          char: 0,
          line: 1,
          column: 1
        },
        end: {
          char: 13,
          line: 1,
          column: 14
        }
      }
    ],
    start: {
      char: 0,
      line: 1,
      column: 1
    },
    end: {
      char: 13,
      line: 1,
      column: 14
    }
  },

  "function declaration and use": {
    source: "functionname = a b => a + b\n\nfunctionname 1 2",
    ast: [{
      "type": "function-definition",
      "args": [
        {
          "type": "funcdef",
          "args": [
            "functionname"
          ],
          "start": {
            "char": 0,
            "line": 1,
            "column": 1
          },
          "end": {
            "char": 11,
            "line": 1,
            "column": 12
          }
        },
        {
          "type": "argument-names",
          "args": [
            {
              "type": "def",
              "args": [
                "a"
              ],
              "start": {
                "char": 15,
                "line": 1,
                "column": 16
              },
              "end": {
                "char": 15,
                "line": 1,
                "column": 16
              }
            },
            {
              "type": "def",
              "args": [
                "b"
              ],
              "start": {
                "char": 17,
                "line": 1,
                "column": 18
              },
              "end": {
                "char": 17,
                "line": 1,
                "column": 18
              }
            }
          ],
          "start": {
            "char": 15,
            "line": 1,
            "column": 16
          },
          "end": {
            "char": 17,
            "line": 1,
            "column": 18
          }
        },
        {
          "type": "block",
          "args": [
            {
              "type": "function-call",
              "args": [
                {
                  "type": "funcref",
                  "args": [
                    "+"
                  ],
                  "start": {
                    "char": 24,
                    "line": 1,
                    "column": 25
                  },
                  "end": {
                    "char": 24,
                    "line": 1,
                    "column": 25
                  }
                },
                {
                  "type": "argument-list",
                  "args": [
                    {
                      "type": "ref",
                      "args": [
                        "a"
                      ],
                      "start": {
                        "char": 22,
                        "line": 1,
                        "column": 23
                      },
                      "end": {
                        "char": 22,
                        "line": 1,
                        "column": 23
                      }
                    },
                    {
                      "type": "ref",
                      "args": [
                        "b"
                      ],
                      "start": {
                        "char": 26,
                        "line": 1,
                        "column": 27
                      },
                      "end": {
                        "char": 26,
                        "line": 1,
                        "column": 27
                      }
                    }
                  ],
                  "start": {
                    "char": 22,
                    "line": 1,
                    "column": 23
                  },
                  "end": {
                    "char": 26,
                    "line": 1,
                    "column": 27
                  }
                }
              ],
              "start": {
                "char": 22,
                "line": 1,
                "column": 23
              },
              "end": {
                "char": 26,
                "line": 1,
                "column": 27
              }
            }
          ],
          "start": {
            "char": 21,
            "line": 1,
            "column": 22
          },
          "end": {
            "char": 26,
            "line": 1,
            "column": 27
          }
        }
      ],
      "start": {
        "char": 0,
        "line": 1,
        "column": 1
      },
      "end": {
        "char": 26,
        "line": 1,
        "column": 27
      }
    },
    {
      "type": "function-call",
      "args": [
        {
          "type": "funcref",
          "args": [
            "functionname"
          ],
          "start": {
            "char": 29,
            "line": 3,
            "column": 1
          },
          "end": {
            "char": 40,
            "line": 3,
            "column": 12
          }
        },
        {
          "type": "argument-list",
          "args": [
            {
              "type": "literal",
              "args": [
                "number",
                1,
                null
              ],
              "start": {
                "char": 42,
                "line": 3,
                "column": 14
              },
              "end": {
                "char": 42,
                "line": 3,
                "column": 14
              }
            },
            {
              "type": "literal",
              "args": [
                "number",
                2,
                null
              ],
              "start": {
                "char": 44,
                "line": 3,
                "column": 16
              },
              "end": {
                "char": 44,
                "line": 3,
                "column": 16
              }
            }
          ],
          "start": {
            "char": 42,
            "line": 3,
            "column": 14
          },
          "end": {
            "char": 44,
            "line": 3,
            "column": 16
          }
        }
      ],
      "start": {
        "char": 29,
        "line": 3,
        "column": 1
      },
      "end": {
        "char": 44,
        "line": 3,
        "column": 16
      }
    }
  ]},

  "empty table": {
    source: " { } ",
    ast: [{
      type: 'table',
      args: [
      ],
      start: {
        char: 1,
        line: 1,
        column: 2
      },
      end: {
        char: 3,
        line: 1,
        column: 4
      }
    }]
  },

  "table with one implicit coldef": {
    source: " { abc } ",
    ast: [{
      type: 'table',
      args: [
        {
          type: 'coldef',
          args: [ 'abc' ],
          start: {
            char: 3,
            line: 1,
            column: 4
          },
          end: {
            char: 5,
            line: 1,
            column: 6
          }
        },
        {
          type: 'ref',
          args: ['abc'],
          start: {
            char: 3,
            line: 1,
            column: 4
          },
          end: {
            char: 5,
            line: 1,
            column: 6
          }
        }
      ],
      start: {
        char: 1,
        line: 1,
        column: 2
      },
      end: {
        char: 7,
        line: 1,
        column: 8
      }
    }]
  },

  "table with three implicit coldefs": {
    source: " { abc  ,  def,   ghi} ",
    ast: [{
      "type": "table",
      "args": [
        {
          "type": "coldef",
          "args": [
            "abc"
          ],
          "start": {
            "char": 3,
            "line": 1,
            "column": 4
          },
          "end": {
            "char": 5,
            "line": 1,
            "column": 6
          }
        },
        {
          "type": "ref",
          "args": [
            "abc"
          ],
          "start": {
            "char": 3,
            "line": 1,
            "column": 4
          },
          "end": {
            "char": 5,
            "line": 1,
            "column": 6
          }
        },
        {
          "type": "coldef",
          "args": [
            "def"
          ],
          "start": {
            "char": 11,
            "line": 1,
            "column": 12
          },
          "end": {
            "char": 13,
            "line": 1,
            "column": 14
          }
        },
        {
          "type": "ref",
          "args": [
            "def"
          ],
          "start": {
            "char": 11,
            "line": 1,
            "column": 12
          },
          "end": {
            "char": 13,
            "line": 1,
            "column": 14
          }
        },
        {
          "type": "coldef",
          "args": [
            "ghi"
          ],
          "start": {
            "char": 18,
            "line": 1,
            "column": 19
          },
          "end": {
            "char": 20,
            "line": 1,
            "column": 21
          }
        },
        {
          "type": "ref",
          "args": [
            "ghi"
          ],
          "start": {
            "char": 18,
            "line": 1,
            "column": 19
          },
          "end": {
            "char": 20,
            "line": 1,
            "column": 21
          }
        }
      ],
      "start": {
        "char": 1,
        "line": 1,
        "column": 2
      },
      "end": {
        "char": 21,
        "line": 1,
        "column": 22
      }
    }
  ]},

  "table with three implicit coldefs newline separated": {
    source: " { abc \n  def    \n   ghi \n } ",
    ast: [{
      "type": "table",
      "args": [
        {
          "type": "coldef",
          "args": [
            "abc"
          ],
          "start": {
            "char": 3,
            "line": 1,
            "column": 4
          },
          "end": {
            "char": 5,
            "line": 1,
            "column": 6
          }
        },
        {
          "type": "ref",
          "args": [
            "abc"
          ],
          "start": {
            "char": 3,
            "line": 1,
            "column": 4
          },
          "end": {
            "char": 5,
            "line": 1,
            "column": 6
          }
        },
        {
          "type": "coldef",
          "args": [
            "def"
          ],
          "start": {
            "char": 10,
            "line": 2,
            "column": 3
          },
          "end": {
            "char": 12,
            "line": 2,
            "column": 5
          }
        },
        {
          "type": "ref",
          "args": [
            "def"
          ],
          "start": {
            "char": 10,
            "line": 2,
            "column": 3
          },
          "end": {
            "char": 12,
            "line": 2,
            "column": 5
          }
        },
        {
          "type": "coldef",
          "args": [
            "ghi"
          ],
          "start": {
            "char": 21,
            "line": 3,
            "column": 4
          },
          "end": {
            "char": 23,
            "line": 3,
            "column": 6
          }
        },
        {
          "type": "ref",
          "args": [
            "ghi"
          ],
          "start": {
            "char": 21,
            "line": 3,
            "column": 4
          },
          "end": {
            "char": 23,
            "line": 3,
            "column": 6
          }
        }
      ],
      "start": {
        "char": 1,
        "line": 1,
        "column": 2
      },
      "end": {
        "char": 27,
        "line": 4,
        "column": 2
      }
    }
  ]
  },

  "table with explicit value as column": {
    source: "  { abc = [ 1 , 2 ]  }",
    ast: [{
      "type": "table",
      "args": [
        {
          "type": "coldef",
          "args": [
            "abc"
          ],
          "start": {
            "char": 4,
            "line": 1,
            "column": 5
          },
          "end": {
            "char": 6,
            "line": 1,
            "column": 7
          }
        },
        {
          "type": "column",
          "args": [
            [
              {
                "type": "literal",
                "args": [
                  "number",
                  1,
                  null
                ],
                "location": 12,
                "length": 1
              },
              {
                "type": "literal",
                "args": [
                  "number",
                  2,
                  null
                ],
                "location": 16,
                "length": 1
              }
            ]
          ],
          "start": {
            "char": 10,
            "line": 1,
            "column": 11
          },
          "end": {
            "char": 16,
            "line": 1,
            "column": 17
          }
        }
      ],
      "start": {
        "char": 2,
        "line": 1,
        "column": 3
      },
      "end": {
        "char": 19,
        "line": 1,
        "column": 20
      }
    }
  ]},

  "table with mixed defs in each line": {
    source: "  { \n abc \n def = [ 1 , 2 ] \n  }",
    ast: [{
      "type": "table",
      "args": [
        {
          "type": "coldef",
          "args": [
            "abc"
          ],
          "start": {
            "char": 6,
            "line": 2,
            "column": 2
          },
          "end": {
            "char": 8,
            "line": 2,
            "column": 4
          }
        },
        {
          "type": "ref",
          "args": [
            "abc"
          ],
          "start": {
            "char": 6,
            "line": 2,
            "column": 2
          },
          "end": {
            "char": 8,
            "line": 2,
            "column": 4
          }
        },
        {
          "type": "coldef",
          "args": [
            "def"
          ],
          "start": {
            "char": 12,
            "line": 3,
            "column": 2
          },
          "end": {
            "char": 14,
            "line": 3,
            "column": 4
          }
        },
        {
          "type": "column",
          "args": [
            [
              {
                "type": "literal",
                "args": [
                  "number",
                  1,
                  null
                ],
                "location": 20,
                "length": 1
              },
              {
                "type": "literal",
                "args": [
                  "number",
                  2,
                  null
                ],
                "location": 24,
                "length": 1
              }
            ]
          ],
          "start": {
            "char": 18,
            "line": 3,
            "column": 8
          },
          "end": {
            "char": 24,
            "line": 3,
            "column": 14
          }
        }
      ],
      "start": {
        "char": 2,
        "line": 1,
        "column": 3
      },
      "end": {
        "char": 29,
        "line": 4,
        "column": 1
      }
    }
  ]}
}

for (const [name, spec] of Object.entries(tests)) {
  test(name, () => {
    const {source, ast, expectError} = spec
    let results, parseError
    try {
      results = parse([{
        id: name,
        source }])
    } catch (err) {
      parseError = err
    }

    if (parseError) {
      if (!expectError) {
        throw parseError
      } else {
        expect(parseError.message).toMatch(expectError)
      }
    } else {
      if (expectError) {
        throw new Error(`expected error "${expectError}" to occur`)
      }

      assert(results.length === 1)

      const result = results[0]

      if (result.solutions.length > 1) {
        throw new Error(
          `Ambiguous results. Alternatives:\n${
            result.solutions.map(result => `Result :\n ${
              JSON.stringify(result, null, '\t')}\n-------\n`)}`)
      }

      const solution = result.solutions[0]

      expect(solution.type).toBe('block')

      try {
        expect(solution.args).toStrictEqual(ast)
      } catch (err) {
        console.error(JSON.stringify(results[0].solutions, null, '\t'))
        throw err
      }

    }
  })
}
