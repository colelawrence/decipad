// eslint-disable-next-line no-restricted-imports
import { col, table } from '@decipad/language-utils';
import { n } from '..';
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
