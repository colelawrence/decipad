import { N } from '@decipad/number';
import { runTests } from '../run-tests';

runTests({
  'ref assignment with simple name': {
    source: ' simpleName = 12 ',
    ast: [
      {
        type: 'assign',
        args: [
          {
            type: 'def',
            args: ['simpleName'],
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
          {
            type: 'literal',
            args: ['number', N(12)],
            start: {
              char: 14,
              line: 1,
              column: 15,
            },
            end: {
              char: 15,
              line: 1,
              column: 16,
            },
          },
        ],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 15,
          line: 1,
          column: 16,
        },
      },
    ],
  },

  'ref assignment': {
    source: ' this_is_a_ref_name = 12 ',
    ast: [
      {
        type: 'assign',
        args: [
          {
            type: 'def',
            args: ['this_is_a_ref_name'],
            start: {
              char: 1,
              line: 1,
              column: 2,
            },
            end: {
              char: 18,
              line: 1,
              column: 19,
            },
          },
          {
            type: 'literal',
            args: ['number', N(12)],
            start: {
              char: 22,
              line: 1,
              column: 23,
            },
            end: {
              char: 23,
              line: 1,
              column: 24,
            },
          },
        ],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 23,
          line: 1,
          column: 24,
        },
      },
    ],
  },
});
