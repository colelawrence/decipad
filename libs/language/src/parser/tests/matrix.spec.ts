import { c, l, matrixAssign, matrixRef, r } from '../../utils';
import { runTests } from '../run-tests';

runTests({
  'can assign to matrices': {
    source: 'Variable[Dim == 1] = 2',
    sourceMap: false,
    ast: [matrixAssign('Variable', [c('==', r('Dim'), l(1))], l(2))],
  },

  'can assign to matrices(2)': {
    source: 'Variable[Dim == 1, Dim2 == "str"] = 2',
    sourceMap: false,
    ast: [
      matrixAssign(
        'Variable',
        [c('==', r('Dim'), l(1)), c('==', r('Dim2'), l('str'))],
        l(2)
      ),
    ],
  },

  'can refer to matrices': {
    source: 'Variable[Dim == 1, Dim2 == "str"]',
    sourceMap: false,
    ast: [
      matrixRef('Variable', [
        c('==', r('Dim'), l(1)),
        c('==', r('Dim2'), l('str')),
      ]),
    ],
  },

  'can refer to matrices(2)': {
    source: 'Variable[WholeDim]',
    sourceMap: false,
    ast: [matrixRef('Variable', [r('WholeDim')])],
  },
});
