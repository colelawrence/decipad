import permutations from 'just-permutations';
import { simplifyComputeResponse, getIdentifiedBlocks } from '../testUtils';
import { Computer } from './Computer';
import { ComputeRequest } from '../types';

let computer: Computer;
beforeEach(() => {
  computer = new Computer();
});

const computeOnTestComputer = async (req: ComputeRequest) => {
  const res = await computer.computeRequest(req);
  return simplifyComputeResponse(res);
};

describe('computer is independent of block-order', () => {
  const blocks = getIdentifiedBlocks(
    `MonthlyExpenses = 130000 eur`,
    `InitialMonthlyRevenue = 2500 eur`,
    `MonthlyRevenueGrowthRate = 5.0%`,
    `TimeToProfitability = ln(MonthlyExpenses / InitialMonthlyRevenue) / ln(1 + MonthlyRevenueGrowthRate)`,
    `CumulativeMonthlyRevenue = InitialMonthlyRevenue * (((1 + MonthlyRevenueGrowthRate) ** TimeToProfitability) / ln(MonthlyRevenueGrowthRate))`,
    `CumulativeMonthlyExpenses = MonthlyExpenses * TimeToProfitability`,
    `CapitalNeeded = CumulativeMonthlyRevenue - CumulativeMonthlyExpenses`,
    `IPOTargetMonthlyRevenue = 10000000 eur`,
    `TimeToIPO = ln(IPOTargetMonthlyRevenue / InitialMonthlyRevenue) / ln(1 + MonthlyRevenueGrowthRate)`
  );

  it('can sort blocks and still arrive at the same solution', async () => {
    // const program = blocks;
    // console.log(permutations(blocks).length);
    for (const program of permutations(blocks).slice(0, 1000)) {
      expect(
        // eslint-disable-next-line no-await-in-loop
        (await computeOnTestComputer({ program })).sort()
      ).toMatchInlineSnapshot(`
        Array [
          "block-0 -> 130000",
          "block-1 -> 2500",
          "block-2 -> 0.05",
          "block-3 -> 80.984431715778388",
          "block-4 -> -43395.066090392742278",
          "block-5 -> 10527976.123051190477371",
          "block-6 -> -10571371.189141583219650",
          "block-7 -> 10000000",
          "block-8 -> 169.994296622954495",
        ]
      `);
    }
  });

  it('orders table column assignments', async () => {
    const blocks = getIdentifiedBlocks(
      `HELLO = "hello"`,
      `T = { A = ["1", "2", "3"] }`,
      `T.B = ["4", "5", "6"]`,
      `T.C = A + B + HELLO`
    );
    expect((await computeOnTestComputer({ program: blocks })).sort())
      .toMatchInlineSnapshot(`
      Array [
        "block-0 -> \\"hello\\"",
        "block-1 -> [[\\"1\\",\\"2\\",\\"3\\"],[\\"4\\",\\"5\\",\\"6\\"],[\\"14hello\\",\\"25hello\\",\\"36hello\\"]]",
        "block-2 -> [\\"4\\",\\"5\\",\\"6\\"]",
        "block-3 -> [\\"14hello\\",\\"25hello\\",\\"36hello\\"]",
      ]
    `);
  });
});
