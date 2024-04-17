import { N } from '@decipad/number';
// eslint-disable-next-line no-restricted-imports
import { buildType as t } from '@decipad/language-types';
import { match, matchDef, n } from '../utils';
import { inferMatch } from './inferMatch';
import { ScopedRealm, makeInferContext } from '../scopedRealm';

describe('inferMatch', () => {
  it('infers to nothing if empty', async () => {
    expect(
      await inferMatch(new ScopedRealm(undefined, makeInferContext()), match())
    ).toEqual(t.nothing());
  });

  it('errors if match def is not boolean', async () => {
    expect(
      (
        await inferMatch(
          new ScopedRealm(undefined, makeInferContext()),
          match(
            matchDef(n('literal', 'number', N(1)), n('literal', 'number', N(1)))
          )
        )
      ).errorCause
    ).toBeDefined();
  });

  it('infers to the value type', async () => {
    expect(
      await inferMatch(
        new ScopedRealm(undefined, makeInferContext()),
        match(
          matchDef(n('literal', 'boolean', true), n('literal', 'number', N(1)))
        )
      )
    ).toEqual(t.number());
  });

  it('errors if values are incongruous', async () => {
    expect(
      (
        await inferMatch(
          new ScopedRealm(undefined, makeInferContext()),
          match(
            matchDef(
              n('literal', 'boolean', true),
              n('literal', 'number', N(1))
            ),
            matchDef(
              n('literal', 'boolean', true),
              n('literal', 'string', 'hey')
            )
          )
        )
      ).errorCause
    ).toBeDefined();
  });
});
