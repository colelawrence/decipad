// eslint-disable-next-line no-restricted-imports
import { col, r, categories } from '@decipad/language-utils';
import { runTests } from '../run-tests';

runTests({
  'can create sets': {
    source: 'SetName = categories [1, 2, 3]',
    sourceMap: false,
    ast: [categories('SetName', col(1, 2, 3))],
  },

  'can create sets from non-col': {
    source: 'SetName = categories Reference',
    sourceMap: false,
    ast: [categories('SetName', r('Reference'))],
  },
});
