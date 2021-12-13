import { runTests } from './run-tests';

runTests({
  'time quantity with one unit': {
    source: ' [ 1 year ]',
    ast: [
      {
        type: 'time-quantity',
        args: ['year', 1n],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 10,
          line: 1,
          column: 11,
        },
      },
    ],
  },

  'time quantity with multiple units separated by commas': {
    source: '  [  1 months  ,  2 hours  ] ',
    ast: [
      {
        type: 'time-quantity',
        args: ['month', 1n, 'hour', 2n],
        start: 2,
        end: 27,
      },
    ],
  },

  'time quantity with multiple units separated by commas and an and': {
    source: '  [  3 week  ,  2 minutes, 20 seconds  ] ',
    ast: [
      {
        type: 'time-quantity',
        args: ['week', 3n, 'minute', 2n, 'second', 20n],
        start: 2,
        end: 39,
      },
    ],
  },
});
