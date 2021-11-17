import { r, n } from '../utils';
import { runTests } from './run-tests';

runTests({
  'can use source maps': {
    source: 'select(Table, Col1)',
    ast: [
      {
        type: 'directive',
        start: 0,
        end: 18,
        args: [
          'select',
          {
            type: 'ref',
            start: 7,
            end: 11,
            args: ['Table'],
          },
          {
            type: 'generic-identifier',
            start: 14,
            end: 17,
            args: ['Col1'],
          },
        ],
      },
    ],
  },
  'can select columns': {
    source: 'select(Table, Col1)',
    sourceMap: false,
    ast: [
      n('directive', 'select', r('Table'), n('generic-identifier', 'Col1')),
    ],
  },
});
