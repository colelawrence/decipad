import { simplifyComputeResponse, getIdentifiedBlocks } from '../testUtils';
import { Computer } from './Computer';
import { ComputeRequest } from '../types';

let computer: Computer;
beforeEach(() => {
  computer = new Computer();
});

let shuffles: <T extends unknown[]>(list: T) => Iterable<T>;
beforeEach(() => {
  // Linear congruential generator
  let seed = 4; /* Chosen by fair dice roll. Guaranteed to be random. */
  const m = 2 ** 32;
  const a = 1664525;
  const c = 1013904223;

  const rand = (max: number) => {
    seed = (a * seed + c) % m;
    return seed % max;
  };

  // Fisher-yates shuffle
  const shuffle = <T extends unknown[]>(list: T): T => {
    for (let i = list.length - 1; i > 0; i--) {
      const j = rand(i);
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  };

  shuffles = function* threeHundredDifferentShuffles(list) {
    for (let i = 0; i < 300; i++) {
      shuffle(list);
      yield list;
    }
  };
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
    for (const program of shuffles(blocks)) {
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
      `T = { Ayy = ["1", "2", "3"] }`,
      `T.Bee = ["4", "5", "6"]`,
      `T.Cee = Ayy + Bee + HELLO`
    );

    for (const program of shuffles(blocks)) {
      expect(
        // eslint-disable-next-line no-await-in-loop
        (await computeOnTestComputer({ program })).sort()
      ).toMatchInlineSnapshot(`
        Array [
          "block-0 -> \\"hello\\"",
          "block-1 -> [[\\"1\\", \\"2\\", \\"3\\"], [\\"4\\", \\"5\\", \\"6\\"], [\\"14hello\\", \\"25hello\\", \\"36hello\\"]]",
          "block-2 -> [\\"4\\", \\"5\\", \\"6\\"]",
          "block-3 -> [\\"14hello\\", \\"25hello\\", \\"36hello\\"]",
        ]
      `);
    }
  });
});
