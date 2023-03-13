import { runTests } from '../run-tests';

runTests({
  'year date': {
    source: ' date(1978) ',
    ast: [
      {
        type: 'date',
        args: ['year', 1978n],
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

  quarter1: {
    source: 'date(1978Q2)',
    ast: [
      {
        type: 'date',
        args: ['year', 1978n, 'quarter', 2n],
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

  quarter2: {
    source: 'date(1978q2)',
    ast: [
      {
        type: 'date',
        args: ['year', 1978n, 'quarter', 2n],
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

  'month date': {
    source: 'date(1978-01)',
    ast: [
      {
        type: 'date',
        args: ['year', 1978n, 'month', 1n],
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
        args: ['year', 1978n, 'month', 1n],
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
        args: ['year', 1978n, 'month', 1n],
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
        args: ['year', 2010n, 'month', 1n, 'day', 4n],
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
        args: ['year', 2010n, 'month', 3n, 'day', 4n],
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
        args: ['year', 2010n, 'month', 4n, 'day', 21n, 'hour', 10n],
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
        args: [
          'year',
          2010n,
          'month',
          4n,
          'day',
          21n,
          'hour',
          10n,
          'minute',
          26n,
        ],
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
          2010n,
          'month',
          4n,
          'day',
          21n,
          'hour',
          10n,
          'minute',
          26n,
          'second',
          59n,
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
          2010n,
          'month',
          4n,
          'day',
          21n,
          'hour',
          10n,
          'minute',
          26n,
          'second',
          59n,
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
          2010n,
          'month',
          10n,
          'day',
          21n,
          'hour',
          10n,
          'minute',
          26n,
          'second',
          59n,
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
          2010n,
          'month',
          6n,
          'day',
          21n,
          'hour',
          10n,
          'minute',
          26n,
          'second',
          59n,
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
          2021n,
          'month',
          6n,
          'day',
          18n,
          'hour',
          13n,
          'minute',
          6n,
          'second',
          39n,
          'millisecond',
          198n,
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
