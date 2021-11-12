import { c, l } from '../utils';
import { runTests } from './run-tests';

runTests({
  'percentage value': {
    source: ' 190% ',
    ast: [
      {
        type: 'literal',
        args: [
          'number',
          1.9,
          null,
          { d: 2251799813685248, n: 4278419646001971, s: 1 },
        ],
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
        args: [
          'number',
          -1.9,
          null,
          { d: 2251799813685248, n: 4278419646001971, s: -1 },
        ],
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
