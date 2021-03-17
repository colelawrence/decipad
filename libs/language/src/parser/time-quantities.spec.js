import { runTests } from './run-tests';

runTests({
  'time quantity with one unit': {
    source: ' [ 1 year ]',
    ast: [
      {
        type: 'time-quantity',
        args: ['years', 1],
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
        args: ['months', 1, 'hours', 2],
        start: {
          char: 2,
          line: 1,
          column: 3,
        },
        end: {
          char: 22,
          line: 1,
          column: 23,
        },
      },
    ],
  },

  'time quantity with multiple units separated by commas and an and': {
    source: '  [  3 week  ,  2 minutes, 20 seconds  ] ',
    ast: [
      {
        type: 'time-quantity',
        args: ['weeks', 3, 'minutes', 2, 'seconds', 20],
        start: {
          char: 2,
          line: 1,
          column: 3,
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
