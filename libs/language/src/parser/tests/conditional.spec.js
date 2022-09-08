import { c, r } from '../../utils';
import { runTests } from '../run-tests';

runTests({
  conditional: {
    source: 'if Condition then IfTrue else if_false',
    ast: [
      {
        type: 'function-call',
        args: [
          {
            type: 'funcref',
            args: ['if'],
            start: 0,
            end: 1,
          },
          {
            type: 'argument-list',
            args: [
              {
                type: 'ref',
                args: ['Condition'],
                start: 3,
                end: 11,
              },
              {
                type: 'ref',
                args: ['IfTrue'],
                start: 18,
                end: 23,
              },
              {
                type: 'ref',
                args: ['if_false'],
                start: 30,
                end: 37,
              },
            ],
            start: 3,
            end: 37,
          },
        ],
        start: 0,
        end: 37,
      },
    ],
  },

  'chained conditional': {
    source: `if A
      then B
      else if C then D else E`,
    sourceMap: false,
    ast: [c('if', r('A'), r('B'), c('if', r('C'), r('D'), r('E')))],
  },
});
