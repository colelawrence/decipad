import { runTests } from './run-tests';

runTests({
  'function definition with simple name': {
    source: 'functionname = arg1 arg2 => Ref1 ',
    ast: [
      {
        type: 'function-definition',
        args: [
          {
            type: 'funcdef',
            args: ['functionname'],
            start: {
              char: 0,
              line: 1,
              column: 1,
            },
            end: {
              char: 11,
              line: 1,
              column: 12,
            },
          },
          {
            type: 'argument-names',
            args: [
              {
                type: 'def',
                args: ['arg1'],
                start: {
                  char: 15,
                  line: 1,
                  column: 16,
                },
                end: {
                  char: 18,
                  line: 1,
                  column: 19,
                },
              },
              {
                type: 'def',
                args: ['arg2'],
                start: {
                  char: 20,
                  line: 1,
                  column: 21,
                },
                end: {
                  char: 23,
                  line: 1,
                  column: 24,
                },
              },
            ],
            start: {
              char: 15,
              line: 1,
              column: 16,
            },
            end: {
              char: 23,
              line: 1,
              column: 24,
            },
          },
          {
            type: 'block',
            args: [
              {
                type: 'ref',
                args: ['Ref1'],
                start: {
                  char: 28,
                  line: 1,
                  column: 29,
                },
                end: {
                  char: 31,
                  line: 1,
                  column: 32,
                },
              },
            ],
            start: {
              char: 28,
              line: 1,
              column: 29,
            },
            end: {
              char: 31,
              line: 1,
              column: 32,
            },
          },
        ],
        start: {
          char: 0,
          line: 1,
          column: 1,
        },
        end: {
          char: 31,
          line: 1,
          column: 32,
        },
      },
    ],
  },

  'function definition': {
    source: 'function name = arg1 arg2 => Ref1',
    ast: [
      {
        type: 'function-definition',
        args: [
          {
            type: 'funcdef',
            args: ['function name'],
            start: {
              char: 0,
              line: 1,
              column: 1,
            },
            end: {
              char: 12,
              line: 1,
              column: 13,
            },
          },
          {
            type: 'argument-names',
            args: [
              {
                type: 'def',
                args: ['arg1'],
                start: {
                  char: 16,
                  line: 1,
                  column: 17,
                },
                end: {
                  char: 19,
                  line: 1,
                  column: 20,
                },
              },
              {
                type: 'def',
                args: ['arg2'],
                start: {
                  char: 21,
                  line: 1,
                  column: 22,
                },
                end: {
                  char: 24,
                  line: 1,
                  column: 25,
                },
              },
            ],
            start: {
              char: 16,
              line: 1,
              column: 17,
            },
            end: {
              char: 24,
              line: 1,
              column: 25,
            },
          },
          {
            type: 'block',
            args: [
              {
                type: 'ref',
                args: ['Ref1'],
                start: {
                  char: 29,
                  line: 1,
                  column: 30,
                },
                end: {
                  char: 32,
                  line: 1,
                  column: 33,
                },
              },
            ],
            start: {
              char: 29,
              line: 1,
              column: 30,
            },
            end: {
              char: 32,
              line: 1,
              column: 33,
            },
          },
        ],
        start: {
          char: 0,
          line: 1,
          column: 1,
        },
        end: {
          char: 32,
          line: 1,
          column: 33,
        },
      },
    ],
  },

  'function call': {
    source: 'functionname 1 2',
    ast: [
      {
        type: 'function-call',
        args: [
          {
            type: 'funcref',
            args: ['functionname'],
            start: {
              char: 0,
              line: 1,
              column: 1,
            },
            end: {
              char: 11,
              line: 1,
              column: 12,
            },
          },
          {
            type: 'argument-list',
            args: [
              {
                type: 'literal',
                args: ['number', 1, null],
                start: {
                  char: 13,
                  line: 1,
                  column: 14,
                },
                end: {
                  char: 13,
                  line: 1,
                  column: 14,
                },
              },
              {
                type: 'literal',
                args: ['number', 2, null],
                start: {
                  char: 15,
                  line: 1,
                  column: 16,
                },
                end: {
                  char: 15,
                  line: 1,
                  column: 16,
                },
              },
            ],
            start: {
              char: 13,
              line: 1,
              column: 14,
            },
            end: {
              char: 15,
              line: 1,
              column: 16,
            },
          },
        ],
        start: {
          char: 0,
          line: 1,
          column: 1,
        },
        end: {
          char: 15,
          line: 1,
          column: 16,
        },
      },
    ],
  },

  'function declaration and use': {
    source: 'functionname = a b => a + b\n\nfunctionname 1 2',
    ast: [
      {
        type: 'function-definition',
        args: [
          {
            type: 'funcdef',
            args: ['functionname'],
            start: {
              char: 0,
              line: 1,
              column: 1,
            },
            end: {
              char: 11,
              line: 1,
              column: 12,
            },
          },
          {
            type: 'argument-names',
            args: [
              {
                type: 'def',
                args: ['a'],
                start: {
                  char: 15,
                  line: 1,
                  column: 16,
                },
                end: {
                  char: 15,
                  line: 1,
                  column: 16,
                },
              },
              {
                type: 'def',
                args: ['b'],
                start: {
                  char: 17,
                  line: 1,
                  column: 18,
                },
                end: {
                  char: 17,
                  line: 1,
                  column: 18,
                },
              },
            ],
            start: {
              char: 15,
              line: 1,
              column: 16,
            },
            end: {
              char: 17,
              line: 1,
              column: 18,
            },
          },
          {
            type: 'block',
            args: [
              {
                type: 'function-call',
                args: [
                  {
                    type: 'funcref',
                    args: ['+'],
                    start: {
                      char: 24,
                      line: 1,
                      column: 25,
                    },
                    end: {
                      char: 24,
                      line: 1,
                      column: 25,
                    },
                  },
                  {
                    type: 'argument-list',
                    args: [
                      {
                        type: 'ref',
                        args: ['a'],
                        start: {
                          char: 22,
                          line: 1,
                          column: 23,
                        },
                        end: {
                          char: 22,
                          line: 1,
                          column: 23,
                        },
                      },
                      {
                        type: 'ref',
                        args: ['b'],
                        start: {
                          char: 26,
                          line: 1,
                          column: 27,
                        },
                        end: {
                          char: 26,
                          line: 1,
                          column: 27,
                        },
                      },
                    ],
                    start: {
                      char: 22,
                      line: 1,
                      column: 23,
                    },
                    end: {
                      char: 26,
                      line: 1,
                      column: 27,
                    },
                  },
                ],
                start: {
                  char: 22,
                  line: 1,
                  column: 23,
                },
                end: {
                  char: 26,
                  line: 1,
                  column: 27,
                },
              },
            ],
            start: {
              char: 22,
              line: 1,
              column: 23,
            },
            end: {
              char: 26,
              line: 1,
              column: 27,
            },
          },
        ],
        start: {
          char: 0,
          line: 1,
          column: 1,
        },
        end: {
          char: 26,
          line: 1,
          column: 27,
        },
      },
      {
        type: 'function-call',
        args: [
          {
            type: 'funcref',
            args: ['functionname'],
            start: {
              char: 29,
              line: 3,
              column: 1,
            },
            end: {
              char: 40,
              line: 3,
              column: 12,
            },
          },
          {
            type: 'argument-list',
            args: [
              {
                type: 'literal',
                args: ['number', 1, null],
                start: {
                  char: 42,
                  line: 3,
                  column: 14,
                },
                end: {
                  char: 42,
                  line: 3,
                  column: 14,
                },
              },
              {
                type: 'literal',
                args: ['number', 2, null],
                start: {
                  char: 44,
                  line: 3,
                  column: 16,
                },
                end: {
                  char: 44,
                  line: 3,
                  column: 16,
                },
              },
            ],
            start: {
              char: 42,
              line: 3,
              column: 14,
            },
            end: {
              char: 44,
              line: 3,
              column: 16,
            },
          },
        ],
        start: {
          char: 29,
          line: 3,
          column: 1,
        },
        end: {
          char: 44,
          line: 3,
          column: 16,
        },
      },
    ],
  },
});
