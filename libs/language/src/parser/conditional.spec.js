import { runTests } from './run-tests';

runTests({
  conditional: {
    source: 'if Condition then IfTrue else `If False`',
    ast: [
      {
        type: 'function-call',
        args: [
          {
            type: 'funcref',
            args: ['if'],
            start: {
              char: 0,
              line: 1,
              column: 1,
            },
            end: {
              char: 1,
              line: 1,
              column: 2,
            },
          },
          {
            type: 'argument-list',
            args: [
              {
                type: 'ref',
                args: ['Condition'],
                start: {
                  char: 3,
                  line: 1,
                  column: 4,
                },
                end: {
                  char: 11,
                  line: 1,
                  column: 12,
                },
              },
              {
                type: 'ref',
                args: ['IfTrue'],
                start: {
                  char: 18,
                  line: 1,
                  column: 19,
                },
                end: {
                  char: 23,
                  line: 1,
                  column: 24,
                },
              },
              {
                type: 'ref',
                args: ['If False'],
                start: {
                  char: 30,
                  line: 1,
                  column: 31,
                },
                end: {
                  char: 39,
                  line: 1,
                  column: 40,
                },
              },
            ],
            start: {
              char: 3,
              line: 1,
              column: 4,
            },
            end: {
              char: 39,
              line: 1,
              column: 40,
            },
          },
        ],
        start: {
          char: 0,
          line: 1,
          column: 1,
        },
        end: {
          char: 39,
          line: 1,
          column: 40,
        },
      },
    ],
  },
});
