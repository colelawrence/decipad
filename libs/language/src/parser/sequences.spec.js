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
            start: 5,
            end: 5,
          },
          {
            type: 'literal',
            args: ['number', 10, null],
            start: 8,
            end: 9,
          },
          {
            type: 'literal',
            args: ['number', 1, null],
            start: 14,
            end: 14,
          },
        ],
        start: 2,
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
            start: 5,
            end: 5,
          },
          {
            type: 'literal',
            args: ['number', 10, null],
            start: 16,
            end: 17,
          },
          {
            type: 'literal',
            args: ['number', 0.5, null],
            start: 23,
            end: 25,
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
    sourceMap: false,
    source: '   [date(2020-10)..date(2020-03) by month]',
    ast: [
      {
        type: 'sequence',
        args: [
          {
            type: 'date',
            args: ['year', 2020, 'month', 10],
          },
          {
            type: 'date',
            args: ['year', 2020, 'month', 3],
          },
          {
            type: 'ref',
            args: ['month'],
          },
        ],
      },
    ],
  },
});
