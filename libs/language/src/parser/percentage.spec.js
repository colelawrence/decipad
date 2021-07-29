import { c, l } from '../utils';
import { runTests } from './run-tests';

runTests({
  'percentage value': {
    source: ' 190% ',
    ast: [
      {
        type: 'literal',
        args: ['number', 1.9, null],
        start: 1,
        end: 4,
      },
    ],
  },
  'negative percentage value': {
    source: ' -190% ',
    ast: [
      {
        type: 'literal',
        args: ['number', -1.9, null],
        start: 1,
        end: 5,
      },
    ],
  },
  "Isn't ambiguous with the modulo operator and subtraction": {
    source: ' 10% - 1 ',
    sourceMap: false,
    ast: [c('-', l(0.1), l(1))],
  },
});
