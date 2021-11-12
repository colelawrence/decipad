import { l, c, r } from '../utils';
import { runTests } from './run-tests';

runTests({
  'ref as expression': {
    source: 'refname',
    ast: [
      {
        type: 'ref',
        args: ['refname'],
        start: {
          char: 0,
          line: 1,
          column: 1,
        },
        end: {
          char: 6,
          line: 1,
          column: 7,
        },
      },
    ],
  },

  'unary operation': {
    source: '-something',
    ast: [
      {
        type: 'function-call',
        args: [
          {
            type: 'funcref',
            args: ['unary-'],
            start: {
              char: 0,
              line: 1,
              column: 1,
            },
            end: {
              char: 0,
              line: 1,
              column: 1,
            },
          },
          {
            type: 'argument-list',
            args: [
              {
                type: 'ref',
                args: ['something'],
                start: {
                  char: 1,
                  line: 1,
                  column: 2,
                },
                end: {
                  char: 9,
                  line: 1,
                  column: 10,
                },
              },
            ],
            start: {
              char: 1,
              line: 1,
              column: 2,
            },
            end: {
              char: 9,
              line: 1,
              column: 10,
            },
          },
        ],
        start: {
          char: 0,
          line: 1,
          column: 1,
        },
        end: {
          char: 9,
          line: 1,
          column: 10,
        },
      },
    ],
  },

  'binary op between 2 literals': {
    source: ' 2 + 3 ',
    ast: [
      {
        type: 'function-call',
        args: [
          {
            type: 'funcref',
            args: ['+'],
            start: {
              char: 3,
              line: 1,
              column: 4,
            },
            end: {
              char: 3,
              line: 1,
              column: 4,
            },
          },
          {
            type: 'argument-list',
            args: [
              {
                type: 'literal',
                args: ['number', 2, null, { d: 1, n: 2, s: 1 }],
                start: {
                  char: 1,
                  line: 1,
                  column: 2,
                },
                end: {
                  char: 1,
                  line: 1,
                  column: 2,
                },
              },
              {
                type: 'literal',
                args: ['number', 3, null, { d: 1, n: 3, s: 1 }],
                start: {
                  char: 5,
                  line: 1,
                  column: 6,
                },
                end: {
                  char: 5,
                  line: 1,
                  column: 6,
                },
              },
            ],
            start: {
              char: 1,
              line: 1,
              column: 2,
            },
            end: {
              char: 5,
              line: 1,
              column: 6,
            },
          },
        ],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 5,
          line: 1,
          column: 6,
        },
      },
    ],
  },

  'binary operation': {
    source: 'Something / SomethingElse',
    ast: [
      {
        type: 'function-call',
        args: [
          {
            type: 'funcref',
            args: ['/'],
            start: 9,
            end: 11,
          },
          {
            type: 'argument-list',
            args: [
              {
                type: 'ref',
                args: ['Something'],
                start: 0,
                end: 8,
              },
              {
                type: 'ref',
                args: ['SomethingElse'],
                start: 12,
                end: 24,
              },
            ],
            start: 0,
            end: 24,
          },
        ],
        start: 0,
        end: 24,
      },
    ],
  },

  'operator precedence': {
    source: '2 + 3 * 4',
    ast: [
      {
        type: 'function-call',
        args: [
          {
            type: 'funcref',
            args: ['+'],
            start: {
              char: 2,
              line: 1,
              column: 3,
            },
            end: {
              char: 2,
              line: 1,
              column: 3,
            },
          },
          {
            type: 'argument-list',
            args: [
              {
                type: 'literal',
                args: ['number', 2, null, { d: 1, n: 2, s: 1 }],
                start: {
                  char: 0,
                  line: 1,
                  column: 1,
                },
                end: {
                  char: 0,
                  line: 1,
                  column: 1,
                },
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
                      column: 6,
                    },
                    end: {
                      char: 7,
                      line: 1,
                      column: 8,
                    },
                  },
                  {
                    type: 'argument-list',
                    args: [
                      {
                        type: 'literal',
                        args: ['number', 3, null, { d: 1, n: 3, s: 1 }],
                        start: {
                          char: 4,
                          line: 1,
                          column: 5,
                        },
                        end: {
                          char: 4,
                          line: 1,
                          column: 5,
                        },
                      },
                      {
                        type: 'literal',
                        args: ['number', 4, null, { d: 1, n: 4, s: 1 }],
                        start: {
                          char: 8,
                          line: 1,
                          column: 9,
                        },
                        end: {
                          char: 8,
                          line: 1,
                          column: 9,
                        },
                      },
                    ],
                    start: {
                      char: 4,
                      line: 1,
                      column: 5,
                    },
                    end: {
                      char: 8,
                      line: 1,
                      column: 9,
                    },
                  },
                ],
                start: {
                  char: 4,
                  line: 1,
                  column: 5,
                },
                end: {
                  char: 8,
                  line: 1,
                  column: 9,
                },
              },
            ],
            start: {
              char: 0,
              line: 1,
              column: 1,
            },
            end: {
              char: 8,
              line: 1,
              column: 9,
            },
          },
        ],
        start: {
          char: 0,
          line: 1,
          column: 1,
        },
        end: {
          char: 8,
          line: 1,
          column: 9,
        },
      },
    ],
  },

  'one expression spans multiple lines': {
    source: 'RefName1\n=\n1\n+\n2\n2\n+\n3',
    ast: [
      {
        type: 'assign',
        args: [
          {
            type: 'def',
            args: ['RefName1'],
            start: {
              char: 0,
              line: 1,
              column: 1,
            },
            end: {
              char: 7,
              line: 1,
              column: 8,
            },
          },
          {
            type: 'function-call',
            args: [
              {
                type: 'funcref',
                args: ['+'],
                start: {
                  char: 13,
                  line: 4,
                  column: 1,
                },
                end: {
                  char: 13,
                  line: 4,
                  column: 1,
                },
              },
              {
                type: 'argument-list',
                args: [
                  {
                    type: 'literal',
                    args: ['number', 1, null, { d: 1, n: 1, s: 1 }],
                    start: {
                      char: 11,
                      line: 3,
                      column: 1,
                    },
                    end: {
                      char: 11,
                      line: 3,
                      column: 1,
                    },
                  },
                  {
                    type: 'literal',
                    args: ['number', 2, null, { d: 1, n: 2, s: 1 }],
                    start: {
                      char: 15,
                      line: 5,
                      column: 1,
                    },
                    end: {
                      char: 15,
                      line: 5,
                      column: 1,
                    },
                  },
                ],
                start: {
                  char: 11,
                  line: 3,
                  column: 1,
                },
                end: {
                  char: 15,
                  line: 5,
                  column: 1,
                },
              },
            ],
            start: {
              char: 11,
              line: 3,
              column: 1,
            },
            end: {
              char: 15,
              line: 5,
              column: 1,
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
          line: 5,
          column: 1,
        },
      },
      {
        type: 'function-call',
        args: [
          {
            type: 'funcref',
            args: ['+'],
            start: {
              char: 19,
              line: 7,
              column: 1,
            },
            end: {
              char: 19,
              line: 7,
              column: 1,
            },
          },
          {
            type: 'argument-list',
            args: [
              {
                type: 'literal',
                args: ['number', 2, null, { d: 1, n: 2, s: 1 }],
                start: {
                  char: 17,
                  line: 6,
                  column: 1,
                },
                end: {
                  char: 17,
                  line: 6,
                  column: 1,
                },
              },
              {
                type: 'literal',
                args: ['number', 3, null, { d: 1, n: 3, s: 1 }],
                start: {
                  char: 21,
                  line: 8,
                  column: 1,
                },
                end: {
                  char: 21,
                  line: 8,
                  column: 1,
                },
              },
            ],
            start: {
              char: 17,
              line: 6,
              column: 1,
            },
            end: {
              char: 21,
              line: 8,
              column: 1,
            },
          },
        ],
        start: {
          char: 17,
          line: 6,
          column: 1,
        },
        end: {
          char: 21,
          line: 8,
          column: 1,
        },
      },
    ],
  },

  'comparison and boolean operators': {
    source: 'a > b && c < d',
    ast: [
      {
        type: 'function-call',
        args: [
          {
            type: 'funcref',
            args: ['&&'],
            start: {
              char: 6,
              line: 1,
              column: 7,
            },
            end: {
              char: 7,
              line: 1,
              column: 8,
            },
          },
          {
            type: 'argument-list',
            args: [
              {
                type: 'function-call',
                args: [
                  {
                    type: 'funcref',
                    args: ['>'],
                    start: {
                      char: 2,
                      line: 1,
                      column: 3,
                    },
                    end: {
                      char: 2,
                      line: 1,
                      column: 3,
                    },
                  },
                  {
                    type: 'argument-list',
                    args: [
                      {
                        type: 'ref',
                        args: ['a'],
                        start: {
                          char: 0,
                          line: 1,
                          column: 1,
                        },
                        end: {
                          char: 0,
                          line: 1,
                          column: 1,
                        },
                      },
                      {
                        type: 'ref',
                        args: ['b'],
                        start: {
                          char: 4,
                          line: 1,
                          column: 5,
                        },
                        end: {
                          char: 4,
                          line: 1,
                          column: 5,
                        },
                      },
                    ],
                    start: {
                      char: 0,
                      line: 1,
                      column: 1,
                    },
                    end: {
                      char: 4,
                      line: 1,
                      column: 5,
                    },
                  },
                ],
                start: {
                  char: 0,
                  line: 1,
                  column: 1,
                },
                end: {
                  char: 4,
                  line: 1,
                  column: 5,
                },
              },
              {
                type: 'function-call',
                args: [
                  {
                    type: 'funcref',
                    args: ['<'],
                    start: {
                      char: 11,
                      line: 1,
                      column: 12,
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
                        type: 'ref',
                        args: ['c'],
                        start: {
                          char: 9,
                          line: 1,
                          column: 10,
                        },
                        end: {
                          char: 9,
                          line: 1,
                          column: 10,
                        },
                      },
                      {
                        type: 'ref',
                        args: ['d'],
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
                    ],
                    start: {
                      char: 9,
                      line: 1,
                      column: 10,
                    },
                    end: {
                      char: 13,
                      line: 1,
                      column: 14,
                    },
                  },
                ],
                start: {
                  char: 9,
                  line: 1,
                  column: 10,
                },
                end: {
                  char: 13,
                  line: 1,
                  column: 14,
                },
              },
            ],
            start: {
              char: 0,
              line: 1,
              column: 1,
            },
            end: {
              char: 13,
              line: 1,
              column: 14,
            },
          },
        ],
        start: {
          char: 0,
          line: 1,
          column: 1,
        },
        end: {
          char: 13,
          line: 1,
          column: 14,
        },
      },
    ],
    start: {
      char: 0,
      line: 1,
      column: 1,
    },
    end: {
      char: 13,
      line: 1,
      column: 14,
    },
  },

  'comparison and boolean operators (2)': {
    sourceMap: false,
    source: 'true || false',
    ast: [c('||', l(true), l(false))],
  },

  'comparison and boolean operators (3)': {
    sourceMap: false,
    source: '!A',
    ast: [c('not', r('A'))],
  },

  'comparison and boolean operators (4)': {
    sourceMap: false,
    source: 'A != B',
    ast: [c('!=', r('A'), r('B'))],
  },

  'No ambiguity between negation and subtraction': {
    sourceMap: false,
    source: '100 - -a',
    ast: [c('-', l(100), c('unary-', r('a')))],
  },

  'No ambiguity between negation and subtraction (2)': {
    sourceMap: false,
    source: '100- -a',
    ast: [c('-', l(100), c('unary-', r('a')))],
  },

  'No ambiguity between negation and subtraction (3)': {
    sourceMap: false,
    source: '100- - a',
    ast: [c('-', l(100), c('unary-', r('a')))],
  },

  'No ambiguity between negation and subtraction (4)': {
    sourceMap: false,
    source: '100- -1',
    ast: [c('-', l(100), l(-1))],
  },

  'No ambiguity between negation and subtraction (5)': {
    sourceMap: false,
    source: '100- - 1',
    ast: [c('-', l(100), l(-1))],
  },

  'No ambiguity between negation and subtraction (6)': {
    sourceMap: false,
    source: '100 - -1',
    ast: [c('-', l(100), l(-1))],
  },
});
