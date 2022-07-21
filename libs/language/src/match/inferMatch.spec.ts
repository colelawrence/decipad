import { makeContext } from '../infer';
import { F, match, matchDef, n } from '../utils';
import { build as t } from '../type';
import { inferMatch } from './inferMatch';

describe('inferMatch', () => {
  it('infers to nothing if empty', async () => {
    expect(await inferMatch(makeContext(), match())).toEqual(t.nothing());
  });

  it('errors if match def is not boolean', async () => {
    expect(
      (
        await inferMatch(
          makeContext(),
          match(
            matchDef(n('literal', 'number', F(1)), n('literal', 'number', F(1)))
          )
        )
      ).errorCause
    ).toBeDefined();
  });

  it('infers to the value type', async () => {
    expect(
      await inferMatch(
        makeContext(),
        match(
          matchDef(n('literal', 'boolean', true), n('literal', 'number', F(1)))
        )
      )
    ).toEqual(t.number());
  });

  it('errors if values are incongruous', async () => {
    expect(
      (
        await inferMatch(
          makeContext(),
          match(
            matchDef(
              n('literal', 'boolean', true),
              n('literal', 'number', F(1))
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
