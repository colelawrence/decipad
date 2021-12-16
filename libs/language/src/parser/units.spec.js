import { units, F } from '../utils';
import { runTests } from './run-tests';

runTests({
  'expression is number with units': {
    source: '10 apples',
    ast: [
      {
        type: 'literal',
        args: [
          'number',
          F(10),
          {
            type: 'units',
            args: [
              {
                unit: 'apples',
                exp: 1n,
                multiplier: F(1),
                known: false,
                start: 3,
                end: 8,
              },
            ],
            start: 3,
            end: 8,
          },
        ],
        start: {
          char: 0,
          line: 1,
          column: 1,
        },
        end: {
          char: 8,
          line: 1,
          column: 9,
        },
      },
    ],
  },

  'expression micrometers': {
    source: '10 μm',
    ast: [
      {
        type: 'literal',
        args: [
          'number',
          F(10),
          {
            type: 'units',
            args: [
              {
                unit: 'm',
                exp: 1n,
                multiplier: F(1, 1_000_000),
                known: true,
                start: 3,
                end: 4,
              },
            ],
            start: 3,
            end: 4,
          },
        ],
        start: {
          char: 0,
          line: 1,
          column: 1,
        },
        end: {
          char: 4,
          line: 1,
          column: 5,
        },
      },
    ],
  },

  'expression is number with composed units': {
    source: '10 apples*oranges',
    ast: [
      {
        type: 'literal',
        args: [
          'number',
          F(10),
          {
            type: 'units',
            args: [
              {
                unit: 'apples',
                exp: 1n,
                multiplier: F(1),
                known: false,
                start: {
                  char: 3,
                  line: 1,
                  column: 4,
                },
                end: {
                  char: 8,
                  line: 1,
                  column: 9,
                },
              },
              {
                unit: 'oranges',
                exp: 1n,
                multiplier: F(1),
                known: false,
                start: {
                  char: 10,
                  line: 1,
                  column: 11,
                },
                end: {
                  char: 16,
                  line: 1,
                  column: 17,
                },
              },
            ],
            start: 3,
            end: 16,
          },
        ],
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

  'expression is number with divided units': {
    source: '10 apples/oranges',
    ast: [
      {
        type: 'literal',
        args: [
          'number',
          F(10),
          {
            type: 'units',
            args: [
              {
                unit: 'apples',
                exp: 1n,
                multiplier: F(1),
                known: false,
                start: {
                  char: 3,
                  line: 1,
                  column: 4,
                },
                end: {
                  char: 8,
                  line: 1,
                  column: 9,
                },
              },
              {
                unit: 'oranges',
                exp: -1n,
                multiplier: F(1),
                known: false,
                start: {
                  char: 10,
                  line: 1,
                  column: 11,
                },
                end: {
                  char: 16,
                  line: 1,
                  column: 17,
                },
              },
            ],
            start: {
              char: 3,
              line: 1,
              column: 4,
            },
            end: {
              char: 16,
              line: 1,
              column: 17,
            },
          },
        ],
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

  'expression is number with multiplier simple unit': {
    source: '10 km',
    sourceMap: false,
    ast: [
      {
        type: 'literal',
        args: [
          'number',
          F(10),
          units({
            unit: 'm',
            exp: 1n,
            multiplier: F(1000),
            known: true,
          }),
        ],
      },
    ],
  },

  'expression is number with simple known unit': {
    source: '2 Gbytes',
    sourceMap: false,
    ast: [
      {
        type: 'literal',
        args: [
          'number',
          F(2),
          units({
            unit: 'bytes',
            exp: 1n,
            multiplier: F(1000000000),
            known: true,
          }),
        ],
      },
    ],
  },

  'expression is number with composed squared unit': {
    source: '3 km^2',
    ast: [
      {
        type: 'literal',
        args: [
          'number',
          F(3),
          {
            type: 'units',
            args: [
              {
                unit: 'm',
                exp: 2n,
                multiplier: F(1000),
                known: true,
                start: {
                  char: 2,
                  line: 1,
                  column: 3,
                },
                end: {
                  char: 5,
                  line: 1,
                  column: 6,
                },
              },
            ],
            start: {
              char: 2,
              line: 1,
              column: 3,
            },
            end: {
              char: 5,
              line: 1,
              column: 6,
            },
          },
        ],
        start: {
          char: 0,
          line: 1,
          column: 1,
        },
        end: {
          char: 5,
          line: 1,
          column: 6,
        },
      },
    ],
  },

  'expression is number with complex composed unit': {
    source: '3 kg^3/hm^2',
    ast: [
      {
        type: 'literal',
        args: [
          'number',
          F(3),
          {
            type: 'units',
            args: [
              {
                unit: 'g',
                exp: 3n,
                multiplier: F(1000),
                known: true,
                start: {
                  char: 2,
                  line: 1,
                  column: 3,
                },
                end: {
                  char: 5,
                  line: 1,
                  column: 6,
                },
              },
              {
                unit: 'm',
                exp: -2n,
                multiplier: F(100),
                known: true,
                start: {
                  char: 7,
                  line: 1,
                  column: 8,
                },
                end: {
                  char: 10,
                  line: 1,
                  column: 11,
                },
              },
            ],
            start: {
              char: 2,
              line: 1,
              column: 3,
            },
            end: {
              char: 10,
              line: 1,
              column: 11,
            },
          },
        ],
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

  'expression is number with complex composed unit (2)': {
    source: '3 kg^3/hm^2*MWatt',
    ast: [
      {
        type: 'literal',
        args: [
          'number',
          F(3),
          {
            type: 'units',
            args: [
              {
                unit: 'g',
                exp: 3n,
                multiplier: F(1000),
                known: true,
                start: {
                  char: 2,
                  line: 1,
                  column: 3,
                },
                end: {
                  char: 5,
                  line: 1,
                  column: 6,
                },
              },
              {
                unit: 'm',
                exp: -2n,
                multiplier: F(100),
                known: true,
                start: {
                  char: 7,
                  line: 1,
                  column: 8,
                },
                end: {
                  char: 10,
                  line: 1,
                  column: 11,
                },
              },
              {
                unit: 'Watt',
                exp: 1n,
                multiplier: F(1000000),
                known: true,
                start: {
                  char: 12,
                  line: 1,
                  column: 13,
                },
                end: {
                  char: 16,
                  line: 1,
                  column: 17,
                },
              },
            ],
            start: {
              char: 2,
              line: 1,
              column: 3,
            },
            end: {
              char: 16,
              line: 1,
              column: 17,
            },
          },
        ],
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
});
