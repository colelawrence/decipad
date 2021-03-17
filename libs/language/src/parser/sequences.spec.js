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
          char: 6,
          line: 1,
          column: 7,
        },
      },
    ],
  },

  'basic numeric range using "through"': {
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
          char: 6,
          line: 1,
          column: 7,
        },
      },
    ],
  },

  'basic time range': {
    source: '   [2020-10..2020-03 by month]',
    ast: [
      {
        type: 'sequence',
        args: [
          {
            type: 'date',
            args: ['year', 2020, 'month', 10],
            location: 4,
            length: 7,
          },
          {
            type: 'date',
            args: ['year', 2020, 'month', 3],
            location: 13,
            length: 7,
          },
          {
            type: 'ref',
            args: ['month'],
            location: 24,
            length: 5,
          },
        ],
        start: {
          char: 3,
          line: 1,
          column: 4,
        },
        end: {
          char: 4,
          line: 1,
          column: 5,
        },
      },
    ],
  },
});
