import { runAST } from '..';
import { build as T } from '../type';
import { n, block, tiered, tieredDef, F, r, c } from '../utils';

describe('evaluateTiered', () => {
  it('returns tier value if only one tier', async () => {
    const t = tiered(
      n('literal', 'number', F(2)),
      tieredDef(n('literal', 'number', F(2)), n('literal', 'number', F(3)))
    );
    expect(await runAST(block(t))).toMatchObject({
      type: T.number(),
      value: F(3),
    });
  });

  it('returns tier value if two accumulated exact tiers', async () => {
    const t = tiered(
      n('literal', 'number', F(5)),
      tieredDef(n('literal', 'number', F(2)), n('literal', 'number', F(3))),
      tieredDef(n('literal', 'number', F(3)), n('literal', 'number', F(4)))
    );
    expect(await runAST(block(t))).toMatchObject({
      type: T.number(),
      value: F(7),
    });
  });

  it('returns tier value if two accumulated inexact tiers', async () => {
    const t = tiered(
      n('literal', 'number', F(6)),
      tieredDef(n('literal', 'number', F(2)), n('literal', 'number', F(3))),
      tieredDef(n('literal', 'number', F(3)), n('literal', 'number', F(4)))
    );
    expect(await runAST(block(t))).toMatchObject({
      type: T.number(),
      value: F(7),
    });
  });

  it('returns tier value if two accumulated inexact tiers plus rest', async () => {
    const t = tiered(
      n('literal', 'number', F(6)),
      tieredDef(n('literal', 'number', F(2)), n('literal', 'number', F(3))),
      tieredDef(n('literal', 'number', F(3)), n('literal', 'number', F(4))),
      tieredDef(r('rest'), n('literal', 'number', F(5)))
    );
    expect(await runAST(block(t))).toMatchObject({
      type: T.number(),
      value: F(12), // 3 + 4 + 5
    });
  });

  it('allows calculation using slice or tier', async () => {
    const t = tiered(
      n('literal', 'number', F(7)),
      tieredDef(
        n('literal', 'number', F(2)),
        c('*', r('slice'), n('literal', 'number', F(3)))
      ), // 6
      tieredDef(
        n('literal', 'number', F(5)),
        c('*', r('slice'), n('literal', 'number', F(4)))
      ), // 12

      tieredDef(r('rest'), c('*', r('slice'), n('literal', 'number', F(5)))) // 10
    );
    expect(await runAST(block(t))).toMatchObject({
      type: T.number(),
      value: F(28), // 6 + 12 + 10
    });
  });

  it('evaluates to zero when arg is zero and no tier matched', async () => {
    const t = tiered(
      n('literal', 'number', F(0)),
      tieredDef(n('literal', 'number', F(50)), n('literal', 'number', F(1))) // 6
    );
    expect(await runAST(block(t))).toMatchObject({
      type: T.number(),
      value: F(0),
    });
  });

  it('evaluates max if value exceeds max', async () => {
    const t = tiered(
      n('literal', 'number', F(10)),
      tieredDef(r('rest'), n('literal', 'number', F(3))),
      tieredDef(r('max'), n('literal', 'number', F(2)))
    );
    expect(await runAST(block(t))).toMatchObject({
      type: T.number(),
      value: F(2),
    });
  });

  it('evaluates min if value lower than main', async () => {
    const t = tiered(
      n('literal', 'number', F(10)),
      tieredDef(r('rest'), n('literal', 'number', F(3))),
      tieredDef(r('min'), n('literal', 'number', F(100)))
    );
    expect(await runAST(block(t))).toMatchObject({
      type: T.number(),
      value: F(100),
    });
  });

  it('math checks', async () => {
    const t = (arg: number) =>
      tiered(
        n('literal', 'number', F(arg)),
        // 10k  : tier * 10%
        tieredDef(
          n('literal', 'number', F(10_000)),
          c('*', r('tier'), n('literal', 'number', F(10, 100)))
        ),
        // 50k  : tier * 20%
        tieredDef(
          n('literal', 'number', F(60_000)),
          c('*', r('tier'), n('literal', 'number', F(20, 100)))
        ),
        // 100kGBP : tier * 30%
        tieredDef(
          n('literal', 'number', F(160_000)),
          c('*', r('tier'), n('literal', 'number', F(30, 100)))
        ),
        // rest    : tier * 40%
        tieredDef(
          r('rest'),
          c('*', r('tier'), n('literal', 'number', F(40, 100)))
        ),
        //  max     : £50K
        tieredDef(r('max'), n('literal', 'number', F(50_000))),
        // min     : £3K
        tieredDef(r('min'), n('literal', 'number', F(3_000)))
      );

    const run = async (arg: number) => {
      const res = await runAST(block(t(arg)));
      expect(res).toMatchObject({
        type: T.number(),
      });
      return res.value;
    };

    // salesCommission(80k) = 10% 10k + 20% 50K + 40% 20K = 1K + 10K + 8K = 19K
    expect(await run(80_000)).toEqual(F(17_000));
    expect(await run(0)).toEqual(F(3_000));
    expect(await run(10_000)).toEqual(F(3_000));
    expect(await run(500_000)).toEqual(F(50_000));
  });

  it('zeroes when all tiers are zero except for the bigger than the argument ones', async () => {
    const t = tiered(
      n('literal', 'number', F(100)),
      tieredDef(n('literal', 'number', F(10)), n('literal', 'number', F(0))),
      tieredDef(n('literal', 'number', F(20)), n('literal', 'number', F(0))),
      tieredDef(n('literal', 'number', F(100)), n('literal', 'number', F(0))),
      tieredDef(n('literal', 'number', F(101)), n('literal', 'number', F(10)))
    );
    expect(await runAST(block(t))).toMatchObject({
      type: T.number(),
      value: F(0),
    });
  });

  it('zeroes when all tiers are zero except for the bigger than the argument ones and theres a rest', async () => {
    const t = tiered(
      n('literal', 'number', F(100)),
      tieredDef(n('literal', 'number', F(10)), n('literal', 'number', F(0))),
      tieredDef(n('literal', 'number', F(20)), n('literal', 'number', F(0))),
      tieredDef(n('literal', 'number', F(90)), n('literal', 'number', F(0))),
      tieredDef(r('rest'), c('*', r('tier'), n('literal', 'number', F(7))))
    );
    expect(await runAST(block(t))).toMatchObject({
      type: T.number(),
      value: F(70),
    });
  });

  it('errors on tier bounds', async () => {
    const t = tiered(
      n('literal', 'number', F(100)),
      tieredDef(n('literal', 'number', F(10)), n('literal', 'number', F(0))),
      tieredDef(n('literal', 'number', F(9)), n('literal', 'number', F(0))),
      tieredDef(r('rest'), c('*', r('tier'), n('literal', 'number', F(7))))
    );
    await expect(() => runAST(block(t))).rejects.toThrowError(
      'Error on tier definition number 2. Each tier level needs to be bigger than the previous one'
    );
  });
});
