import { F } from '../utils';
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
            args: ['number', F(1)],
            start: 5,
            end: 5,
          },
          {
            type: 'literal',
            args: ['number', F(10)],
            start: 8,
            end: 9,
          },
          {
            type: 'literal',
            args: ['number', F(1)],
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
            args: ['number', F(1)],
            start: 5,
            end: 5,
          },
          {
            type: 'literal',
            args: ['number', F(10)],
            start: 16,
            end: 17,
          },
          {
            type: 'literal',
            args: ['number', F(1, 2)],
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
    source: '   [ date(2020-10) .. date(2020-03) by month]',
    ast: [
      {
        type: 'sequence',
        args: [
          {
            type: 'date',
            args: ['year', 2020n, 'month', 10n],
          },
          {
            type: 'date',
            args: ['year', 2020n, 'month', 3n],
          },
          {
            type: 'ref',
            args: ['month'],
          },
        ],
      },
    ],
  },

  'basic numeric sequence using .. (shorthand)': {
    source: '  [  1..10  ]',
    ast: [
      {
        type: 'sequence',
        args: [
          {
            type: 'literal',
            args: ['number', F(1)],
            start: 5,
            end: 5,
          },
          {
            type: 'literal',
            args: ['number', F(10)],
            start: 8,
            end: 9,
          },
        ],
        start: 2,
        end: 12,
      },
    ],
  },

  'basic numeric sequence using "through" (shorthand)': {
    source: '  [  1  through 10   ]',
    ast: [
      {
        type: 'sequence',
        args: [
          {
            type: 'literal',
            args: ['number', F(1)],
            start: 5,
            end: 5,
          },
          {
            type: 'literal',
            args: ['number', F(10)],
            start: 16,
            end: 17,
          },
        ],
        start: 2,
        end: 21,
      },
    ],
  },

  'basic time sequence (shorthand)': {
    source: '   [date(2020-10)..date(2020-03)]',
    ast: [
      {
        type: 'sequence',
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
        start: 3,
        end: 32,
      },
    ],
  },
});
