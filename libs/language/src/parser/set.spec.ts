import { col, r, categories } from '../utils';
import { runTests } from './run-tests';

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
