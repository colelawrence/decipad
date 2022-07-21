import { F } from '../utils';
import { runTests } from './run-tests';

runTests({
  'empty match': {
    source: ' match { } ',
    ast: [
      {
        args: [],
        end: {
          char: 9,
          column: 10,
          line: 1,
        },
        start: {
          char: 1,
          column: 2,
          line: 1,
        },
        type: 'match',
      },
    ],
  },

  'match with one match def': {
    source: ' match { true: 1 } ',
    ast: [
      {
        type: 'match',
        args: [
          {
            args: [
              {
                args: ['boolean', true],
                type: 'literal',
              },
              {
                args: ['number', F(1)],
                type: 'literal',
              },
            ],
            type: 'matchdef',
          },
        ],
      },
    ],
  },

  'match with man match defs': {
    source: ` match { true: 1
    a + 1: yup,
    oops: true } `,
    ast: [
      {
        type: 'match',
        args: [
          {
            type: 'matchdef',
            args: [
              {
                type: 'literal',
                args: ['boolean', true],
              },
              {
                type: 'literal',
                args: ['number', F(1)],
              },
            ],
          },
          {
            type: 'matchdef',
            args: [
              {
                type: 'function-call',
                args: [
                  {
                    type: 'funcref',
                    args: ['+'],
                  },
                  {
                    type: 'argument-list',
                    args: [
                      {
                        type: 'ref',
                        args: ['a'],
                      },
                      {
                        type: 'literal',
                        args: ['number', F(1)],
                      },
                    ],
                  },
                ],
              },
              {
                type: 'ref',
                args: ['yup'],
              },
            ],
          },
          {
            type: 'matchdef',
            args: [
              {
                type: 'ref',
                args: ['oops'],
              },
              {
                type: 'literal',
                args: ['boolean', true],
              },
            ],
          },
        ],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 48,
          line: 3,
          column: 16,
        },
      },
    ],
  },
});
