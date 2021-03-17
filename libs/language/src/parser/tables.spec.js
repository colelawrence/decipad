import { runTests } from './run-tests';

runTests({
  'empty table': {
    source: ' { } ',
    ast: [
      {
        type: 'table',
        args: [],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 3,
          line: 1,
          column: 4,
        },
      },
    ],
  },

  'table with one implicit coldef': {
    source: ' { abc } ',
    ast: [
      {
        type: 'table',
        args: [
          {
            type: 'coldef',
            args: ['abc'],
            start: {
              char: 3,
              line: 1,
              column: 4,
            },
            end: {
              char: 5,
              line: 1,
              column: 6,
            },
          },
          {
            type: 'ref',
            args: ['abc'],
            start: {
              char: 3,
              line: 1,
              column: 4,
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
          char: 7,
          line: 1,
          column: 8,
        },
      },
    ],
  },

  'table with three implicit coldefs': {
    source: ' { abc  ,  def,   ghi} ',
    ast: [
      {
        type: 'table',
        args: [
          {
            type: 'coldef',
            args: ['abc'],
            start: {
              char: 3,
              line: 1,
              column: 4,
            },
            end: {
              char: 5,
              line: 1,
              column: 6,
            },
          },
          {
            type: 'ref',
            args: ['abc'],
            start: {
              char: 3,
              line: 1,
              column: 4,
            },
            end: {
              char: 5,
              line: 1,
              column: 6,
            },
          },
          {
            type: 'coldef',
            args: ['def'],
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
            args: ['def'],
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
            args: ['ghi'],
            start: {
              char: 18,
              line: 1,
              column: 19,
            },
            end: {
              char: 20,
              line: 1,
              column: 21,
            },
          },
          {
            type: 'ref',
            args: ['ghi'],
            start: {
              char: 18,
              line: 1,
              column: 19,
            },
            end: {
              char: 20,
              line: 1,
              column: 21,
            },
          },
        ],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 21,
          line: 1,
          column: 22,
        },
      },
    ],
  },

  'table with three implicit coldefs newline separated': {
    source: ' { abc \n  def    \n   ghi \n } ',
    ast: [
      {
        type: 'table',
        args: [
          {
            type: 'coldef',
            args: ['abc'],
            start: {
              char: 3,
              line: 1,
              column: 4,
            },
            end: {
              char: 5,
              line: 1,
              column: 6,
            },
          },
          {
            type: 'ref',
            args: ['abc'],
            start: {
              char: 3,
              line: 1,
              column: 4,
            },
            end: {
              char: 5,
              line: 1,
              column: 6,
            },
          },
          {
            type: 'coldef',
            args: ['def'],
            start: {
              char: 10,
              line: 2,
              column: 3,
            },
            end: {
              char: 12,
              line: 2,
              column: 5,
            },
          },
          {
            type: 'ref',
            args: ['def'],
            start: {
              char: 10,
              line: 2,
              column: 3,
            },
            end: {
              char: 12,
              line: 2,
              column: 5,
            },
          },
          {
            type: 'coldef',
            args: ['ghi'],
            start: {
              char: 21,
              line: 3,
              column: 4,
            },
            end: {
              char: 23,
              line: 3,
              column: 6,
            },
          },
          {
            type: 'ref',
            args: ['ghi'],
            start: {
              char: 21,
              line: 3,
              column: 4,
            },
            end: {
              char: 23,
              line: 3,
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
          char: 27,
          line: 4,
          column: 2,
        },
      },
    ],
  },

  'table with explicit value as column': {
    source: '  { abc = [ 1 , 2 ]  }',
    ast: [
      {
        type: 'table',
        args: [
          {
            type: 'coldef',
            args: ['abc'],
            start: {
              char: 4,
              line: 1,
              column: 5,
            },
            end: {
              char: 6,
              line: 1,
              column: 7,
            },
          },
          {
            type: 'column',
            args: [
              [
                {
                  type: 'literal',
                  args: ['number', 1, null],
                  location: 12,
                  length: 1,
                },
                {
                  type: 'literal',
                  args: ['number', 2, null],
                  location: 16,
                  length: 1,
                },
              ],
            ],
            start: {
              char: 10,
              line: 1,
              column: 11,
            },
            end: {
              char: 16,
              line: 1,
              column: 17,
            },
          },
        ],
        start: {
          char: 2,
          line: 1,
          column: 3,
        },
        end: {
          char: 19,
          line: 1,
          column: 20,
        },
      },
    ],
  },

  'table with mixed defs in each line': {
    source: '  { \n abc \n def = [ 1 , 2 ] \n  }',
    ast: [
      {
        type: 'table',
        args: [
          {
            type: 'coldef',
            args: ['abc'],
            start: {
              char: 6,
              line: 2,
              column: 2,
            },
            end: {
              char: 8,
              line: 2,
              column: 4,
            },
          },
          {
            type: 'ref',
            args: ['abc'],
            start: {
              char: 6,
              line: 2,
              column: 2,
            },
            end: {
              char: 8,
              line: 2,
              column: 4,
            },
          },
          {
            type: 'coldef',
            args: ['def'],
            start: {
              char: 12,
              line: 3,
              column: 2,
            },
            end: {
              char: 14,
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
                  location: 20,
                  length: 1,
                },
                {
                  type: 'literal',
                  args: ['number', 2, null],
                  location: 24,
                  length: 1,
                },
              ],
            ],
            start: {
              char: 18,
              line: 3,
              column: 8,
            },
            end: {
              char: 24,
              line: 3,
              column: 14,
            },
          },
        ],
        start: {
          char: 2,
          line: 1,
          column: 3,
        },
        end: {
          char: 29,
          line: 4,
          column: 1,
        },
      },
    ],
  },
});
