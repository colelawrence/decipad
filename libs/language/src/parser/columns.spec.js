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
              start: 3,
              end: 3
            },
            {
              type: 'function-call',
              args: [
                {
                  type: 'funcref',
                  args: ['+'],
                  start: 8,
                  end: 8
                },
                {
                  type: 'argument-list',
                  args: [
                    {
                      type: 'literal',
                      args: ['number', 2, null],
                      start: 6,
                      end: 6
                    },
                    {
                      type: 'literal',
                      args: ['number', 3, null],
                      start: 10,
                      end: 10
                    },
                  ],
                  start: 6,
                  end: 10,
                },
              ],
              start: 6,
              end: 10,
            },
          ],
        ],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 12,
          line: 1,
          column: 13,
        },
      },
    ],
  },

  'column with 4 components': {
    source: ' [  1  , 2,\n3  ,   4   ]',
    ast: [
      {
        type: 'column',
        args: [
          [
            {
              type: 'literal',
              args: ['number', 1, null],
              start: 4,
              end: 4,
            },
            {
              type: 'literal',
              args: ['number', 2, null],
              start: 9,
              end: 9,
            },
            {
              type: 'literal',
              args: ['number', 3, null],
              start: 12,
              end: 12
            },
            {
              type: 'literal',
              args: ['number', 4, null],
              start: 19,
              end: 19
            },
          ],
        ],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 23,
          line: 2,
          column: 12,
        },
      },
    ],
  },
});
