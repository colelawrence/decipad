import { c, r } from '../utils';
import { runTests } from './run-tests';

runTests({
  'binops are left-associative': {
    source: 'A / B / C',
    sourceMap: false,
    ast: [c('/', c('/', r('A'), r('B')), r('C'))],
  },
  /*
  'subtraction op (1)': {
    source: 'A - B',
    sourceMap: false,
    ast: [
      c('-', r('A'), r('B'))
    ]
  }
  */
});
