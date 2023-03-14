import { N } from '@decipad/number';
import { makeContext } from '../infer';
import { match, matchDef, n } from '../utils';
import { buildType as t } from '../type';
import { inferMatch } from './inferMatch';

describe('inferMatch', () => {
  it('infers to nothing if empty', () => {
    expect(inferMatch(makeContext(), match())).toEqual(t.nothing());
  });

  it('errors if match def is not boolean', () => {
    expect(
      inferMatch(
        makeContext(),
        match(
          matchDef(n('literal', 'number', N(1)), n('literal', 'number', N(1)))
        )
      ).errorCause
    ).toBeDefined();
  });

  it('infers to the value type', () => {
    expect(
      inferMatch(
        makeContext(),
        match(
          matchDef(n('literal', 'boolean', true), n('literal', 'number', N(1)))
        )
      )
    ).toEqual(t.number());
  });

  it('errors if values are incongruous', () => {
    expect(
      inferMatch(
        makeContext(),
        match(
          matchDef(n('literal', 'boolean', true), n('literal', 'number', N(1))),
          matchDef(n('literal', 'boolean', true), n('literal', 'string', 'hey'))
        )
      ).errorCause
    ).toBeDefined();
  });
});
