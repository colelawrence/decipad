import { runTests } from './run-tests';

runTests({
  'basic numeric sequence using ..': {
    source: '  [  1..10 by 1 ]',
    ast: [
      {
        type: 'sequence',
        args: [
          {
            type: 'literal',
            args: ['number', 1, null],
            location: 5,
            length: 1,
          },
          {
            type: 'literal',
            args: ['number', 10, null],
            location: 8,
            length: 2,
          },
          {
            type: 'literal',
            args: ['number', 1, null],
            location: 14,
            length: 1,
          },
        ],
        start: {
          char: 2,
          line: 1,
          column: 3,
        },
        end: {
          char: 16,
          line: 1,
          column: 17,
        },
      },
    ],
  },

  'basic numeric sequence using "through"': {
    source: '  [  1  through 10  by 0.5 ]',
    ast: [
      {
        type: 'sequence',
        args: [
          {
            type: 'literal',
            args: ['number', 1, null],
            location: 5,
            length: 1,
          },
          {
            type: 'literal',
            args: ['number', 10, null],
            location: 16,
            length: 2,
          },
          {
            type: 'literal',
            args: ['number', 0.5, null],
            location: 23,
            length: 3,
          },
        ],
        start: {
          char: 2,
          line: 1,
          column: 3,
        },
        end: {
          char: 27,
          line: 1,
          column: 28,
        },
      },
    ],
  },

  'basic time sequence': {
    source: '   [date(2020-10)..date(2020-03) by month]',
    ast: [
      {
        type: 'sequence',
        args: [
          {
            type: 'date',
            args: ['year', 2020, 'month', 10],
            location: 4,
            length: 13,
          },
          {
            type: 'date',
            args: ['year', 2020, 'month', 3],
            location: 19,
            length: 13,
          },
          {
            type: 'ref',
            args: ['month'],
            location: 36,
            length: 5,
          },
        ],
        start: {
          char: 3,
          line: 1,
          column: 4,
        },
        end: {
          char: 41,
          line: 1,
          column: 42,
        },
      },
    ],
  },
});
