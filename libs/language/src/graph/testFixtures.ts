import { c, n, l, funcDef } from '../utils';

export const blocks = [
  n('block', n('assign', n('def', 'b'), l(1))),
  n(
    'block',
    n('assign', n('def', 'a'), l(3)),
    n('ref', 'b'),
    funcDef('func', ['a'], c('+', n('ref', 'a'), n('ref', 'b')))
  ),
];
