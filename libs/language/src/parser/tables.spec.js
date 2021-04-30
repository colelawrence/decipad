import { runTests } from './run-tests';

runTests({
  'empty table': {
    source: ' Table = { } ',
    ast: [
      {
        type: 'assign',
        args: [
          {
            type: 'def',
            args: ['Table'],
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
          {
            type: 'table',
            args: [],
            start: {
              char: 9,
              line: 1,
              column: 10,
            },
            end: {
              char: 11,
              line: 1,
              column: 12,
            },
          },
        ],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 11,
          line: 1,
          column: 12,
        },
      },
    ],
  },

  'table with one implicit coldef': {
    source: ' Table = { abc } ',
    ast: [
      {
        type: 'assign',
        args: [
          {
            type: 'def',
            args: ['Table'],
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
          {
            type: 'table',
            args: [
              {
                type: 'coldef',
                args: ['abc'],
                start: {
                  char: 11,
                  line: 1,
                  column: 12,
                },
                end: {
                  char: 13,
                  line: 1,
                  column: 14,
                },
              },
              {
                type: 'ref',
                args: ['abc'],
                start: {
                  char: 11,
                  line: 1,
                  column: 12,
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
              char: 15,
              line: 1,
              column: 16,
            },
          },
        ],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 15,
          line: 1,
          column: 16,
        },
      },
    ],
  },

  'table with three implicit coldefs': {
    source: ' Table = { abc  ,  def,   ghi} ',
    ast: [
      {
        type: 'assign',
        args: [
          {
            type: 'def',
            args: ['Table'],
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
          {
            type: 'table',
            args: [
              {
                type: 'coldef',
                args: ['abc'],
                start: {
                  char: 11,
                  line: 1,
                  column: 12,
                },
                end: {
                  char: 13,
                  line: 1,
                  column: 14,
                },
              },
              {
                type: 'ref',
                args: ['abc'],
                start: {
                  char: 11,
                  line: 1,
                  column: 12,
                },
                end: {
                  char: 13,
                  line: 1,
                  column: 14,
                },
              },
              {
                type: 'coldef',
                args: ['def'],
                start: {
                  char: 19,
                  line: 1,
                  column: 20,
                },
                end: {
                  char: 21,
                  line: 1,
                  column: 22,
                },
              },
              {
                type: 'ref',
                args: ['def'],
                start: {
                  char: 19,
                  line: 1,
                  column: 20,
                },
                end: {
                  char: 21,
                  line: 1,
                  column: 22,
                },
              },
              {
                type: 'coldef',
                args: ['ghi'],
                start: {
                  char: 26,
                  line: 1,
                  column: 27,
                },
                end: {
                  char: 28,
                  line: 1,
                  column: 29,
                },
              },
              {
                type: 'ref',
                args: ['ghi'],
                start: {
                  char: 26,
                  line: 1,
                  column: 27,
                },
                end: {
                  char: 28,
                  line: 1,
                  column: 29,
                },
              },
            ],
            start: {
              char: 9,
              line: 1,
              column: 10,
            },
            end: {
              char: 29,
              line: 1,
              column: 30,
            },
          },
        ],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 29,
          line: 1,
          column: 30,
        },
      },
    ],
  },

  'table with three implicit coldefs newline separated': {
    source: ' Table = { abc \n  def    \n   ghi \n } ',
    ast: [
      {
        type: 'assign',
        args: [
          {
            type: 'def',
            args: ['Table'],
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
          {
            type: 'table',
            args: [
              {
                type: 'coldef',
                args: ['abc'],
                start: {
                  char: 11,
                  line: 1,
                  column: 12,
                },
                end: {
                  char: 13,
                  line: 1,
                  column: 14,
                },
              },
              {
                type: 'ref',
                args: ['abc'],
                start: {
                  char: 11,
                  line: 1,
                  column: 12,
                },
                end: {
                  char: 13,
                  line: 1,
                  column: 14,
                },
              },
              {
                type: 'coldef',
                args: ['def'],
                start: {
                  char: 18,
                  line: 2,
                  column: 3,
                },
                end: {
                  char: 20,
                  line: 2,
                  column: 5,
                },
              },
              {
                type: 'ref',
                args: ['def'],
                start: {
                  char: 18,
                  line: 2,
                  column: 3,
                },
                end: {
                  char: 20,
                  line: 2,
                  column: 5,
                },
              },
              {
                type: 'coldef',
                args: ['ghi'],
                start: {
                  char: 29,
                  line: 3,
                  column: 4,
                },
                end: {
                  char: 31,
                  line: 3,
                  column: 6,
                },
              },
              {
                type: 'ref',
                args: ['ghi'],
                start: {
                  char: 29,
                  line: 3,
                  column: 4,
                },
                end: {
                  char: 31,
                  line: 3,
                  column: 6,
                },
              },
            ],
            start: {
              char: 9,
              line: 1,
              column: 10,
            },
            end: {
              char: 35,
              line: 4,
              column: 2,
            },
          },
        ],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 35,
          line: 4,
          column: 2,
        },
      },
    ],
  },

  'table with explicit value as column': {
    source: ' Table = { abc = [ 1 , 2 ]  }',
    ast: [
      {
        type: 'assign',
        args: [
          {
            type: 'def',
            args: ['Table'],
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
          {
            type: 'table',
            args: [
              {
                type: 'coldef',
                args: ['abc'],
                start: {
                  char: 11,
                  line: 1,
                  column: 12,
                },
                end: {
                  char: 13,
                  line: 1,
                  column: 14,
                },
              },
              {
                type: 'column',
                args: [
                  [
                    {
                      type: 'literal',
                      args: ['number', 1, null],
                      location: 19,
                      length: 1,
                    },
                    {
                      type: 'literal',
                      args: ['number', 2, null],
                      location: 23,
                      length: 1,
                    },
                  ],
                ],
                start: {
                  char: 17,
                  line: 1,
                  column: 18,
                },
                end: {
                  char: 23,
                  line: 1,
                  column: 24,
                },
              },
            ],
            start: {
              char: 9,
              line: 1,
              column: 10,
            },
            end: {
              char: 26,
              line: 1,
              column: 27,
            },
          },
        ],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 26,
          line: 1,
          column: 27,
        },
      },
    ],
  },

  'table with mixed defs in each line': {
    source: ' Table = { \n abc \n def = [ 1 , 2 ] \n  }',
    ast: [
      {
        type: 'assign',
        args: [
          {
            type: 'def',
            args: ['Table'],
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
          {
            type: 'table',
            args: [
              {
                type: 'coldef',
                args: ['abc'],
                start: {
                  char: 13,
                  line: 2,
                  column: 2,
                },
                end: {
                  char: 15,
                  line: 2,
                  column: 4,
                },
              },
              {
                type: 'ref',
                args: ['abc'],
                start: {
                  char: 13,
                  line: 2,
                  column: 2,
                },
                end: {
                  char: 15,
                  line: 2,
                  column: 4,
                },
              },
              {
                type: 'coldef',
                args: ['def'],
                start: {
                  char: 19,
                  line: 3,
                  column: 2,
                },
                end: {
                  char: 21,
                  line: 3,
                  column: 4,
                },
              },
              {
                type: 'column',
                args: [
                  [
                    {
                      type: 'literal',
                      args: ['number', 1, null],
                      location: 27,
                      length: 1,
                    },
                    {
                      type: 'literal',
                      args: ['number', 2, null],
                      location: 31,
                      length: 1,
                    },
                  ],
                ],
                start: {
                  char: 25,
                  line: 3,
                  column: 8,
                },
                end: {
                  char: 31,
                  line: 3,
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
              char: 36,
              line: 4,
              column: 1,
            },
          },
        ],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 36,
          line: 4,
          column: 1,
        },
      },
    ],
  },
});
