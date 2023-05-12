import { n } from '..';
import { col, table } from '../../utils';
import { runTests } from '../run-tests';

runTests({
  'empty table': {
    source: ' Table = { } ',
    ast: [
      {
        type: 'table',
        args: [
          {
            type: 'tabledef',
            args: ['Table'],
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
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 11,
          line: 1,
          column: 12,
        },
      },
    ],
  },

  'table with one implicit coldef': {
    source: ' Table = { abc } ',
    sourceMap: false,
    ast: [table('Table', { abc: n('ref', 'abc') })],
  },

  /*
  'table with trailing comma': {
    source: ' Table = { abc, } ',
    ast: [
      {
        type: 'assign',
        args: [
          {
            type: 'def',
            args: ['Table'],
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
          {
            type: 'table',
            args: [
              {
                type: 'table-column',
                args: [
                  {
                    type: 'coldef',
                    args: ['abc'],
                    start: {
                      char: 11,
                      line: 1,
                      column: 12,
                    },
                    end: {
                      char: 13,
                      line: 1,
                      column: 14,
                    },
                  },
                  {
                    type: 'ref',
                    args: ['abc'],
                    start: {
                      char: 11,
                      line: 1,
                      column: 12,
                    },
                    end: {
                      char: 13,
                      line: 1,
                      column: 14,
                    },
                  },
                ],
                start: {
                  char: 11,
                  line: 1,
                  column: 12,
                },
                end: {
                  char: 13,
                  line: 1,
                  column: 14,
                },
              },
            ],
            start: {
              char: 9,
              line: 1,
              column: 10,
            },
            end: {
              char: 16,
              line: 1,
              column: 17,
            },
          },
        ],
        start: {
          char: 1,
          line: 1,
          column: 2,
        },
        end: {
          char: 16,
          line: 1,
          column: 17,
        },
      },
    ],
  },
  */

  'table with three implicit coldefs': {
    source: ' Table = { abc  ,  def,   ghi} ',
    sourceMap: false,
    ast: [
      table('Table', {
        abc: n('ref', 'abc'),
        def: n('ref', 'def'),
        ghi: n('ref', 'ghi'),
      }),
    ],
  },

  'table with three implicit coldefs newline separated': {
    source: ' Table = { abc \n  def    \n   ghi \n } ',
    sourceMap: false,
    ast: [
      table('Table', {
        abc: n('ref', 'abc'),
        def: n('ref', 'def'),
        ghi: n('ref', 'ghi'),
      }),
    ],
  },

  /*
  'table with explicit value as column': {
    source: ' Table = { abc = [ 1 , 2 ]  }',
    ast: [
      {
        type: 'assign',
        args: [
          {
            type: 'def',
            args: ['Table'],
            start: 1,
            end: 5,
          },
          {
            type: 'table',
            args: [
              {
                type: 'table-column',
                args: [
                  {
                    type: 'coldef',
                    args: ['abc'],
                    start: 11,
                    end: 13,
                  },
                  {
                    type: 'column',
                    args: [
                      [
                        {
                          type: 'literal',
                          args: ['number', 1, null, { d: 1, n: 1, s: 1 }],
                          start: 19,
                          end: 19,
                        },
                        {
                          type: 'literal',
                          args: ['number', 2, null, { d: 1, n: 2, s: 1 }],
                          start: 23,
                          end: 23,
                        },
                      ],
                    ],
                    start: 17,
                    end: 25,
                  },
                ],
                start: 11,
                end: 25,
              },
            ],
            start: 9,
            end: 28,
          },
        ],
        start: 1,
        end: 28,
      },
    ],
  },
  */

  'table with mixed defs in each line': {
    source: ' Table = { \n abc \n def = [ 1 , 2 ] \n  }',
    sourceMap: false,
    ast: [
      {
        type: 'table',
        args: [
          n('tabledef', 'Table'),
          n('table-column', n('coldef', 'abc'), n('ref', 'abc')),
          n('table-column', n('coldef', 'def'), col(1, 2)),
        ],
      },
    ],
  },
});
