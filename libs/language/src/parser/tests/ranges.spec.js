import { F } from '../../utils';
import { runTests } from '../run-tests';

runTests({
  'basic numeric range using ..': {
    source: '  range ( 1..10 ) ',
    ast: [
      {
        type: 'range',
        args: [
          {
            type: 'literal',
            args: ['number', F(1)],
            start: 10,
            end: 10,
          },
          {
            type: 'literal',
            args: ['number', F(10)],
            start: 13,
            end: 14,
          },
        ],
        start: 2,
        end: 16,
      },
    ],
  },

  'basic numeric range using "through"': {
    source: '  range ( 1  through 10)',
    sourceMap: false,
    ast: [
      {
        type: 'range',
        args: [
          {
            type: 'literal',
            args: ['number', F(1)],
          },
          {
            type: 'literal',
            args: ['number', F(10)],
          },
        ],
      },
    ],
  },

  'basic time range': {
    source: '  range(date(2020-10)..date(2020-03))',
    sourceMap: false,
    ast: [
      {
        type: 'range',
        args: [
          {
            type: 'date',
            args: ['year', 2020n, 'month', 10n],
          },
          {
            type: 'date',
            args: ['year', 2020n, 'month', 3n],
          },
        ],
      },
    ],
  },
});
