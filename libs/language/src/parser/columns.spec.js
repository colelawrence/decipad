import { runTests } from './run-tests';

runTests({
  'empty column': {
    source: ' [ ] ',
    ast: [
      {
        type: 'column',
        args: [[]],
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

  'column with two expressions': {
    source: ' [ 1, 2 + 3 ] ',
    ast: [
      {
        type: 'column',
        args: [
          [
            {
              type: 'literal',
              args: ['number', 1, null],
              location: 3,
              length: 1,
            },
            {
              type: 'function-call',
              args: [
                {
                  type: 'funcref',
                  args: ['+'],
                  location: 8,
                  length: 1,
                },
                {
                  type: 'argument-list',
                  args: [
                    {
                      type: 'literal',
                      args: ['number', 2, null],
                      location: 6,
                      length: 1,
                    },
                    {
                      type: 'literal',
                      args: ['number', 3, null],
                      location: 10,
                      length: 1,
                    },
                  ],
                  location: 6,
                  length: 5,
                },
              ],
              location: 6,
              length: 5,
            },
          ],
        ],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 10,
          line: 1,
          column: 11,
        },
      },
    ],
  },

  'column with 4 components': {
    source: ' [  1  , 2, 3  ,   4   ]',
    ast: [
      {
        type: 'column',
        args: [
          [
            {
              type: 'literal',
              args: ['number', 1, null],
              location: 4,
              length: 1,
            },
            {
              type: 'literal',
              args: ['number', 2, null],
              location: 9,
              length: 1,
            },
            {
              type: 'literal',
              args: ['number', 3, null],
              location: 12,
              length: 1,
            },
            {
              type: 'literal',
              args: ['number', 4, null],
              location: 19,
              length: 1,
            },
          ],
        ],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 19,
          line: 1,
          column: 20,
        },
      },
    ],
  },
});
