import { runTests } from './run-tests';

runTests({
  'year date': {
    source: ' date(1978) ',
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
          char: 10,
          line: 1,
          column: 11,
        },
      },
    ],
  },

  'month date': {
    source: 'date(1978-01)',
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
          char: 12,
          line: 1,
          column: 13,
        },
      },
    ],
  },

  'month date 2': {
    source: 'date(1978/01)',
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
          char: 12,
          line: 1,
          column: 13,
        },
      },
    ],
  },

  'month date 3': {
    source: 'date(1978-January)',
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
          char: 17,
          line: 1,
          column: 18,
        },
      },
    ],
  },

  'day date': {
    source: 'date(2010-01-04)',
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
          char: 15,
          line: 1,
          column: 16,
        },
      },
    ],
  },

  'day date with month literal': {
    source: 'date(2010-Mar-04)',
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
          char: 16,
          line: 1,
          column: 17,
        },
      },
    ],
  },

  'date with hour literal': {
    source: '  date(2010-April-21 10)',
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
          char: 23,
          line: 1,
          column: 24,
        },
      },
    ],
  },

  'date with minute literal': {
    source: '  date(2010-April-21 10:26)',
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
          char: 26,
          line: 1,
          column: 27,
        },
      },
    ],
  },

  'date with second literal': {
    source: '  date(2010-April-21 10:26:59)',
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
          char: 29,
          line: 1,
          column: 30,
        },
      },
    ],
  },

  'datetime with UTC timezone': {
    source: '  date(2010-April-21T10:26:59Z)',
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
          char: 30,
          line: 1,
          column: 31,
        },
      },
    ],
  },

  'datetime with hour offset timezone': {
    source: '  date(2010-October-21T10:26:59+5)',
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
          char: 33,
          line: 1,
          column: 34,
        },
      },
    ],
  },

  'datetime with hour offset timezone with minutes': {
    source: '  date(2010-Jun-21 10:26:59-03:30)',
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
          char: 33,
          line: 1,
          column: 34,
        },
      },
    ],
  },

  'Supports a date from toISOString()': {
    source: 'date(2021-06-18T13:06:39.198Z)',
    sourceMap: false,
    ast: [
      {
        type: 'date',
        args: [
          'year',
          2021,
          'month',
          6,
          'day',
          18,
          'hour',
          13,
          'minute',
          6,
          'second',
          39,
          'millisecond',
          198,
          'timezone',
          {
            hours: 0,
            minutes: 0,
          },
        ],
      },
    ],
  },
});
