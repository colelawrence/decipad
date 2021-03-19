import { runTests } from './run-tests';

runTests({
  'expression is number with units': {
    source: '10 apples',
    ast: [
      {
        type: 'literal',
        args: [
          'number',
          10,
          [
            {
              unit: 'apples',
              exp: 1,
              multiplier: 1,
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
          ],
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

  'expression is number with composed units': {
    source: '10 apples*oranges',
    ast: [
      {
        type: 'literal',
        args: [
          'number',
          10,
          [
            {
              unit: 'apples',
              exp: 1,
              multiplier: 1,
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
              exp: 1,
              multiplier: 1,
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
          10,
          [
            {
              unit: 'apples',
              exp: 1,
              multiplier: 1,
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
              exp: -1,
              multiplier: 1,
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
    ast: [
      {
        type: 'literal',
        args: [
          'number',
          10,
          [
            {
              unit: 'm',
              exp: 1,
              multiplier: 1000,
              known: true,
              start: {
                char: 3,
                line: 1,
                column: 4,
              },
              end: {
                char: 4,
                line: 1,
                column: 5,
              },
            },
          ],
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

  'expression is number with simple known unit': {
    source: '2 Gbytes',
    ast: [
      {
        type: 'literal',
        args: [
          'number',
          2,
          [
            {
              unit: 'bytes',
              exp: 1,
              multiplier: 1e9,
              known: true,
              start: {
                char: 2,
                line: 1,
                column: 3,
              },
              end: {
                char: 7,
                line: 1,
                column: 8,
              },
            },
          ],
        ],
        start: {
          char: 0,
          line: 1,
          column: 1,
        },
        end: {
          char: 7,
          line: 1,
          column: 8,
        },
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
          3,
          [
            {
              unit: 'm',
              exp: 2,
              multiplier: 1000,
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
          3,
          [
            {
              unit: 'kg',
              exp: 3,
              multiplier: 1,
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
              exp: -2,
              multiplier: 100,
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
          3,
          [
            {
              unit: 'kg',
              exp: 3,
              multiplier: 1,
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
              exp: -2,
              multiplier: 100,
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
              exp: 1,
              multiplier: 1000000,
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
