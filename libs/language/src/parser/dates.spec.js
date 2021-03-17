import { runTests } from './run-tests';

runTests({
  'year date': {
    source: ' Y1978 ',
    ast: [
      {
        type: 'date',
        args: ['year', 1978],
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

  'month date': {
    source: '1978-01',
    ast: [
      {
        type: 'date',
        args: ['year', 1978, 'month', 1],
        start: {
          char: 0,
          line: 1,
          column: 1,
        },
        end: {
          char: 6,
          line: 1,
          column: 7,
        },
      },
    ],
  },

  'month date 2': {
    source: '1978/01',
    ast: [
      {
        type: 'date',
        args: ['year', 1978, 'month', 1],
        start: {
          char: 0,
          line: 1,
          column: 1,
        },
        end: {
          char: 6,
          line: 1,
          column: 7,
        },
      },
    ],
  },

  'month date 3': {
    source: '1978-January',
    ast: [
      {
        type: 'date',
        args: ['year', 1978, 'month', 1],
        start: {
          char: 0,
          line: 1,
          column: 1,
        },
        end: {
          char: 11,
          line: 1,
          column: 12,
        },
      },
    ],
  },

  'day date': {
    source: '2010-01-04',
    ast: [
      {
        type: 'date',
        args: ['year', 2010, 'month', 1, 'day', 4],
        start: {
          char: 0,
          line: 1,
          column: 1,
        },
        end: {
          char: 9,
          line: 1,
          column: 10,
        },
      },
    ],
  },

  'day date with month literal': {
    source: '2010-Mar-04',
    ast: [
      {
        type: 'date',
        args: ['year', 2010, 'month', 3, 'day', 4],
        start: {
          char: 0,
          line: 1,
          column: 1,
        },
        end: {
          char: 10,
          line: 1,
          column: 11,
        },
      },
    ],
  },

  'date with hour literal': {
    source: '  2010-April-21 10',
    ast: [
      {
        type: 'date',
        args: ['year', 2010, 'month', 4, 'day', 21, 'hour', 10],
        start: {
          char: 2,
          line: 1,
          column: 3,
        },
        end: {
          char: 17,
          line: 1,
          column: 18,
        },
      },
    ],
  },

  'date with minute literal': {
    source: '  2010-April-21 10:26',
    ast: [
      {
        type: 'date',
        args: ['year', 2010, 'month', 4, 'day', 21, 'hour', 10, 'minute', 26],
        start: {
          char: 2,
          line: 1,
          column: 3,
        },
        end: {
          char: 20,
          line: 1,
          column: 21,
        },
      },
    ],
  },

  'date with second literal': {
    source: '  2010-April-21 10:26:59',
    ast: [
      {
        type: 'date',
        args: [
          'year',
          2010,
          'month',
          4,
          'day',
          21,
          'hour',
          10,
          'minute',
          26,
          'second',
          59,
        ],
        start: {
          char: 2,
          line: 1,
          column: 3,
        },
        end: {
          char: 23,
          line: 1,
          column: 24,
        },
      },
    ],
  },

  'datetime with UTC timezone': {
    source: '  2010-April-21T10:26:59Z',
    ast: [
      {
        type: 'date',
        args: [
          'year',
          2010,
          'month',
          4,
          'day',
          21,
          'hour',
          10,
          'minute',
          26,
          'second',
          59,
          'timezone',
          {
            hours: 0,
            minutes: 0,
          },
        ],
        start: {
          char: 2,
          line: 1,
          column: 3,
        },
        end: {
          char: 24,
          line: 1,
          column: 25,
        },
      },
    ],
  },

  'datetime with hour offset timezone': {
    source: '  2010-October-21T10:26:59+5',
    ast: [
      {
        type: 'date',
        args: [
          'year',
          2010,
          'month',
          10,
          'day',
          21,
          'hour',
          10,
          'minute',
          26,
          'second',
          59,
          'timezone',
          {
            hours: 5,
            minutes: 0,
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

  'datetime with hour offset timezone with minutes': {
    source: '  2010-Jun-21 10:26:59-03:30',
    ast: [
      {
        type: 'date',
        args: [
          'year',
          2010,
          'month',
          6,
          'day',
          21,
          'hour',
          10,
          'minute',
          26,
          'second',
          59,
          'timezone',
          {
            hours: -3,
            minutes: -30,
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
});
