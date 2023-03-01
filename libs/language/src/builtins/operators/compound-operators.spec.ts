import { runCode } from '../../run';
import { typeSnapshotSerializer } from '../../testUtils';

expect.addSnapshotSerializer(typeSnapshotSerializer);

describe('compound operators', () => {
  it('compoundrate', async () => {
    expect(await runCode(`compoundrate(1.5%, 1 year in months)`))
      .toMatchInlineSnapshot(`
      Object {
        "type": percentage,
        "value": DeciNumber(0.195618171461535),
      }
    `);
  });

  it('futurevalue', async () => {
    expect(await runCode(`futurevalue(5%, 3 years, 100k$)`))
      .toMatchInlineSnapshot(`
      Object {
        "type": $,
        "value": DeciNumber(115762.5),
      }
    `);

    expect(await runCode(`futurevalue(5%, 2 years, 10$)`))
      .toMatchInlineSnapshot(`
      Object {
        "type": $,
        "value": DeciNumber(11.025),
      }
    `);
  });

  it('netpresentvalue', async () => {
    expect(
      await runCode(`netpresentvalue(10%, [-800 usd, 100, 200, 300, 400, 500])`)
    ).toMatchInlineSnapshot(`
      Object {
        "type": usd,
        "value": DeciNumber(241.144391866833826),
      }
    `);
  });

  it('paymentamounts', async () => {
    expect(await runCode(`paymentamounts(0.25%, 60 months, 20kusd)`))
      .toMatchInlineSnapshot(`
      Object {
        "type": months^-1.usd,
        "value": DeciNumber(359.373813281262787),
      }
    `);
  });
});
