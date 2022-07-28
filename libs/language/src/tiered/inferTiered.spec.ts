import { makeContext } from '../infer';
import { build as T } from '../type';
import { c, F, n, r, tiered, tieredDef, U } from '../utils';
import { inferTiered } from './inferTiered';

describe('inferTiered', () => {
  it('infers to error if empty', async () => {
    expect(
      (await inferTiered(makeContext(), tiered(n('literal', 'number', F(1)))))
        .errorCause
    ).toBeDefined();
  });

  it('errors if tiered arg is not number', async () => {
    expect(
      (await inferTiered(makeContext(), tiered(n('literal', 'boolean', true))))
        .errorCause
    ).toBeDefined();
  });

  it('errors if tier is not a number', async () => {
    expect(
      (
        await inferTiered(
          makeContext(),
          tiered(
            tiered(
              n('literal', 'number', F(1)),
              tieredDef(
                n('literal', 'boolean', true),
                n('literal', 'number', F(1))
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
          makeContext(),
          tiered(
            tiered(
              n('literal', 'number', F(1)),
              tieredDef(
                n('literal', 'number', F(1)),
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
        makeContext(),
        tiered(
          n('literal', 'number', F(1)),
          tieredDef(
            n('literal', 'number', F(1)),
            c('*', n('literal', 'number', F(2)), r('USD'))
          ),
          tieredDef(
            n('literal', 'number', F(2)),
            c('*', n('literal', 'number', F(2)), r('USD'))
          )
        )
      )
    ).toMatchObject(T.number(U('USD', { known: true })));
  });

  it('tier defs must be congruous', async () => {
    expect(
      (
        await inferTiered(
          makeContext(),
          tiered(
            n('literal', 'number', F(1)),
            tieredDef(
              n('literal', 'number', F(1)),
              c('*', n('literal', 'number', F(2)), r('USD'))
            ),
            tieredDef(
              n('literal', 'number', F(1)),
              c('*', n('literal', 'number', F(2)), r('EUR'))
            )
          )
        )
      ).errorCause
    ).toBeDefined();
  });
});
