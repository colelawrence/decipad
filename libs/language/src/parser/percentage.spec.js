import { runTests } from './run-tests';

runTests({
  'percentage value': {
    source: ' 190% ',
    ast: [
      {
        type: 'literal',
        args: ['number', 1.9, null],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 4,
          line: 1,
          column: 5,
        },
      },
    ],
  },
  'negative percentage value': {
    source: ' -190% ',
    ast: [
      {
        type: 'literal',
        args: ['number', -1.9, null],
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
  "Isn't ambiguous with the modulo operator": {
    source: ' someFunc 10% 1 ',
    sourceMap: false,
    ast: [
      {
        type: 'function-call',
        args: [
          {
            type: 'funcref',
            args: ['someFunc'],
          },
          {
            type: 'argument-list',
            args: [
              {
                type: 'literal',
                args: ['number', 0.1, null],
              },
              {
                type: 'literal',
                args: ['number', 1, null],
              },
            ],
          },
        ],
      },
    ],
  },
});
