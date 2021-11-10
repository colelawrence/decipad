import { col } from '../utils';
import { runTests } from './run-tests';

runTests({
  'empty column': {
    source: ' [ ] ',
    ast: [
      {
        type: 'column',
        args: [
          {
            type: 'column-items',
            args: [],
            start: {
              char: 2,
              line: 1,
              column: 3,
            },
            end: {
              char: 2,
              line: 1,
              column: 3,
            },
          },
        ],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 3,
          line: 1,
          column: 4,
        },
      },
    ],
  },

  'two item column': {
    source: ' [ 1,3 ] ',
    ast: [
      {
        type: 'column',
        args: [
          {
            type: 'column-items',
            args: [
              {
                type: 'literal',
                args: ['number', 1, null],
                start: {
                  char: 3,
                  line: 1,
                  column: 4,
                },
                end: {
                  char: 3,
                  line: 1,
                  column: 4,
                },
              },
              {
                type: 'literal',
                args: ['number', 3, null],
                start: {
                  char: 5,
                  line: 1,
                  column: 6,
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
              char: 6,
              line: 1,
              column: 7,
            },
          },
        ],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 7,
          line: 1,
          column: 8,
        },
      },
    ],
  },

  'column with two expressions': {
    source: ' [ 1, 2 + 3 ] ',
    sourceMap: false,
    ast: [
      {
        type: 'column',
        args: [
          {
            type: 'column-items',
            args: [
              {
                type: 'literal',
                args: ['number', 1, null],
              },
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
                        type: 'literal',
                        args: ['number', 2, null],
                      },
                      {
                        type: 'literal',
                        args: ['number', 3, null],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  'column with 4 components': {
    source: ' [  1  , 2,\n3  ,   4   ]',
    sourceMap: false,
    ast: [col(1, 2, 3, 4)],
  },
});
