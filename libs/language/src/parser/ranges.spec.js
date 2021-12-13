import { F } from '../utils';
import { runTests } from './run-tests';

runTests({
  'basic numeric range using ..': {
    source: '  [  1..10  ]',
    ast: [
      {
        type: 'range',
        args: [
          {
            type: 'literal',
            args: ['number', F(1), null],
            start: 5,
            end: 5,
          },
          {
            type: 'literal',
            args: ['number', F(10), null],
            start: 8,
            end: 9,
          },
        ],
        start: {
          char: 2,
          line: 1,
          column: 3,
        },
        end: {
          char: 12,
          line: 1,
          column: 13,
        },
      },
    ],
  },

  'basic numeric range using "through"': {
    source: '  [  1  through 10   ]',
    ast: [
      {
        type: 'range',
        args: [
          {
            type: 'literal',
            args: ['number', F(1), null],
            start: 5,
            end: 5,
          },
          {
            type: 'literal',
            args: ['number', F(10), null],
            start: 16,
            end: 17,
          },
        ],
        start: {
          char: 2,
          line: 1,
          column: 3,
        },
        end: {
          char: 21,
          line: 1,
          column: 22,
        },
      },
    ],
  },

  'basic time range': {
    source: '   [date(2020-10)..date(2020-03)]',
    ast: [
      {
        type: 'range',
        args: [
          {
            type: 'date',
            args: ['year', 2020n, 'month', 10n],
            start: 4,
            end: 16,
          },
          {
            type: 'date',
            args: ['year', 2020n, 'month', 3n],
            start: 19,
            end: 31,
          },
        ],
        start: {
          char: 3,
          line: 1,
          column: 4,
        },
        end: {
          char: 32,
          line: 1,
          column: 33,
        },
      },
    ],
  },
});
