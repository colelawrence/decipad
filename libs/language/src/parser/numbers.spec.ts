import { c, l, r } from '../utils';
import { runTests } from './run-tests';

runTests({
  'units on the right': {
    source: '100$',
    sourceMap: false,
    ast: [c('implicit*', l(100), r('$'))],
  },
  'units on the left': {
    source: '$100',
    sourceMap: false,
    ast: [c('implicit*', r('$'), l(100))],
  },
  'combined with multiplication': {
    source: 'Var * $2',
    sourceMap: false,
    ast: [c('*', r('Var'), c('implicit*', r('$'), l(2)))],
  },
  'combined with multiplication (2)': {
    source: '$2 * Var',
    sourceMap: false,
    ast: [c('*', c('implicit*', r('$'), l(2)), r('Var'))],
  },
  'space thousands separation': {
    source: '100 000',
    sourceMap: false,
    ast: [l(100_000)],
  },
  'underscore thousands separation': {
    source: '100 _ 000',
    sourceMap: false,
    ast: [l(100_000)],
  },
});
