import { runTests } from './run-tests';

runTests({
  'given a variable': {
    source: 'given Variable : 1',
    ast: [
      {
        type: 'given',
        args: [
          {
            type: 'ref',
            args: ['Variable'],
            start: {
              char: 6,
              line: 1,
              column: 7,
            },
            end: {
              char: 13,
              line: 1,
              column: 14,
            },
          },
          {
            type: 'literal',
            args: ['number', 1, null, { d: 1, n: 1, s: 1 }],
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
          char: 0,
          line: 1,
          column: 1,
        },
        end: {
          char: 17,
          line: 1,
          column: 18,
        },
      },
    ],
  },
});
