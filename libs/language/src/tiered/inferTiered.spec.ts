import { N } from '@decipad/number';
// eslint-disable-next-line no-restricted-imports
import { buildType as T } from '@decipad/language-types';
import { makeContext } from '../infer';
import { c, n, r, tiered, tieredDef, U } from '../utils';
import { inferTiered } from './inferTiered';
import { Realm } from '../interpreter/Realm';

describe('inferTiered', () => {
  it('infers to error if empty', async () => {
    expect(
      (
        await inferTiered(
          new Realm(makeContext()),
          tiered(n('literal', 'number', N(1)))
        )
      ).errorCause
    ).toBeDefined();
  });

  it('errors if tiered arg is not number', async () => {
    expect(
      (
        await inferTiered(
          new Realm(makeContext()),
          tiered(n('literal', 'boolean', true))
        )
      ).errorCause
    ).toBeDefined();
  });

  it('errors if tier is not a number', async () => {
    expect(
      (
        await inferTiered(
          new Realm(makeContext()),
          tiered(
            tiered(
              n('literal', 'number', N(1)),
              tieredDef(
                n('literal', 'boolean', true),
                n('literal', 'number', N(1))
              )
            )
          )
        )
      ).errorCause
    ).toBeDefined();
  });

  it('errors if tier value is not number', async () => {
    expect(
      (
        await inferTiered(
          new Realm(makeContext()),
          tiered(
            tiered(
              n('literal', 'number', N(1)),
              tieredDef(
                n('literal', 'number', N(1)),
                n('literal', 'boolean', true)
              )
            )
          )
        )
      ).errorCause
    ).toBeDefined();
  });

  it('infers to type of value', async () => {
    expect(
      await inferTiered(
        new Realm(makeContext()),
        tiered(
          n('literal', 'number', N(1)),
          tieredDef(
            n('literal', 'number', N(1)),
            c('*', n('literal', 'number', N(2)), r('USD'))
          ),
          tieredDef(
            n('literal', 'number', N(2)),
            c('*', n('literal', 'number', N(2)), r('USD'))
          )
        )
      )
    ).toMatchObject(T.number(U('USD', { known: true })));
  });

  it('tier defs must be congruous', async () => {
    expect(
      (
        await inferTiered(
          new Realm(makeContext()),
          tiered(
            n('literal', 'number', N(1)),
            tieredDef(
              n('literal', 'number', N(1)),
              c('*', n('literal', 'number', N(2)), r('USD'))
            ),
            tieredDef(
              n('literal', 'number', N(1)),
              c('*', n('literal', 'number', N(2)), r('EUR'))
            )
          )
        )
      ).errorCause
    ).toBeDefined();
  });
});
